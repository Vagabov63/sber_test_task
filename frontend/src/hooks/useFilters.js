import { useSearchParams } from 'react-router-dom';
import { useMemo, useCallback } from 'react';

// синхронизирует фильтры и поисковую строку
export const useFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => ({
    category: searchParams.get('category') || '',
    search: searchParams.get('q') || '',
    status: searchParams.get('status') || '',
  }), [searchParams]);

  const updateFilter = useCallback((key, value) => {
    const params = new URLSearchParams(searchParams);
    
    if (key === 'search') {
      if (value) params.set('q', value);
      else params.delete('q');
    } else if (key === 'category') {
      if (value) params.set('category', value);
      else params.delete('category');
    } else if (key === 'status') {
      if (value) params.set('status', value);
      else params.delete('status');
    }
    
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const resetFilters = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  const apiFilters = useMemo(() => {
    const result = {};
    if (filters.category) result.category = filters.category;
    if (filters.status) result.status = filters.status;
    return result;
  }, [filters.category, filters.status]);

  return {
    filters,
    apiFilters,
    updateFilter,
    resetFilters,
  };
};