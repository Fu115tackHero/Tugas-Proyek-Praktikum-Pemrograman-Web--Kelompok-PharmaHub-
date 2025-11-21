-- ============================================
-- PHARMAHUB - SAMPLE QUERIES
-- Contoh Query yang Sering Digunakan
-- ============================================

-- ============================================
-- 1. USER MANAGEMENT QUERIES
-- ============================================

-- Get user profile dengan foto
SELECT 
    user_id,
    name,
    email,
    phone,
    role,
    ENCODE(profile_photo, 'base64') as profile_photo_base64,
    photo_mime_type,
    created_at
FROM users 
WHERE user_id = 1;

-- Get semua customers
SELECT 
    user_id,
    name,
    email,
    phone,
    created_at,
    last_login,
    CASE WHEN profile_photo IS NOT NULL THEN 'Yes' ELSE 'No' END as has_photo
FROM users 
WHERE role = 'customer' 
ORDER BY created_at DESC;

-- Update user profile
UPDATE users 
SET 
    name = 'John Doe',
    phone = '081234567890',
    updated_at = CURRENT_TIMESTAMP
WHERE user_id = 1;

-- Update profile photo (dari aplikasi, biasanya dalam base64)
-- Contoh: INSERT foto baru
UPDATE users 
SET 
    profile_photo = DECODE('base64_string_here', 'base64'),
    photo_mime_type = 'image/jpeg',
    photo_filename = 'profile.jpg',
    updated_at = CURRENT_TIMESTAMP
WHERE user_id = 1;

-- Hapus profile photo
UPDATE users 
SET 
    profile_photo = NULL,
    photo_mime_type = NULL,
    photo_filename = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE user_id = 1;

-- Get user statistics
SELECT 
    u.user_id,
    u.name,
    u.email,
    COUNT(DISTINCT o.order_id) as total_orders,
    COALESCE(SUM(CASE WHEN o.order_status = 'completed' THEN o.total_amount ELSE 0 END), 0) as total_spent,
    MAX(o.created_at) as last_order_date
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
WHERE u.user_id = 1
GROUP BY u.user_id, u.name, u.email;

-- ============================================
-- 2. PRODUCT QUERIES
-- ============================================

-- Get all active products dengan gambar
SELECT 
    p.product_id,
    p.name,
    p.brand,
    p.price,
    p.stock,
    p.prescription_required,
    c.category_name,
    ENCODE(p.main_image, 'base64') as main_image_base64,
    p.main_image_mime_type,
    p.view_count,
    p.sold_count
FROM products p
LEFT JOIN product_categories c ON p.category_id = c.category_id
WHERE p.is_active = TRUE
ORDER BY p.created_at DESC;

-- Search products by name or generic
SELECT 
    product_id,
    name,
    brand,
    generic_name,
    price,
    stock,
    ENCODE(main_image, 'base64') as image
FROM products
WHERE 
    is_active = TRUE 
    AND (
        LOWER(name) LIKE LOWER('%paracetamol%') 
        OR LOWER(generic_name) LIKE LOWER('%paracetamol%')
    )
ORDER BY name;

-- Get product detail lengkap dengan gambar tambahan
SELECT 
    p.*,
    ENCODE(p.main_image, 'base64') as main_image_base64,
    c.category_name,
    ARRAY_AGG(
        json_build_object(
            'image_id', pi.image_id,
            'image_data', ENCODE(pi.image_data, 'base64'),
            'mime_type', pi.image_mime_type,
            'order', pi.image_order
        ) ORDER BY pi.image_order
    ) FILTER (WHERE pi.image_id IS NOT NULL) as additional_images,
    ROUND(AVG(pr.rating), 1) as average_rating,
    COUNT(pr.review_id) as review_count
FROM products p
LEFT JOIN product_categories c ON p.category_id = c.category_id
LEFT JOIN product_images pi ON p.product_id = pi.product_id
LEFT JOIN product_reviews pr ON p.product_id = pr.product_id
WHERE p.product_id = 1
GROUP BY p.product_id, c.category_name;

-- Get products by category
SELECT 
    p.product_id,
    p.name,
    p.brand,
    p.price,
    p.stock,
    ENCODE(p.main_image, 'base64') as image
