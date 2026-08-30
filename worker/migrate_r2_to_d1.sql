-- Migration: rename logo_key → logo_data (R2 → D1 logo storage pivot)
-- Run with: npx wrangler d1 execute btd-bids --remote --file=migrate_r2_to_d1.sql
ALTER TABLE bids RENAME COLUMN logo_key TO logo_data;
