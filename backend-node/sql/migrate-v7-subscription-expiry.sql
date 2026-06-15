ALTER TABLE lawyers ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

UPDATE lawyers
SET subscription_expires_at = NOW() + INTERVAL '30 days'
WHERE subscription_expires_at IS NULL;
