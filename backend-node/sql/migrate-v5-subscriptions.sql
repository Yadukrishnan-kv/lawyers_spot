CREATE TABLE IF NOT EXISTS subscription_plans (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price_monthly INTEGER NOT NULL DEFAULT 0,
  currency VARCHAR(8) NOT NULL DEFAULT 'INR',
  description TEXT,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  highlight BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO subscription_plans (id, name, price_monthly, currency, description, features, highlight, sort_order, active)
VALUES
  (
    'basic',
    'Starter',
    999,
    'INR',
    'Essential listing for new advocates building their practice.',
    '["Profile listing","Up to 5 bookings/month","Email support","Standard search placement"]'::jsonb,
    false,
    1,
    true
  ),
  (
    'professional',
    'Professional',
    2499,
    'INR',
    'Grow visibility with priority placement and more client leads.',
    '["Everything in Starter","Priority search placement","Unlimited bookings","Phone support","Featured badge eligible"]'::jsonb,
    true,
    2,
    true
  ),
  (
    'premium',
    'Premium',
    4999,
    'INR',
    'Maximum exposure for established practices and firms.',
    '["Everything in Professional","Homepage featured slots","Top Rated badge eligible","Dedicated account manager","Analytics dashboard"]'::jsonb,
    false,
    3,
    true
  )
ON CONFLICT (id) DO NOTHING;

ALTER TABLE lawyers ADD COLUMN IF NOT EXISTS subscription_plan_id VARCHAR(32) REFERENCES subscription_plans(id);
ALTER TABLE lawyers ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE lawyers ADD COLUMN IF NOT EXISTS top_rated BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE lawyers SET subscription_plan_id = 'basic' WHERE subscription_plan_id IS NULL;
