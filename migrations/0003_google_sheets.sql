CREATE TABLE IF NOT EXISTS google_sheets_connections (
  user_id TEXT PRIMARY KEY,
  refresh_token TEXT NOT NULL,
  scope TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS google_sheets_bindings (
  user_id TEXT NOT NULL,
  table_id TEXT NOT NULL,
  spreadsheet_id TEXT NOT NULL,
  sheet_name TEXT NOT NULL DEFAULT 'Sheet1',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, table_id)
);

CREATE INDEX IF NOT EXISTS google_sheets_bindings_spreadsheet_idx
  ON google_sheets_bindings (spreadsheet_id);