FROM products p
WHERE p.category_id = 1 AND p.is_active = TRUE
ORDER BY p.sold_count DESC;

-- Get featured products
SELECT 
    product_id,
    name,
    brand,
    price,
    stock,
    ENCODE(main_image, 'base64') as image,
    sold_count
FROM products
WHERE is_active = TRUE AND featured = TRUE
ORDER BY sold_count DESC
LIMIT 10;

-- Get low stock products (untuk admin)
SELECT 
    product_id,
    name,
    brand,
    stock,
    min_stock,
    (min_stock - stock) as stock_deficit
FROM products
WHERE stock < min_stock AND is_active = TRUE
ORDER BY stock ASC;

-- Insert new product dengan gambar
INSERT INTO products (
    name, brand, category_id, generic_name, price, description,
    uses, ingredients, precaution, side_effects,
    stock, min_stock, prescription_required,
    main_image, main_image_mime_type, main_image_filename,
    is_active, featured
) VALUES (
    'Paracetamol 500mg',
    'Sanbe Farma',
    1, -- category_id untuk Obat Nyeri & Demam
    'Paracetamol',
    12000,
    'Untuk menurunkan demam dan meredakan sakit kepala atau nyeri ringan.',
    'Menurunkan demam, meredakan nyeri ringan hingga sedang',
    ARRAY['Paracetamol 500 mg', 'Mikrokristalin selulosa'],
    ARRAY['Jangan melebihi dosis yang dianjurkan', 'Konsultasikan dengan dokter jika memiliki riwayat penyakit hati'],
    ARRAY['Reaksi alergi kulit (ruam, gatal)', 'Gangguan hati jika dikonsumsi berlebihan'],
    100,
    10,
    FALSE,
    DECODE('base64_image_string_here', 'base64'),
    'image/jpeg',
    'paracetamol-500mg.jpg',
    TRUE,
    TRUE
);

-- Update product stock
UPDATE products 
SET 
    stock = stock - 5,
    updated_at = CURRENT_TIMESTAMP
WHERE product_id = 1;

-- ============================================
-- 3. CART QUERIES
-- ============================================

-- Get user cart dengan detail produk
SELECT 
    c.cart_id,
    c.product_id,
    c.quantity,
    p.name,
    p.brand,
    p.price,
    p.stock,
    p.prescription_required,
    ENCODE(p.main_image, 'base64') as product_image,
    (c.quantity * p.price) as subtotal
FROM cart_items c
JOIN products p ON c.product_id = p.product_id
WHERE c.user_id = 1 AND p.is_active = TRUE
ORDER BY c.added_at DESC;

-- Add item to cart
INSERT INTO cart_items (user_id, product_id, quantity)
VALUES (1, 5, 2)
ON CONFLICT (user_id, product_id) 
DO UPDATE SET 
    quantity = cart_items.quantity + EXCLUDED.quantity,
    updated_at = CURRENT_TIMESTAMP;

-- Update cart item quantity
UPDATE cart_items 
SET 
    quantity = 5,
    updated_at = CURRENT_TIMESTAMP
WHERE cart_id = 1;

-- Remove item from cart
DELETE FROM cart_items 
WHERE cart_id = 1 AND user_id = 1;

-- Clear all cart for user
DELETE FROM cart_items 
WHERE user_id = 1;

-- Get cart total
SELECT 
    COUNT(*) as total_items,
    SUM(c.quantity) as total_quantity,
    SUM(c.quantity * p.price) as total_amount
FROM cart_items c
JOIN products p ON c.product_id = p.product_id
WHERE c.user_id = 1;

-- Move item to saved for later
INSERT INTO saved_for_later (user_id, product_id)
SELECT user_id, product_id 
FROM cart_items 
WHERE cart_id = 1
ON CONFLICT (user_id, product_id) DO NOTHING;

DELETE FROM cart_items WHERE cart_id = 1;

-- Get saved for later items
SELECT 
    s.saved_id,
    s.product_id,
    p.name,
    p.brand,
    p.price,
    p.stock,
    ENCODE(p.main_image, 'base64') as product_image,
    s.saved_at
