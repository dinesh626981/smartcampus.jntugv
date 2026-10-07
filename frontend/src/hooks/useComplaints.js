import { useState, useEffect, useCallback } from 'react';
import { complaintsService } from '../services/api';

/**
 * Custom hook to fetch and filter complaints with loading and error states.
 */
export const useComplaints = (initialFilters = {}) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, val]) => val !== '' && val !== null && val !== undefined)
      );
      const data = await complaintsService.getComplaints(activeFilters);
      setComplaints(Array.isArray(data) ? data : (data?.complaints || []));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load complaints.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  return {
    complaints,
    loading,
    error,
    filters,
    updateFilter,
    resetFilters,
    refetch: fetchComplaints,
    setComplaints,
  };
};

export default useComplaints;
