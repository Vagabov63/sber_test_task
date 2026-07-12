import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import useObligationsStore from '../../store/obligationsStore';
import { useFilters } from '../../hooks/useFilters';

import './ObligationsList.css';

export default function ObligationsList() {
  const { 
    obligations, 
    loadingObligations, 
    error,
    openObligationDetails,
  } = useObligationsStore();

  const { filters } = useFilters();
  
  const [displayedObligations, setDisplayedObligations] = useState([]);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const filteredObligations = useMemo(() => {
    if (!obligations) return [];
    let result = [...obligations];
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(item => item.title.toLowerCase().includes(searchLower));
    }
    return result;
  }, [obligations, filters]);

  useEffect(() => {
    const currentIds = filteredObligations.map(item => item.id).sort().join(',');
    const displayIds = displayedObligations.map(item => item.id).sort().join(',');
    
    if (currentIds !== displayIds) {
      setDisplayedObligations(filteredObligations);
      if (!hasLoadedOnce && filteredObligations.length > 0) {
        setHasLoadedOnce(true);
      }
    }
  }, [filteredObligations, displayedObligations, hasLoadedOnce]);

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

  if (!hasLoadedOnce && loadingObligations) {
    return (
      <div className="obligationGridWrapper">
        <div className="obligationGrid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="obligationCard skeleton">
              <div className="skeleton-title"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) return <div>Ошибка: {error}</div>;

  if (!filteredObligations || filteredObligations.length === 0) {
    return <div>Нет обязательств</div>;
  }

  return (
    <div className='gridWrapper'>
    <div className='obligationGrid'>
      <AnimatePresence mode="popLayout">
        {displayedObligations.map(item => (
          <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className={`obligationCard ${loadingObligations ? 'loading' : ''}`}
              onClick={() => !loadingObligations && openObligationDetails(item.id)}
              style={{ 
                cursor: loadingObligations ? 'default' : 'pointer',
                pointerEvents: loadingObligations ? 'none' : 'auto',
              }}
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
      {hasLoadedOnce && loadingObligations && (
        <div 
          className="loadingOverlay"
          style={{ pointerEvents: 'auto' }}
        >
          <div className="loadingSpinner"></div>
        </div>
      )}
    </div>
  );
}