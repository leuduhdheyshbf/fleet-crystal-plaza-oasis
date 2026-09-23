CREATE TABLE IF NOT EXISTS workspace_snapshots (
  user_id TEXT PRIMARY KEY,
  snapshot JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workspace_snapshots_updated_at_idx
  ON workspace_snapshots (updated_at);
