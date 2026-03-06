import { useState, useCallback } from 'react';
import { simulateRisk } from '../utils/api';

export default function useSimulation() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const simulate = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await simulateRisk(data);
      setResult(res);
      return res;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Simulation failed.';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { simulate, result, loading, error };
}
