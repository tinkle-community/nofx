SELECT hyptable_name FROM timescaledb_information.hypertables WHERE hypertable_name = 'risk_state_history';
-- No-op down migration; Timescale does not support automatically converting hypertable back to normal table without recreation.
