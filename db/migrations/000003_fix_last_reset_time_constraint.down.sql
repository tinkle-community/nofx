-- Revert last_reset_time constraint changes
ALTER TABLE risk_state
    ALTER COLUMN last_reset_time DROP DEFAULT;

ALTER TABLE risk_state_history
    ALTER COLUMN last_reset_time DROP DEFAULT;
