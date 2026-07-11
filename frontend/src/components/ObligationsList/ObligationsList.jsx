import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import useObligationsStore from '../../store/obligationsStore';
import { useFilters } from '../../hooks/useFilters';

import './ObligationsList.css';

export default function ObligationsList() {
  const { 
    obligations, 
    loading, 
    error,
    openObligationDetails,
  } = useObligationsStore();

  
  const { filters } = useFilters();

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

  const getPaymentColor = (dateString, status) => {
    if(status !== 'active') {
      return '#ffffffff';
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const paymentDate = new Date(dateString);
    paymentDate.setHours(0, 0, 0, 0);
    
    const diffTime = paymentDate - today;
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let color;
    if (days <= 3) {
      color = '#f44336';
    } else if (days <= 7) {
      color = '#ffe100ff';
    } else {
      color = '#a8a8a8ff';
    }

    return color;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const truncateText = (text, maxLength = 54) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  if (!filteredObligations || filteredObligations.length === 0) {
    return <div>Нет обязательств</div>;
  }

  return (
    <div className='obligationGrid'>
      <AnimatePresence mode="popLayout">
      {filteredObligations.map(item => (
        <motion.div
          key={item.id}
          layout
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="obligationCard"
          onClick={() => openObligationDetails(item.id)}
        >
          <div className='obligationCardHead'>
            <h3>{truncateText(item.title)}</h3>
            <span style={{
              background: getPaymentColor(item.next_payment_date, item.status),
            }}>
              {formatDate(item.next_payment_date)}
            </span>
          </div>
          <div className='obligationCardBody'>
            <span>{item.amount} {item.currency}</span>
            <span>{item.category}</span>
            <span>{item.status}</span>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
    </div>
  );
}