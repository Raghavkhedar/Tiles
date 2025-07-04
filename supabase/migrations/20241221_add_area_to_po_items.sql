-- Add area field to purchase_order_items table
-- Migration: 20241221_add_area_to_po_items.sql

ALTER TABLE purchase_order_items 
ADD COLUMN IF NOT EXISTS area DECIMAL(10,2) DEFAULT 0;

-- Update existing records to have area calculated from quantity and product area_per_box
UPDATE purchase_order_items 
SET area = (
    SELECT COALESCE(quantity * products.area_per_box, 0)
    FROM products 
    WHERE products.id = purchase_order_items.product_id
)
WHERE product_id IS NOT NULL; 