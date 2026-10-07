import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/api';

/**
 * Custom hook to load dashboard statistics and notification streams.
 */
export const useDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await dashboardService.getDashboardData();
      setData(result);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to retrieve dashboard metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboard,
  };
};

export default useDashboard;
