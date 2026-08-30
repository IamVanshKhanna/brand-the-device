-- Brand the Device — auction backend schema (Cloudflare D1 / SQLite)
-- Apply with:  npx wrangler d1 execute btd-bids --file=schema.sql

-- Current top bid per spot (one row per spot; upserted on each new winning bid).
CREATE TABLE IF NOT EXISTS bids (
  spot_id    TEXT PRIMARY KEY,
  sponsor    TEXT NOT NULL,
  amount     INTEGER NOT NULL,          -- AUD cents (settle currency)
  email      TEXT NOT NULL,
  url        TEXT,
  logo_key   TEXT NOT NULL,             -- R2 object key
  bidder_id  TEXT NOT NULL,             -- opaque token returned to bidder for identity
  created_at TEXT NOT NULL
);

-- Append-only bid history (every bid, not just winners).
CREATE TABLE IF NOT EXISTS history (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  spot_id TEXT NOT NULL,
  sponsor TEXT NOT NULL,
  amount  INTEGER NOT NULL,
  email   TEXT NOT NULL,
  ts      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_history_ts ON history(ts DESC);

-- Waitlist (sell-out → SaaS redirect capture).
CREATE TABLE IF NOT EXISTS waitlist (
  email     TEXT PRIMARY KEY,
  created_at TEXT NOT NULL
);
