-- Server-side OTP reset sessions for the lawyer forgot/create-password flow.
-- The OTP code itself is generated and validated by Twilio Verify and is never
-- stored here. This table only tracks resend cooldown, OTP verification state,
-- and a short-lived one-time reset token (stored hashed).
CREATE TABLE IF NOT EXISTS lawyer_password_resets (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  lawyer_id VARCHAR(128),
  phone VARCHAR(20) NOT NULL,
  phone_key VARCHAR(10) NOT NULL,
  otp_sent_at TIMESTAMPTZ,
  otp_verified BOOLEAN NOT NULL DEFAULT FALSE,
  token_hash VARCHAR(128),
  token_used BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_lawyer_password_resets_phone_key
  ON lawyer_password_resets(phone_key);
CREATE INDEX IF NOT EXISTS idx_lawyer_password_resets_token
  ON lawyer_password_resets(token_hash);
