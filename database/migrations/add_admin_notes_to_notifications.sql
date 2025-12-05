-- Migration: Add admin_notes column to notifications table
-- This allows admin notes to be stored with order status update notifications

-- Add admin_notes column to notifications table
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN notifications.admin_notes IS 'Optional notes from admin when updating order status, visible to users in their notifications';

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'notifications' AND column_name = 'admin_notes';
