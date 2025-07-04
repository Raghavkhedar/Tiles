-- Purchase Orders System
-- Migration: 20241220_purchase_orders.sql

-- Purchase Orders Table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    po_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    delivery_address TEXT,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    subtotal DECIMAL(12,2) DEFAULT 0,
    gst_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    balance_amount DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Sent', 'Confirmed', 'Partially Received', 'Received', 'Cancelled')),
    payment_terms VARCHAR(50),
    notes TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase Order Items Table
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(200) NOT NULL,
    sku VARCHAR(100),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    received_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_purchase_orders_user_id ON purchase_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_order_date ON purchase_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_po_id ON purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_product_id ON purchase_order_items(product_id);

-- RLS Policies for Purchase Orders
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own purchase orders" ON purchase_orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchase orders" ON purchase_orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchase orders" ON purchase_orders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own purchase orders" ON purchase_orders
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Purchase Order Items
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own purchase order items" ON purchase_order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM purchase_orders 
            WHERE purchase_orders.id = purchase_order_items.purchase_order_id 
            AND purchase_orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own purchase order items" ON purchase_order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM purchase_orders 
            WHERE purchase_orders.id = purchase_order_items.purchase_order_id 
            AND purchase_orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own purchase order items" ON purchase_order_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM purchase_orders 
            WHERE purchase_orders.id = purchase_order_items.purchase_order_id 
            AND purchase_orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own purchase order items" ON purchase_order_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM purchase_orders 
            WHERE purchase_orders.id = purchase_order_items.purchase_order_id 
            AND purchase_orders.user_id = auth.uid()
        )
    );

-- Function to generate PO number
CREATE OR REPLACE FUNCTION generate_po_number()
RETURNS TRIGGER AS $$
DECLARE
    next_number INTEGER;
    po_prefix VARCHAR(10);
BEGIN
    -- Get the next number for this user
    SELECT COALESCE(MAX(CAST(SUBSTRING(po_number FROM 4) AS INTEGER)), 0) + 1
    INTO next_number
    FROM purchase_orders
    WHERE user_id = NEW.user_id;
    
    -- Get PO prefix from settings or use default
    SELECT COALESCE(invoice_prefix, 'PO') INTO po_prefix
    FROM settings
    WHERE user_id = NEW.user_id
    LIMIT 1;
    
    -- Generate PO number
    NEW.po_number := po_prefix || LPAD(next_number::TEXT, 6, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate PO number
CREATE TRIGGER trigger_generate_po_number
    BEFORE INSERT ON purchase_orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_po_number();

-- Function to update PO totals
CREATE OR REPLACE FUNCTION update_po_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Update purchase order totals
    UPDATE purchase_orders
    SET 
        subtotal = (
            SELECT COALESCE(SUM(total_price), 0)
            FROM purchase_order_items
            WHERE purchase_order_id = COALESCE(NEW.purchase_order_id, OLD.purchase_order_id)
        ),
        total_amount = (
            SELECT COALESCE(SUM(total_price), 0)
            FROM purchase_order_items
            WHERE purchase_order_id = COALESCE(NEW.purchase_order_id, OLD.purchase_order_id)
        ),
        balance_amount = total_amount - paid_amount,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.purchase_order_id, OLD.purchase_order_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update PO totals when items change
CREATE TRIGGER trigger_update_po_totals
    AFTER INSERT OR UPDATE OR DELETE ON purchase_order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_po_totals(); 