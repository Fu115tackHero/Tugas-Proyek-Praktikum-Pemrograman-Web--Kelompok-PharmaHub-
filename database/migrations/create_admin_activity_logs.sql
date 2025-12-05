-- Drop existing table if it exists
DROP TABLE IF EXISTS admin_activity_logs CASCADE;

-- Create admin_activity_logs table
CREATE TABLE admin_activity_logs (
    log_id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    entity_name VARCHAR(255),
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_admin_activity_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX idx_admin_activity_created_at ON admin_activity_logs(created_at DESC);
CREATE INDEX idx_admin_activity_entity ON admin_activity_logs(entity_type, entity_id);
