import { useState, useCallback } from 'react';
import { predictRisk } from '../utils/api';

export default function useRiskPrediction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const predict = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const result = await predictRisk(data);
      return result;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Prediction failed. Please try again.';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { predict, loading, error };
}
