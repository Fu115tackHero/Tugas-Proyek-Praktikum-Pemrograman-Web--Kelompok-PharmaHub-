-- ============================================
-- MIGRATION: Add is_hidden_from_user column to order_status_history
-- Purpose: Separate user-side history deletion from admin-side archive
-- 
-- DESIGN RATIONALE:
-- - orders.is_archived = TRUE  → Admin archives order (hidden from admin panel)
-- - order_status_history.is_hidden_from_user = TRUE → User deletes from their history
-- - These two operations are INDEPENDENT and don't affect each other
-- 
-- SCENARIOS:
-- 1. Admin archives order → User still sees in History page
-- 2. User deletes from history → Admin still sees in OrderManagement
-- 3. Both can happen independently without conflicts
-- ============================================

-- Add column to order_status_history
ALTER TABLE order_status_history
ADD COLUMN IF NOT EXISTS is_hidden_from_user BOOLEAN DEFAULT FALSE;

-- Create index for faster queries (user history filtering)
CREATE INDEX IF NOT EXISTS idx_order_status_history_hidden 
ON order_status_history(order_id, is_hidden_from_user);

-- Add comment for documentation
COMMENT ON COLUMN order_status_history.is_hidden_from_user IS 
'TRUE when user deletes order from their history view. Independent from orders.is_archived (admin archive).';

-- Verify the column was added
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'order_status_history' 
        AND column_name = 'is_hidden_from_user'
    ) THEN
        RAISE NOTICE '✅ Column is_hidden_from_user added successfully to order_status_history';
    ELSE
        RAISE EXCEPTION '❌ Failed to add column is_hidden_from_user';
    END IF;
END $$;