FROM saved_for_later s
JOIN products p ON s.product_id = p.product_id
WHERE s.user_id = 1 AND p.is_active = TRUE
ORDER BY s.saved_at DESC;

-- ============================================
-- 4. ORDER QUERIES
-- ============================================

-- Create new order
WITH new_order AS (
    INSERT INTO orders (
        order_number,
        user_id,
        customer_name,
        customer_email,
        customer_phone,
        subtotal,
        tax_amount,
        discount_amount,
        total_amount,
        payment_method,
        payment_status,
        order_status,
        notes
    ) VALUES (
        generate_order_number(),
        1,
        'John Doe',
        'john@example.com',
        '081234567890',
        100000,
        10000,
        0,
        110000,
        'bayar_ditempat',
        'unpaid',
        'pending',
        'Tolong sediakan kantong plastik'
    )
    RETURNING order_id, order_number
)
INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal)
SELECT 
    no.order_id,
    c.product_id,
    p.name,
    p.price,
    c.quantity,
    (c.quantity * p.price)
FROM new_order no
CROSS JOIN cart_items c
JOIN products p ON c.product_id = p.product_id
WHERE c.user_id = 1
RETURNING *;

-- Get order detail dengan items
SELECT 
    o.order_id,
    o.order_number,
    o.customer_name,
    o.customer_phone,
    o.total_amount,
    o.order_status,
    o.payment_status,
    o.payment_method,
    o.created_at,
    json_agg(
        json_build_object(
            'product_name', oi.product_name,
            'quantity', oi.quantity,
            'price', oi.product_price,
            'subtotal', oi.subtotal
        )
    ) as items
FROM orders o
LEFT JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.order_id = 1
GROUP BY o.order_id;

-- Get user order history
SELECT 
    o.order_id,
    o.order_number,
    o.total_amount,
    o.order_status,
    o.payment_status,
    o.created_at,
    COUNT(oi.order_item_id) as total_items
FROM orders o
LEFT JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.user_id = 1
GROUP BY o.order_id
ORDER BY o.created_at DESC;

-- Update order status
UPDATE orders 
SET 
    order_status = 'confirmed',
    updated_at = CURRENT_TIMESTAMP
WHERE order_id = 1;

-- Update payment status
UPDATE orders 
SET 
    payment_status = 'paid',
    updated_at = CURRENT_TIMESTAMP
WHERE order_id = 1 AND payment_method = 'midtrans_online';

-- Cancel order
UPDATE orders 
SET 
    order_status = 'cancelled',
    cancellation_reason = 'Customer request',
    cancelled_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE order_id = 1 AND order_status = 'pending';

-- Complete order
UPDATE orders 
SET 
    order_status = 'completed',
    completed_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE order_id = 1 AND order_status = 'ready';

-- Get orders by status (untuk admin)
SELECT 
    o.order_id,
    o.order_number,
    o.customer_name,
    o.customer_phone,
    o.total_amount,
    o.payment_method,
    o.payment_status,
    o.created_at,
    COUNT(oi.order_item_id) as total_items
FROM orders o
LEFT JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.order_status = 'pending'
GROUP BY o.order_id
ORDER BY o.created_at ASC;

-- Get today's orders
SELECT 
    order_id,
    order_number,
    customer_name,
    total_amount,
    order_status,
    payment_status,
    created_at
FROM orders
WHERE DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;

-- ============================================
-- 5. NOTIFICATION QUERIES
-- ============================================

-- Get user notifications
SELECT 
    notification_id,
    type,
    title,
    message,
    icon_type,
    is_read,
    related_order_id,
    created_at,
    ENCODE(notification_image, 'base64') as image
FROM notifications
WHERE user_id = 1
ORDER BY created_at DESC
LIMIT 50;

-- Get unread notifications count
SELECT COUNT(*) as unread_count
FROM notifications
WHERE user_id = 1 AND is_read = FALSE;

-- Mark notification as read
UPDATE notifications 
SET 
    is_read = TRUE,
    read_at = CURRENT_TIMESTAMP
WHERE notification_id = 1 AND user_id = 1;

