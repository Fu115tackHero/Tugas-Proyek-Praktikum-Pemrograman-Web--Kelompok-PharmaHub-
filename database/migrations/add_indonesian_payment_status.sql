-- Migration: Add Indonesian payment status values
-- Date: 2025-12-05
-- Description: Update payment_status constraint to support Indonesian status values
--              and migrate existing data from English to Indonesian

-- Step 1: Drop the old constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS check_payment_status;

-- Step 2: Add new constraint with both English and Indonesian values
-- (keeping English for backward compatibility during transition)
ALTER TABLE orders ADD CONSTRAINT check_payment_status 
  CHECK (payment_status IN ('pending', 'dibayar', 'belum_dibayar', 'failed', 'refunded', 'paid', 'unpaid'));

-- Step 3: Migrate existing data
-- Convert 'paid' to 'dibayar'
UPDATE orders 
SET payment_status = 'dibayar' 
WHERE payment_status = 'paid';

-- Convert 'unpaid' to 'belum_dibayar'
UPDATE orders 
SET payment_status = 'belum_dibayar' 
WHERE payment_status = 'unpaid';

-- Step 4: Set correct payment_status for bayar_ditempat orders
-- If order is completed and method is bayar_ditempat, mark as 'dibayar'
UPDATE orders
SET payment_status = 'dibayar'
WHERE payment_method = 'bayar_ditempat' 
  AND order_status = 'completed'
  AND payment_status != 'dibayar';

-- If order is not completed and method is bayar_ditempat, mark as 'belum_dibayar'
UPDATE orders
SET payment_status = 'belum_dibayar'
WHERE payment_method = 'bayar_ditempat' 
  AND order_status != 'completed'
  AND payment_status NOT IN ('dibayar', 'belum_dibayar');

-- Verification queries (commented out, uncomment to check)
-- SELECT payment_status, COUNT(*) as count FROM orders GROUP BY payment_status;
-- SELECT payment_method, payment_status, order_status, COUNT(*) FROM orders GROUP BY payment_method, payment_status, order_status;
