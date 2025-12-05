-- ============================================
-- MIGRATION: ADD SOFT DELETE SUPPORT
-- ============================================
-- Date: 2025-12-01
-- Purpose: Add is_archived column for soft delete functionality
-- Tables affected: orders, notifications, order_status_history
-- ============================================

BEGIN;

-- ============================================
-- 1. ADD is_archived TO orders TABLE
-- ============================================
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_is_archived ON orders(is_archived);

-- Add comment
COMMENT ON COLUMN orders.is_archived IS 'Soft delete flag - archived orders are hidden from UI but retained in database';

-- ============================================
-- 2. ADD is_archived TO notifications TABLE
-- ============================================
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- Create index
CREATE INDEX IF NOT EXISTS idx_notifications_is_archived ON notifications(is_archived);

-- Add comment
COMMENT ON COLUMN notifications.is_archived IS 'Soft delete flag - allows users to hide/delete notifications without permanent removal';

-- ============================================
-- 3. ADD is_archived TO order_status_history TABLE
-- ============================================
ALTER TABLE order_status_history 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- Create index
CREATE INDEX IF NOT EXISTS idx_order_status_history_is_archived ON order_status_history(is_archived);

-- Add comment
COMMENT ON COLUMN order_status_history.is_archived IS 'Soft delete flag - hidden history entries';

-- ============================================
-- 4. UPDATE admin_dashboard_stats VIEW
-- ============================================
-- Drop existing view
DROP VIEW IF EXISTS admin_dashboard_stats CASCADE;

-- Recreate with archived filter
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT
    -- Product statistics (unchanged)
    (SELECT COUNT(*) FROM products WHERE is_active = TRUE AND stock > 0)::int AS total_active_products,
    (SELECT COUNT(*) FROM products WHERE is_active = TRUE AND stock < 10 AND stock > 0)::int AS low_stock_products,
    
    -- Order statistics (exclude archived orders)
    (SELECT COUNT(*) 
     FROM orders 
     WHERE DATE(created_at) = CURRENT_DATE 
     AND is_archived = FALSE)::int AS today_orders,
    
    (SELECT COUNT(*) 
     FROM orders 
     WHERE order_status = 'pending' 
     AND is_archived = FALSE)::int AS pending_orders,
    
    -- Revenue (exclude archived orders)
    (SELECT COALESCE(SUM(total_amount), 0) 
     FROM orders 
     WHERE order_status = 'completed' 
     AND DATE(created_at) = CURRENT_DATE
     AND is_archived = FALSE) AS today_revenue,
    
    (SELECT COALESCE(SUM(total_amount), 0) 
     FROM orders 
     WHERE order_status = 'completed' 
     AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
     AND is_archived = FALSE) AS monthly_revenue,
    
    -- Customer statistics (unchanged)
    (SELECT COUNT(DISTINCT user_id) 
     FROM orders 
     WHERE is_archived = FALSE)::int AS total_customers,
    
    (SELECT COUNT(DISTINCT user_id) 
     FROM orders 
     WHERE DATE(created_at) = CURRENT_DATE
     AND is_archived = FALSE)::int AS new_customers_today;

-- Add comment
COMMENT ON VIEW admin_dashboard_stats IS 'Admin dashboard statistics - excludes archived orders';

-- ============================================
-- 5. UPDATE top_selling_products VIEW
-- ============================================
DROP VIEW IF EXISTS top_selling_products CASCADE;

CREATE OR REPLACE VIEW top_selling_products AS
SELECT 
    p.product_id,
    p.name,
    p.brand,
    p.price,
    p.stock,
    p.sold_count,
    COUNT(DISTINCT o.order_id) AS total_orders,
    COALESCE(SUM(oi.quantity), 0) AS total_quantity_sold,
    COALESCE(SUM(oi.subtotal), 0) AS total_revenue
FROM products p
LEFT JOIN order_items oi ON p.product_id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.order_id 
    AND o.order_status = 'completed'
    AND o.is_archived = FALSE  -- Exclude archived orders
WHERE p.is_active = TRUE
GROUP BY p.product_id, p.name, p.brand, p.price, p.stock, p.sold_count
ORDER BY total_quantity_sold DESC, total_revenue DESC;

COMMENT ON VIEW top_selling_products IS 'Top selling products - excludes archived orders';

-- ============================================
-- 6. UPDATE user_order_history VIEW
-- ============================================
DROP VIEW IF EXISTS user_order_history CASCADE;

CREATE OR REPLACE VIEW user_order_history AS
SELECT 
    o.order_id,
    o.order_number,
    o.user_id,
    u.name,
    u.email,
    o.customer_name,
    o.customer_phone,
    o.customer_address,
    o.order_status,
    o.payment_method,
    o.payment_status,
    o.subtotal,
    o.tax_amount,
    o.discount_amount,
    o.total_amount,
    o.coupon_code,
    o.prescription_image,
    o.prescription_verified,
    o.notes,
    o.created_at,
    o.completed_at,
    o.is_archived,
    -- Order items summary
    COUNT(oi.order_item_id) AS total_items,
    SUM(oi.quantity) AS total_quantity
FROM orders o
LEFT JOIN users u ON o.user_id = u.user_id
LEFT JOIN order_items oi ON o.order_id = oi.order_id
GROUP BY 
    o.order_id, o.order_number, o.user_id, u.name, u.email,
    o.customer_name, o.customer_phone, o.customer_address,
    o.order_status, o.payment_method, o.payment_status,
    o.subtotal, o.tax_amount, o.discount_amount, o.total_amount,
    o.coupon_code, o.prescription_image, o.prescription_verified,
    o.notes, o.created_at, o.completed_at, o.is_archived
ORDER BY o.created_at DESC;

COMMENT ON VIEW user_order_history IS 'User order history with item counts - includes is_archived for filtering';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if columns were added successfully
SELECT 
    table_name,
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE column_name = 'is_archived'
AND table_name IN ('orders', 'notifications', 'order_status_history')
ORDER BY table_name;

-- Check if indexes were created
SELECT 
    schemaname,
    tablename,
    indexname
FROM pg_indexes
WHERE indexname LIKE '%is_archived%'
ORDER BY tablename;

-- Check if views were recreated
SELECT 
    table_name,
    view_definition
FROM information_schema.views
WHERE table_name IN ('admin_dashboard_stats', 'top_selling_products', 'user_order_history')
ORDER BY table_name;

COMMIT;

-- ============================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================
-- BEGIN;
-- ALTER TABLE orders DROP COLUMN IF EXISTS is_archived;
-- ALTER TABLE notifications DROP COLUMN IF EXISTS is_archived;
-- ALTER TABLE order_status_history DROP COLUMN IF EXISTS is_archived;
-- COMMIT;
