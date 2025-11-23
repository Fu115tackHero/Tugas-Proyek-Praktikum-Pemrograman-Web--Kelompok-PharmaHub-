-- ============================================
-- SEED DEMO USERS FOR TESTING
-- ============================================
-- Password untuk semua akun demo:
-- Customer: "customer123"
-- Admin: "admin123"

-- Demo Customer (Password: customer123)
-- Hash: $2b$10$7NpDBL/TqK6uheuj3xdMyuJkjMWcDvOdXOShSSJI286m7BQUV0Aiq
INSERT INTO users (name, email, password_hash, phone, role, is_active, email_verified)
VALUES (
  'Demo Customer',
  'customer@pharmahub.com',
  '$2b$10$7NpDBL/TqK6uheuj3xdMyuJkjMWcDvOdXOShSSJI286m7BQUV0Aiq',
  '081234567890',
  'customer',
  TRUE,
  TRUE
) ON CONFLICT (email) DO NOTHING;

-- Demo Admin (Password: admin123)
-- Hash: $2b$10$BmYPAY40FAjCbJ96R72.5escxzSBwB0y8kMiWq6HWGtK4jPBXObLK
INSERT INTO users (name, email, password_hash, phone, role, is_active, email_verified)
VALUES (
  'Demo Admin',
  'admin@pharmahub.com',
  '$2b$10$BmYPAY40FAjCbJ96R72.5escxzSBwB0y8kMiWq6HWGtK4jPBXObLK',
  '081234567891',
  'admin',
  TRUE,
  TRUE
) ON CONFLICT (email) DO NOTHING;

-- Add demo address for customer
-- Get the user_id for Demo Customer first, then insert address
INSERT INTO user_addresses (
  user_id, 
  address_label, 
  recipient_name, 
  phone, 
  full_address, 
  city, 
  province, 
  postal_code, 
  is_default
)
SELECT 
  user_id,
  'Rumah',
  'Demo Customer',
  '081234567890',
  'Jl. Demo Customer No. 123, RT 01/RW 02',
  'Jakarta Selatan',
  'DKI Jakarta',
  '12345',
  TRUE
FROM users 
WHERE email = 'customer@pharmahub.com'
ON CONFLICT DO NOTHING;

-- Display inserted users
SELECT user_id, name, email, role, phone, is_active, email_verified, created_at 
FROM users 
WHERE email IN ('customer@pharmahub.com', 'admin@pharmahub.com')
ORDER BY user_id;
