import { useMemo } from 'react';

import useObligationsStore from '../../store/obligationsStore';
import { useFilters } from '../../hooks/useFilters';
import './ObligationsList.css';


export default function ObligationsList() {
  const { 
    obligations, 
    loading, 
    error,
    // loadObligations,
  } = useObligationsStore();

  
  const { filters } = useFilters();
  // const fetchData = useCallback(() => {
  //   loadObligations(apiFilters);
  // }, [loadObligations, apiFilters]);

  const filteredObligations = useMemo(() => {
    if (!obligations) return [];

    let result = [...obligations];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      
      result = result.filter(item => {
        const titleLower = item.title.toLowerCase();
        const matches = titleLower.includes(searchLower);
        return matches;
      });
    }

    return result;
  }, [obligations, filters]);

  // useEffect(() => {
  //   fetchData();
  // }, [fetchData]);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  if (!filteredObligations || filteredObligations.length === 0) {
    return <div>Нет обязательств</div>;
  }

  return (
    <div className='obligationGrid'>
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