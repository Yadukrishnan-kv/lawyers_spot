CREATE TABLE IF NOT EXISTS sections (
  id SERIAL PRIMARY KEY,
  type VARCHAR(8) NOT NULL CHECK (type IN ('ipc', 'bns')),
  section_number VARCHAR(32) NOT NULL DEFAULT '',
  title VARCHAR(512) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  body TEXT DEFAULT '',
  punishment VARCHAR(255) DEFAULT '',
  category VARCHAR(128) DEFAULT '',
  status VARCHAR(16) NOT NULL DEFAULT 'active',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sections_type_slug ON sections(type, slug);
CREATE INDEX IF NOT EXISTS idx_sections_type_status ON sections(type, status);