-- Mark all notifications as read
UPDATE notifications 
SET 
    is_read = TRUE,
    read_at = CURRENT_TIMESTAMP
WHERE user_id = 1 AND is_read = FALSE;

-- Delete old notifications (older than 90 days)
DELETE FROM notifications
WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '90 days';

-- Create manual notification
INSERT INTO notifications (user_id, type, title, message, icon_type)
VALUES (
    1,
    'promotion',
    'Promo Spesial!',
    'Dapatkan diskon 20% untuk semua produk vitamin!',
    'info'
);

-- ============================================
-- 6. COUPON QUERIES
-- ============================================

-- Validate coupon
SELECT 
    coupon_id,
    code,
    discount_type,
    discount_value,
    min_purchase,
    max_discount,
    usage_limit,
    usage_per_user,
    (SELECT COUNT(*) FROM coupon_usage WHERE coupon_id = c.coupon_id) as times_used,
    (SELECT COUNT(*) FROM coupon_usage WHERE coupon_id = c.coupon_id AND user_id = 1) as user_usage_count
FROM coupons c
WHERE 
    code = 'SEHAT10'
    AND is_active = TRUE
    AND CURRENT_TIMESTAMP BETWEEN start_date AND end_date
    AND (usage_limit IS NULL OR (SELECT COUNT(*) FROM coupon_usage WHERE coupon_id = c.coupon_id) < usage_limit);

-- Apply coupon to order
INSERT INTO coupon_usage (coupon_id, user_id, order_id, discount_amount)
VALUES (1, 1, 5, 10000);

-- Get available coupons for user
SELECT 
    c.coupon_id,
    c.code,
    c.description,
    c.discount_type,
    c.discount_value,
    c.min_purchase,
    c.end_date,
    (SELECT COUNT(*) FROM coupon_usage cu WHERE cu.coupon_id = c.coupon_id AND cu.user_id = 1) as user_usage_count
FROM coupons c
WHERE 
    c.is_active = TRUE
    AND CURRENT_TIMESTAMP BETWEEN c.start_date AND c.end_date
    AND (c.usage_limit IS NULL OR (SELECT COUNT(*) FROM coupon_usage WHERE coupon_id = c.coupon_id) < c.usage_limit)
    AND (SELECT COUNT(*) FROM coupon_usage cu WHERE cu.coupon_id = c.coupon_id AND cu.user_id = 1) < c.usage_per_user
ORDER BY c.discount_value DESC;

-- ============================================
-- 7. REVIEW QUERIES
-- ============================================

-- Get product reviews
SELECT 
    pr.review_id,
    pr.rating,
    pr.comment,
    pr.is_verified_purchase,
    pr.helpful_count,
    pr.created_at,
    u.name as reviewer_name,
    ENCODE(u.profile_photo, 'base64') as reviewer_photo
FROM product_reviews pr
JOIN users u ON pr.user_id = u.user_id
WHERE pr.product_id = 1
ORDER BY pr.created_at DESC;

-- Add review
INSERT INTO product_reviews (product_id, user_id, rating, comment, is_verified_purchase)
VALUES (1, 1, 5, 'Produk sangat bagus, cepat sembuh!', TRUE);

-- Get average rating
SELECT 
    product_id,
    COUNT(*) as review_count,
    ROUND(AVG(rating), 1) as average_rating,
    COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
    COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
    COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
    COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
    COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
FROM product_reviews
WHERE product_id = 1
GROUP BY product_id;

-- ============================================
-- 8. ADMIN DASHBOARD QUERIES
-- ============================================

-- Get dashboard statistics
SELECT * FROM admin_dashboard_stats;

-- Get sales summary for period
SELECT 
    DATE(created_at) as order_date,
    COUNT(*) as total_orders,
    COUNT(CASE WHEN order_status = 'completed' THEN 1 END) as completed_orders,
    SUM(CASE WHEN order_status = 'completed' THEN total_amount ELSE 0 END) as total_revenue
FROM orders
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY order_date DESC;

-- Get top selling products
SELECT * FROM top_selling_products
LIMIT 10;

