import { useEffect, useCallback } from 'react';

import './obligationsList.css';

import useObligationsStore from '../../store/obligationsStore';

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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  if (!obligations || obligations.length === 0) {
    return <div>Нет обязательств</div>;
  }

  return (
    <div>
      {obligations.map(item => (
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