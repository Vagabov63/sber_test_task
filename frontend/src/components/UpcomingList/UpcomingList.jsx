import { useState } from 'react';

import useObligationsStore from '../../store/obligationsStore';

import './UpcomingList.css';

export default function UpcomingList() {
  const { 
    loading, 
    error,
    renewalAlerts,
    cancelObligation,
    openObligationDetails,
  } = useObligationsStore();

  const [cancelingId, setCancelingId] = useState(null);

  const getDaysUntil = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const paymentDate = new Date(dateString);
    paymentDate.setHours(0, 0, 0, 0);
    
    const diffTime = paymentDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const formatDays = (days) => {
    if (days === 0) return 'сегодня';
    if (days === 1) return 'через 1 день';
    if (days >= 2 && days <= 4) return `через ${days} дня`;
    return `через ${days} дней`;
  };

  const handleCancel = async (obligationId, title) => {
    if (!window.confirm(`Вы уверены, что хотите отменить подписку "${title}"?`)) {
      return;
    }

    setCancelingId(obligationId);
    
    try {
      const result = await cancelObligation(obligationId);
      if (result.success) {
        alert(`Подписка "${title}" успешно отменена`);
      } else {
        alert(`Ошибка при отмене: ${result.error}`);
      }
    } catch (error) {
      alert('Произошла ошибка при отмене подписки', error);
    } finally {
      setCancelingId(null);
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  if (!renewalAlerts || renewalAlerts.length === 0) {
    return null;
  }

  return (
    <div className='upcomingBlock'>
      <h3>Скоро спишут</h3>
      <div className='upcomingGrid'>
        {renewalAlerts.map(item => {
            const daysLeft = getDaysUntil(item.next_payment_date);
            const daysText = formatDays(daysLeft);
            const isCanceling = cancelingId === item.id;
            return (
              <div key={item.id} className='upcomingCard' onClick={() => openObligationDetails(item.id)}>
                <div className='upcomingCardHead'>
                  <h3>{item.title}</h3>
                  <p>{item.amount} {item.currency}</p>
                </div>
                <div className='upcomingCardBody'>
                  <p>{daysText}</p>
                  <button
                    onClick={() => handleCancel(item.id, item.title)}
                    disabled={isCanceling}
                  >
                    {isCanceling ? 'Отмена...' : 'Отменить'}
                  </button>
                </div>
              </div>
            );
          })
        }
      </div>
    </div>
  );
}