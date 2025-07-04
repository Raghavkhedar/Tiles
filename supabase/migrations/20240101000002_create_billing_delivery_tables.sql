-- Create billing and delivery tables for TileManager Pro
-- Migration: 20240101000002_create_billing_delivery_tables.sql

-- Create invoices table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
    gst_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    balance_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'Pending',
    payment_terms TEXT DEFAULT '30 days',
    notes TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoice_items table
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL,
    area_covered DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_method TEXT NOT NULL,
    reference_number TEXT,
    notes TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deliveries table
CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delivery_number TEXT UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    delivery_date DATE NOT NULL,
    delivery_address TEXT,
    contact_person TEXT,
    phone TEXT,
    status TEXT DEFAULT 'Scheduled',
    notes TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create delivery_items table
CREATE TABLE delivery_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    area_covered DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_product_id ON invoice_items(product_id);
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_deliveries_user_id ON deliveries(user_id);
CREATE INDEX idx_deliveries_customer_id ON deliveries(customer_id);
CREATE INDEX idx_delivery_items_delivery_id ON delivery_items(delivery_id);
CREATE INDEX idx_delivery_items_product_id ON delivery_items(product_id);

-- Create triggers for updated_at
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON deliveries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for invoices
CREATE POLICY "Users can view their own invoices" ON invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own invoices" ON invoices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own invoices" ON invoices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own invoices" ON invoices FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for invoice_items
CREATE POLICY "Users can view their own invoice items" ON invoice_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid())
);
CREATE POLICY "Users can insert their own invoice items" ON invoice_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid())
);
CREATE POLICY "Users can update their own invoice items" ON invoice_items FOR UPDATE USING (
    EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid())
);
CREATE POLICY "Users can delete their own invoice items" ON invoice_items FOR DELETE USING (
    EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid())
);

-- Create RLS policies for payments
CREATE POLICY "Users can view their own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own payments" ON payments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own payments" ON payments FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for deliveries
CREATE POLICY "Users can view their own deliveries" ON deliveries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own deliveries" ON deliveries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own deliveries" ON deliveries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own deliveries" ON deliveries FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for delivery_items
CREATE POLICY "Users can view their own delivery items" ON delivery_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM deliveries WHERE deliveries.id = delivery_items.delivery_id AND deliveries.user_id = auth.uid())
);
CREATE POLICY "Users can insert their own delivery items" ON delivery_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM deliveries WHERE deliveries.id = delivery_items.delivery_id AND deliveries.user_id = auth.uid())
);
CREATE POLICY "Users can update their own delivery items" ON delivery_items FOR UPDATE USING (
    EXISTS (SELECT 1 FROM deliveries WHERE deliveries.id = delivery_items.delivery_id AND deliveries.user_id = auth.uid())
);
CREATE POLICY "Users can delete their own delivery items" ON delivery_items FOR DELETE USING (
    EXISTS (SELECT 1 FROM deliveries WHERE deliveries.id = delivery_items.delivery_id AND deliveries.user_id = auth.uid())
); 