ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS user_unread_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lawyer_unread_count INTEGER DEFAULT 0;

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_read_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS attachment_url TEXT,
  ADD COLUMN IF NOT EXISTS attachment_name VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_messages_conv_unread ON messages(conversation_id, is_read);
CREATE INDEX IF NOT EXISTS idx_conversations_lawyer ON conversations(lawyer_id);
