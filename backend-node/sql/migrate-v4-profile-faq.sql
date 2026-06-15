-- Lawyer profile FAQ (editable from admin)
ALTER TABLE lawyers ADD COLUMN IF NOT EXISTS profile_faq JSONB;
