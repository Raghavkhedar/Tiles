-- Billing System Tables
-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    cgst_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    sgst_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    igst_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 18.00,
    payment_terms VARCHAR(50) DEFAULT '30 days',
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    notes TEXT,
    terms_conditions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Invoice items table
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100),
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 18.00,
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'cash',
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Tax rates table for different GST slabs
CREATE TABLE IF NOT EXISTS tax_rates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    rate DECIMAL(5,2) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default tax rates
INSERT INTO tax_rates (name, rate, description) VALUES
('GST 0%', 0.00, 'Zero rated goods'),
('GST 5%', 5.00, 'Reduced rate for essential goods'),
('GST 12%', 12.00, 'Standard rate for some goods'),
('GST 18%', 18.00, 'Standard GST rate'),
('GST 28%', 28.00, 'Luxury goods rate');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS VARCHAR(50) AS $$
DECLARE
    next_number INTEGER;
    invoice_number VARCHAR(50);
BEGIN
    -- Get the next number
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 4) AS INTEGER)), 0) + 1
    INTO next_number
    FROM invoices
    WHERE invoice_number LIKE 'INV%';
    
    -- Format as INV + 6 digit number
    invoice_number := 'INV' || LPAD(next_number::TEXT, 6, '0');
    
    RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate invoice totals
CREATE OR REPLACE FUNCTION calculate_invoice_totals(invoice_uuid UUID)
RETURNS VOID AS $$
DECLARE
    invoice_record RECORD;
    subtotal DECIMAL(12,2) := 0;
    total_tax DECIMAL(12,2) := 0;
    total_discount DECIMAL(12,2) := 0;
BEGIN
    -- Get invoice details
    SELECT * INTO invoice_record FROM invoices WHERE id = invoice_uuid;
    
    -- Calculate totals from invoice items
    SELECT 
        COALESCE(SUM(total_price), 0),
        COALESCE(SUM(tax_amount), 0),
        COALESCE(SUM(discount_amount), 0)
    INTO subtotal, total_tax, total_discount
    FROM invoice_items 
    WHERE invoice_id = invoice_uuid;
    
    -- Update invoice with calculated totals
    UPDATE invoices 
    SET 
        subtotal = subtotal,
        total_amount = subtotal + total_tax - total_discount,
        cgst_amount = CASE 
            WHEN invoice_record.customer_id IN (
                SELECT id FROM customers WHERE state = 'Maharashtra'
            ) THEN total_tax / 2
            ELSE 0
        END,
        sgst_amount = CASE 
            WHEN invoice_record.customer_id IN (
                SELECT id FROM customers WHERE state = 'Maharashtra'
            ) THEN total_tax / 2
            ELSE 0
        END,
        igst_amount = CASE 
            WHEN invoice_record.customer_id NOT IN (
                SELECT id FROM customers WHERE state = 'Maharashtra'
            ) THEN total_tax
            ELSE 0
        END,
        discount_amount = total_discount,
        updated_at = NOW()
    WHERE id = invoice_uuid;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate invoice totals
CREATE OR REPLACE FUNCTION trigger_calculate_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM calculate_invoice_totals(NEW.invoice_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_invoice_totals_trigger
    AFTER INSERT OR UPDATE OR DELETE ON invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION trigger_calculate_invoice_totals();

-- Function to check overdue invoices
CREATE OR REPLACE FUNCTION check_overdue_invoices()
RETURNS VOID AS $$
BEGIN
    UPDATE invoices 
    SET status = 'overdue'
    WHERE due_date < CURRENT_DATE 
    AND status IN ('sent', 'draft')
    AND total_amount > 0;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own invoices" ON invoices
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoices" ON invoices
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices" ON invoices
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own invoice items" ON invoice_items
    FOR SELECT USING (
        invoice_id IN (SELECT id FROM invoices WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert their own invoice items" ON invoice_items
    FOR INSERT WITH CHECK (
        invoice_id IN (SELECT id FROM invoices WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update their own invoice items" ON invoice_items
    FOR UPDATE USING (
        invoice_id IN (SELECT id FROM invoices WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can view their own payments" ON payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments" ON payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view tax rates" ON tax_rates
    FOR SELECT USING (true); 