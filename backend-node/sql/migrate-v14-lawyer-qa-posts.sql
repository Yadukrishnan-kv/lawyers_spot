ALTER TABLE qa_posts ADD COLUMN IF NOT EXISTS lawyer_id VARCHAR(128);
ALTER TABLE qa_posts ADD COLUMN IF NOT EXISTS lawyer_name VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_qa_posts_lawyer_id ON qa_posts(lawyer_id);
