ALTER TABLE articles ADD COLUMN IF NOT EXISTS lawyer_id VARCHAR(128);
CREATE INDEX IF NOT EXISTS idx_articles_lawyer_id ON articles(lawyer_id);

CREATE TABLE IF NOT EXISTS qa_answers (
  id VARCHAR(64) PRIMARY KEY,
  qa_post_id VARCHAR(64) NOT NULL REFERENCES qa_posts(id) ON DELETE CASCADE,
  lawyer_id VARCHAR(128) NOT NULL,
  lawyer_name VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qa_answers_qa_post ON qa_answers(qa_post_id);
CREATE INDEX IF NOT EXISTS idx_qa_answers_lawyer ON qa_answers(lawyer_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_qa_answers_unique_lawyer_question
  ON qa_answers(qa_post_id, lawyer_id);
