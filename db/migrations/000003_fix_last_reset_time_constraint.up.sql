-- Fix last_reset_time constraint and backfill existing NULL values
-- Ensures last_reset_time always has a valid timestamp

-- Backfill any NULL last_reset_time with current timestamp
UPDATE risk_state
SET last_reset_time = NOW()
WHERE last_reset_time IS NULL;

-- Backfill any NULL last_reset_time in history table
UPDATE risk_state_history
SET last_reset_time = recorded_at
WHERE last_reset_time IS NULL;

-- Ensure the column has NOT NULL and DEFAULT NOW() constraints
-- This handles both fresh installs and existing databases
ALTER TABLE risk_state
    ALTER COLUMN last_reset_time SET NOT NULL,
    ALTER COLUMN last_reset_time SET DEFAULT NOW();

-- Ensure history table matches
ALTER TABLE risk_state_history
    ALTER COLUMN last_reset_time SET NOT NULL;

-- Ensure paused_until remains nullable (no change, just documenting)
-- ALTER TABLE risk_state ALTER COLUMN paused_until DROP NOT NULL IF EXISTS;
-- ALTER TABLE risk_state_history ALTER COLUMN paused_until DROP NOT NULL IF EXISTS;
