import { useEffect, useCallback, useMemo } from 'react';

import useObligationsStore from '../../store/obligationsStore';
import { useFilters } from '../../hooks/useFilters';
import './obligationsList.css';


export default function ObligationsList() {
  const { 
    obligations, 
    loading, 
    error,
    loadObligations,
  } = useObligationsStore();

  const fetchData = useCallback(() => {
    loadObligations();
  }, [loadObligations]);

  const filters = useFilters();
    const filteredObligations = useMemo(() => {
    if (!obligations) return [];

    let result = [...obligations];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [obligations, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  if (!filteredObligations || filteredObligations.length === 0) {
    return <div>Нет обязательств</div>;
  }

  return (
    <div>
      {filteredObligations.map(item => (
        <div 
          className='obligationCard'
          key={item.id} 
        >
          <div className='obligationCardHead'>
            <h3>{item.title}</h3>
          </div>
          <div className='obligationCardBody'>
            <span>{item.amount} {item.currency}</span>
            <span>{item.category}</span>
            <span>{item.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}