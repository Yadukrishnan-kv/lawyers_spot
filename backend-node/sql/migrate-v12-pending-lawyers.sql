CREATE TABLE IF NOT EXISTS lawyer_pending (
  id SERIAL PRIMARY KEY,
  enrollment_no VARCHAR(64),
  name VARCHAR(255) NOT NULL,
  father_name VARCHAR(255),
  mobile VARCHAR(32),
  email VARCHAR(255),
  gender VARCHAR(16),
  district VARCHAR(128),
  state VARCHAR(128),
  bar_council VARCHAR(255),
  practice_areas TEXT,
  status VARCHAR(16) NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  verified_by VARCHAR(64),
  verified_at TIMESTAMPTZ,
  rejected_by VARCHAR(64),
  rejected_at TIMESTAMPTZ,
  import_batch_id VARCHAR(64),
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lawyer_pending_status ON lawyer_pending(status);
CREATE INDEX IF NOT EXISTS idx_lawyer_pending_district ON lawyer_pending(district);
CREATE INDEX IF NOT EXISTS idx_lawyer_pending_import_batch ON lawyer_pending(import_batch_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_pending_enrollment ON lawyer_pending(enrollment_no);
