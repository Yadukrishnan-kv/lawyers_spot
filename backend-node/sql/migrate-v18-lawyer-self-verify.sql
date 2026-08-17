-- OTP/cooldown state for a logged-in lawyer self-verifying their own email
-- or phone (e.g. accounts created via admin bulk-import that never went
-- through the signup OTP flow). Phone OTPs are generated/validated by Twilio
-- Verify, so phone_otp_sent_at here is only for the resend cooldown.
CREATE TABLE IF NOT EXISTS lawyer_self_verifications (
  lawyer_id VARCHAR(128) PRIMARY KEY,
  email_otp_hash VARCHAR(128),
  email_otp_attempts INT NOT NULL DEFAULT 0,
  email_otp_sent_at TIMESTAMPTZ,
  email_expires_at TIMESTAMPTZ,
  phone_otp_sent_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
