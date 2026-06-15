-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_lawyers_city_slug ON lawyers(city_slug);
CREATE INDEX IF NOT EXISTS idx_lawyers_practice ON lawyers(practice);
CREATE INDEX IF NOT EXISTS idx_lawyers_slug ON lawyers(slug);
CREATE INDEX IF NOT EXISTS idx_platform_users_email ON platform_users(email);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_qa_posts_slug ON qa_posts(slug);
CREATE INDEX IF NOT EXISTS idx_qa_posts_status ON qa_posts(status);
CREATE INDEX IF NOT EXISTS idx_bookings_lawyer_id ON bookings(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Audit log for admin/sensitive actions (no PII in payload)
CREATE TABLE IF NOT EXISTS security_audit_log (
  id BIGSERIAL PRIMARY KEY,
  action VARCHAR(64) NOT NULL,
  actor_id VARCHAR(128),
  ip_hash VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_audit_created ON security_audit_log(created_at DESC);
