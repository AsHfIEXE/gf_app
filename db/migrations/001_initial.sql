CREATE TABLE IF NOT EXISTS gf_applications (
  id UUID PRIMARY KEY,
  report_id VARCHAR(16) NOT NULL UNIQUE,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'RECEIVED'
    CHECK (status IN ('RECEIVED', 'UNDER REVIEW', 'SHORTLISTED', 'SELECTED', 'NOT SELECTED', 'CONTACT AVAILABLE')),
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  admin_notes TEXT NOT NULL DEFAULT '',
  ratings JSONB NOT NULL DEFAULT '{}'::jsonb,
  revealed_contact JSONB
);

ALTER TABLE gf_applications
  ADD COLUMN IF NOT EXISTS published BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS gf_applications_status_created_idx
  ON gf_applications (status, created_at DESC);

CREATE TABLE IF NOT EXISTS gf_api_rate_limits (
  bucket_key CHAR(64) PRIMARY KEY,
  window_started_at TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
