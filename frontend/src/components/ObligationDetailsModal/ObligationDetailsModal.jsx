import { useState } from 'react';
import useObligationsStore from '../../store/obligationsStore';
import './ObligationDetailsModal.css';

export default function ObligationDetailsModal() {
  const {
    selectedObligation,
    paymentHistory,
    isModalOpen,
    isProcessing,
    closeObligationDetails,
    payObligation,
    cancelObligationFromModal,
    deleteObligation,
  } = useObligationsStore();

  const [activeTab, setActiveTab] = useState('details');
  const [showPayConfirm, setShowPayConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  if (!isModalOpen || !selectedObligation) return null;

  const { 
    id, 
    title, 
    amount, 
    currency, 
    category, 
    recurrence, 
    next_payment_date, 
    status, 
    created_at, 
    updated_at 
  } = selectedObligation;

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatAmount = (amount, currency) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPaymentDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getNextDateAfterPayment = () => {
    if (!recurrence || !next_payment_date) return null;
    const date = new Date(next_payment_date);
    switch (recurrence) {
      case 'daily': date.setDate(date.getDate() + 1); break;
      case 'weekly': date.setDate(date.getDate() + 7); break;
      case 'monthly': date.setMonth(date.getMonth() + 1); break;
      case 'yearly': date.setFullYear(date.getFullYear() + 1); break;
      default: return null;
    }
    return date.toISOString().split('T')[0];
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Активно';
      case 'cancelled': return 'Отменено';
      case 'paid': return 'Оплачено';
      case 'expired': return 'Просрочено';
      default: return status;
    }
  };

  // const getStatusColor = (status) => {
  //   switch (status) {
  //     case 'active': return '#4CAF50';
  //     case 'cancelled': return '#f44336';
  //     case 'paid': return '#2196F3';
  //     case 'expired': return '#FF9800';
  //     default: return '#999';
  //   }
  // };

  const handlePay = async () => {
    setShowPayConfirm(false);
    setPaymentSuccess(true);
    
    setTimeout(async () => {
      const result = await payObligation(id);
      setPaymentSuccess(false);
      if (!result.success) {
        alert('Ошибка при оплате');
      }
    }, 1500);
  };

  const handleCancel = async () => {
    if (!window.confirm(`Вы уверены, что хотите отменить обязательство "${title}"?`)) {
      return;
    }
    const result = await cancelObligationFromModal(id);
    if (!result.success) {
      alert('Ошибка при отмене');
    }
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    const result = await deleteObligation(id);
    if (!result.success) {
      alert('Ошибка при удалении');
    }
  };

  const nextDate = getNextDateAfterPayment();

  return (
    <div className="modal-overlay"
      onClick={() => {
        closeObligationDetails();
        setShowPayConfirm(false);
        setShowDeleteConfirm(false);
        setPaymentSuccess(false);
        setActiveTab('details');
      }}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn"
        onClick={() => {
          closeObligationDetails();
          setShowPayConfirm(false);
          setShowDeleteConfirm(false);
          setPaymentSuccess(false);
        }}>
          ✕
        </button>

        <h2 className="modal-title">{title}</h2>
        <div className="modal-badges">
          <span className={`status-badge status-${status}`}>
            {getStatusLabel(status)}
          </span>
          <span className="category-badge">{category}</span>
        </div>

        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === 'details' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Детали
          </button>
          <button
            className={`tab-btn ${activeTab === 'history' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            История платежей ({paymentHistory.length})
          </button>
        </div>

        {activeTab === 'details' && (
          <div className="details-tab">
            <div className="details-grid">
              <p><strong>Сумма:</strong> {formatAmount(amount, currency)}</p>
              <p><strong>Периодичность:</strong> {recurrence || '—'}</p>
              <p><strong>Дата следующего платежа:</strong> {formatDate(next_payment_date)}</p>
              <p><strong>Статус:</strong> {getStatusLabel(status)}</p>
              <p><strong>Категория:</strong> {category}</p>
              <p><strong>ID:</strong> <span className="id-text">{id}</span></p>
              <p><strong>Создано:</strong> {formatDate(created_at)}</p>
              {updated_at && <p><strong>Обновлено:</strong> {formatDate(updated_at)}</p>}
            </div>
            <div className="actions-row">
              {status === 'active' && (
                <>
                  <button
                    className="btn btn-pay"
                    onClick={() => setShowPayConfirm(true)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Обработка...' : 'Оплатить'}
                  </button>
                  <button
                    className="btn btn-cancel"
                    onClick={handleCancel}
                    disabled={isProcessing}
                  >
                    Отменить
                  </button>
                </>
              )}

              <button
                className="btn btn-delete"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isProcessing}
              >
                Удалить
              </button>
            </div>

            {status === 'cancelled' && (
              <div className="status-message status-cancelled">
                Это обязательство было отменено
              </div>
            )}

            {status === 'paid' && (
              <div className="status-message status-paid">
                Это обязательство оплачено
              </div>
            )}

            {status === 'expired' && (
              <div className="status-message status-expired">
                Это обязательство просрочено
              </div>
            )}

            {showPayConfirm && (
              <div className="confirm-dialog">
                <p className="confirm-title">Подтвердите оплату</p>
                {recurrence && nextDate ? (
                  <p className="confirm-text">
                    Следующее списание: {formatDate(nextDate)} · {formatAmount(amount, currency)}
                  </p>
                ) : (
                  <p className="confirm-text">
                    После оплаты обязательство будет закрыто
                  </p>
                )}
                <div className="confirm-actions">
                  <button className="btn btn-confirm" onClick={handlePay} disabled={isProcessing}>
                    Подтвердить
                  </button>
                  <button className="btn btn-cancel-confirm" onClick={() => setShowPayConfirm(false)}>
                    Отмена
                  </button>
                </div>
              </div>
            )}

            {showDeleteConfirm && (
              <div className="confirm-dialog confirm-delete">
                <p className="confirm-title">Удалить безвозвратно?</p>
                <p className="confirm-text">
                  Это действие нельзя отменить. Обязательство "{title}" будет удалено навсегда.
                </p>
                <div className="confirm-actions">
                  <button className="btn btn-delete-confirm" onClick={handleDelete} disabled={isProcessing}>
                    Удалить
                  </button>
                  <button className="btn btn-cancel-confirm" onClick={() => setShowDeleteConfirm(false)}>
                    Отмена
                  </button>
                </div>
              </div>
            )}

            {paymentSuccess && (
              <div className="payment-success">
                Оплата успешно выполнена!
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-tab">
            {paymentHistory.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p className="empty-title">Нет платежей</p>
                <p className="empty-text">История платежей будет отображаться здесь</p>
              </div>
            ) : (
              <div>
                <div className="history-header">
                  <span>Дата</span>
                  <span style={{ textAlign: 'right' }}>Сумма</span>
                </div>
                {paymentHistory.map((payment, index) => (
                  <div key={index} className="history-row">
                    <span>{formatPaymentDate(payment.paid_at)}</span>
                    <span style={{ textAlign: 'right' }}>
                      {formatAmount(payment.amount, payment.currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}