-- Get recent admin activities
SELECT 
    al.log_id,
    al.action_type,
    al.description,
    al.created_at,
    u.name as admin_name
FROM admin_activity_logs al
JOIN users u ON al.admin_id = u.user_id
ORDER BY al.created_at DESC
LIMIT 50;

-- Log admin activity
INSERT INTO admin_activity_logs (admin_id, action_type, target_type, target_id, description, old_values, new_values)
VALUES (
    1, -- admin_id
    'update_product',
    'product',
    5,
    'Updated product stock',
    '{"stock": 50}'::jsonb,
    '{"stock": 45}'::jsonb
);

-- Get customer statistics
SELECT 
    COUNT(*) as total_customers,
    COUNT(CASE WHEN DATE(created_at) >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as new_this_week,
    COUNT(CASE WHEN DATE(created_at) >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_this_month
FROM users
WHERE role = 'customer';

-- Get revenue by payment method
SELECT 
    payment_method,
    COUNT(*) as order_count,
    SUM(total_amount) as total_revenue
FROM orders
WHERE order_status = 'completed'
    AND DATE(created_at) >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY payment_method
ORDER BY total_revenue DESC;

-- ============================================
-- 9. REPORTING QUERIES
-- ============================================

-- Monthly sales report
SELECT 
    TO_CHAR(created_at, 'YYYY-MM') as month,
    COUNT(*) as total_orders,
    COUNT(CASE WHEN order_status = 'completed' THEN 1 END) as completed_orders,
    SUM(CASE WHEN order_status = 'completed' THEN total_amount ELSE 0 END) as total_revenue,
    SUM(CASE WHEN order_status = 'completed' THEN discount_amount ELSE 0 END) as total_discounts,
    AVG(CASE WHEN order_status = 'completed' THEN total_amount ELSE NULL END) as avg_order_value
FROM orders
GROUP BY TO_CHAR(created_at, 'YYYY-MM')
ORDER BY month DESC;

-- Product performance report
SELECT 
    p.product_id,
    p.name,
    p.brand,
    p.category_id,
    c.category_name,
    p.stock,
    p.sold_count,
    COUNT(DISTINCT oi.order_id) as order_count,
    SUM(oi.quantity) as total_quantity_sold,
    SUM(oi.subtotal) as total_revenue,
    AVG(pr.rating) as avg_rating
FROM products p
LEFT JOIN product_categories c ON p.category_id = c.category_id
LEFT JOIN order_items oi ON p.product_id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.order_id AND o.order_status = 'completed'
LEFT JOIN product_reviews pr ON p.product_id = pr.product_id
WHERE p.is_active = TRUE
GROUP BY p.product_id, p.name, p.brand, p.category_id, c.category_name, p.stock, p.sold_count
ORDER BY total_revenue DESC NULLS LAST;

-- Customer lifetime value
SELECT 
    u.user_id,
    u.name,
    u.email,
    COUNT(o.order_id) as total_orders,
    SUM(CASE WHEN o.order_status = 'completed' THEN o.total_amount ELSE 0 END) as lifetime_value,
    MIN(o.created_at) as first_order_date,
    MAX(o.created_at) as last_order_date
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
WHERE u.role = 'customer'
GROUP BY u.user_id, u.name, u.email
HAVING COUNT(o.order_id) > 0
ORDER BY lifetime_value DESC;

-- ============================================
-- 10. MAINTENANCE QUERIES
-- ============================================

-- Cleanup expired password reset tokens
DELETE FROM password_reset_tokens
WHERE expires_at < CURRENT_TIMESTAMP OR used = TRUE;

-- Cleanup old notifications
DELETE FROM notifications
WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '90 days';

-- Update product view count
UPDATE products 
SET view_count = view_count + 1
WHERE product_id = 1;

-- Recalculate sold count (if needed)
UPDATE products p
SET sold_count = (
    SELECT COALESCE(SUM(oi.quantity), 0)
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.order_id
    WHERE oi.product_id = p.product_id
    AND o.order_status = 'completed'
);

-- Check database size
SELECT 
    pg_size_pretty(pg_database_size(current_database())) as database_size;

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================
-- END OF SAMPLE QUERIES
-- ============================================
