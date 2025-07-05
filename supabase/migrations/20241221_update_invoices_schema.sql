-- Update invoices table schema to match expected types
-- Migration: 20241221_update_invoices_schema.sql

-- Add new GST columns to invoices table
ALTER TABLE invoices 
ADD COLUMN cgst_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN sgst_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN igst_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN tax_rate DECIMAL(5,2) NOT NULL DEFAULT 18.00,
ADD COLUMN terms_conditions TEXT;

-- Update existing records to split gst_amount into cgst_amount and sgst_amount
UPDATE invoices 
SET 
  cgst_amount = gst_amount / 2,
  sgst_amount = gst_amount / 2
WHERE gst_amount > 0;

-- Drop the old gst_amount column
ALTER TABLE invoices DROP COLUMN gst_amount;

-- Update invoice_items table to match expected schema
ALTER TABLE invoice_items 
ADD COLUMN product_name TEXT NOT NULL DEFAULT '',
ADD COLUMN product_sku TEXT,
ADD COLUMN tax_rate DECIMAL(5,2) NOT NULL DEFAULT 18.00,
ADD COLUMN tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0;

-- Update existing invoice_items to populate product_name from products table
UPDATE invoice_items 
SET product_name = (
  SELECT name FROM products WHERE products.id = invoice_items.product_id
)
WHERE product_id IS NOT NULL;

-- Update existing invoice_items to calculate tax_amount
UPDATE invoice_items 
SET tax_amount = (total_price * tax_rate) / 100
WHERE total_price > 0; 