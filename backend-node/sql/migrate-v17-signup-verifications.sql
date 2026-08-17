-- Staging table for OTP-gated signup. Client/lawyer signup form data and a
-- hashed password are held here until phone (and, for lawyers, email) OTP
-- verification completes; only then is the real platform_users/lawyers row
-- created. One pending row per (role, email).
CREATE TABLE IF NOT EXISTS signup_verifications (
  id VARCHAR(64) PRIMARY KEY,
  role VARCHAR(16) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  phone_key VARCHAR(10) NOT NULL,
  bar_id VARCHAR(64),
  city_slug VARCHAR(128),
  practice VARCHAR(64),
  phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  email_otp_hash VARCHAR(128),
  email_otp_attempts INT NOT NULL DEFAULT 0,
  email_otp_sent_at TIMESTAMPTZ,
  phone_otp_sent_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_signup_verifications_role_email
  ON signup_verifications(role, lower(email));

ALTER TABLE platform_users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN NOT NULL DEFAULT FALSE;
