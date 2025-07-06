-- Add expenses table for proper P&L and cash flow tracking
-- Migration: 20241221_add_expenses_table.sql

-- Create expenses table
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expense_date DATE NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_method TEXT DEFAULT 'Cash',
    reference_number TEXT,
    notes TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expense categories table for better organization
CREATE TABLE expense_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expense_categories_user_id ON expense_categories(user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for expenses
CREATE POLICY "Users can view their own expenses" ON expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own expenses" ON expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own expenses" ON expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own expenses" ON expenses FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for expense_categories
CREATE POLICY "Users can view their own expense categories" ON expense_categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own expense categories" ON expense_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own expense categories" ON expense_categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own expense categories" ON expense_categories FOR DELETE USING (auth.uid() = user_id);

-- Insert default expense categories
INSERT INTO expense_categories (name, description, user_id) VALUES
('Salaries', 'Employee salaries and wages', (SELECT id FROM auth.users LIMIT 1)),
('Rent', 'Office and warehouse rent', (SELECT id FROM auth.users LIMIT 1)),
('Utilities', 'Electricity, water, internet, etc.', (SELECT id FROM auth.users LIMIT 1)),
('Marketing', 'Advertising and promotional expenses', (SELECT id FROM auth.users LIMIT 1)),
('Transportation', 'Fuel, vehicle maintenance, delivery costs', (SELECT id FROM auth.users LIMIT 1)),
('Office Supplies', 'Stationery, equipment, etc.', (SELECT id FROM auth.users LIMIT 1)),
('Insurance', 'Business insurance premiums', (SELECT id FROM auth.users LIMIT 1)),
('Taxes', 'Business taxes and licenses', (SELECT id FROM auth.users LIMIT 1)),
('Other', 'Miscellaneous expenses', (SELECT id FROM auth.users LIMIT 1)); 