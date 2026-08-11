-- Server-side reset sessions for the client forgot-password flow.
-- Supports two channels:
--   * email  — a 6-digit OTP is generated here and stored hashed (otp_hash);
--   * phone  — the OTP is generated and validated by Twilio Verify and is
--              never stored here (otp_hash stays NULL).
-- Tracks resend cooldown, verification state, and a short-lived one-time reset
-- token (stored hashed). One active session per client (keyed on user_id).
CREATE TABLE IF NOT EXISTS client_password_resets (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  channel VARCHAR(10) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  phone_key VARCHAR(10),
  otp_hash VARCHAR(128),
  otp_attempts INT NOT NULL DEFAULT 0,
  otp_sent_at TIMESTAMPTZ,
  otp_verified BOOLEAN NOT NULL DEFAULT FALSE,
  token_hash VARCHAR(128),
  token_used BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_client_password_resets_user
  ON client_password_resets(user_id);
CREATE INDEX IF NOT EXISTS idx_client_password_resets_token
  ON client_password_resets(token_hash);
