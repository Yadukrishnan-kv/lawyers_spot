CREATE TABLE IF NOT EXISTS article_lawyers (
  article_slug VARCHAR(255) NOT NULL REFERENCES articles(slug) ON DELETE CASCADE,
  lawyer_id VARCHAR(128) NOT NULL REFERENCES lawyers(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (article_slug, lawyer_id)
);

CREATE INDEX IF NOT EXISTS idx_article_lawyers_lawyer ON article_lawyers(lawyer_id);

INSERT INTO article_lawyers (article_slug, lawyer_id)
SELECT slug, lawyer_id FROM articles WHERE lawyer_id IS NOT NULL
ON CONFLICT DO NOTHING;

