-- Convert history table to hypertable for efficient time-series operations
-- Use DO block to handle if_not_exists behavior gracefully
DO $$
BEGIN
    -- Check if the table is already a hypertable
    IF NOT EXISTS (
        SELECT 1 FROM timescaledb_information.hypertables 
        WHERE hypertable_name = 'risk_state_history'
    ) THEN
        PERFORM create_hypertable('risk_state_history', 'recorded_at', migrate_data => TRUE);
    END IF;
END $$;
