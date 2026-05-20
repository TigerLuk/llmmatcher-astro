CREATE TABLE IF NOT EXISTS votes (
  id TEXT PRIMARY KEY,
  gpu_slug TEXT NOT NULL,
  model_slug TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_votes_gpu ON votes(gpu_slug);
CREATE INDEX IF NOT EXISTS idx_votes_model ON votes(model_slug);
