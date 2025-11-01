import { useEffect, useState } from 'react';
import { getSystemConfig, type SystemConfig } from '../lib/config';

export function useSystemConfig() {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getSystemConfig()
      .then((data) => {
        if (!mounted) return;
        setConfig(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (!mounted) return;
        console.error('Failed to fetch system config:', err);
        setError(err.message);
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { config, loading, error };
}