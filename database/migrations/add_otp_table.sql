-- Migration: Add OTP table for email verification
-- Date: December 5, 2025

-- Create OTP codes table
CREATE TABLE IF NOT EXISTS otp_codes (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('register', 'reset-password')),
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(email, type)
);

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_codes(expires_at);

-- Add pending_verification column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pending_verification BOOLEAN DEFAULT false;

COMMENT ON TABLE otp_codes IS 'Stores OTP codes for email verification and password reset';
COMMENT ON COLUMN users.email_verified IS 'Whether user has verified their email';
COMMENT ON COLUMN users.pending_verification IS 'User registered but not verified yet';
