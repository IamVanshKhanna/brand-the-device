-- Migration v2: add status column + clean up test data
-- Run with: npx wrangler d1 execute btd-bids --remote --file=migrate_v2.sql
ALTER TABLE bids ADD COLUMN status TEXT DEFAULT 'active';
DELETE FROM bids WHERE sponsor = 'ABC';
DELETE FROM history WHERE sponsor = 'ABC';
