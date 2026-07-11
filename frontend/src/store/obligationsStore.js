import { create } from 'zustand';

import {
  getObligations,
  getUpcomingObligations,
  cancelObligation,
  getPaymentHistory,
  payObligation,
  deleteObligation,
} from '../api/apiObligations';

const useObligationsStore = create((set, get) => ({
  obligations: [],
  upcomingObligations: [],
  renewalAlerts: [],
  loading: false,
  error: null,

  loadObligations: async (filters) => {
    set({ loading: true, error: null });
    try {
      const data = await getObligations(filters);

      const sortedData = [...data].sort((a, b) => {
        return new Date(a.next_payment_date) - new Date(b.next_payment_date);
      });

      set({
        obligations: sortedData,
        loading: false,
      });
      get().updateCurrentMonthTotals();
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  currentMonthTotals: {},

  updateCurrentMonthTotals: (obligationsList = null) => {
    const obligations = obligationsList || get().obligations;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const activePayments = obligations.filter((item) => {
      if (item.status !== 'active') return false;
      if (!item.next_payment_date) return false;

      const paymentDate = new Date(item.next_payment_date);
      return (
        paymentDate.getMonth() === currentMonth &&
        paymentDate.getFullYear() === currentYear
      );
    });

    const grouped = {};
    activePayments.forEach((item) => {
      const currency = item.currency || 'RUB';
      grouped[currency] = (grouped[currency] || 0) + item.amount;
    });

    set({ currentMonthTotals: grouped });
  },

  getCurrentMonthTotal: () => {
    return get().currentMonthTotals;
  },

  loadUpcomingObligations: async () => {
    set({ loading: true, error: null });
    try {
      const response = await getUpcomingObligations();

      const obligations = response.obligations || [];
      const totals = response.totals || null;
      const renewalAlerts = response.renewal_alerts || [];

      const activeIds = new Set(
        obligations
          .filter((item) => item.status === 'active')
          .map((item) => item.id),
      );

      const filteredAlerts = renewalAlerts.filter((alert) =>
        activeIds.has(alert.id),
      );

      set({
        upcomingObligations: obligations,
        totals: totals,
        renewalAlerts: filteredAlerts,
        loading: false,
      });
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      set({
        error: error.message || 'Ошибка загрузки',
        loading: false,
      });
    }
  },

  cancelObligation: async (obligationId) => {
    try {
      await cancelObligation(obligationId);
      await get().loadUpcomingObligations();
      return { success: true };
    } catch (error) {
      console.error('Ошибка при отмене:', error);
      return { success: false, error: error.message };
    }
  },

  openObligationDetails: async (id) => {
    set({ isProcessing: true, error: null });
    try {
      const state = get();

      let obligation = state.obligations.find((item) => item.id === id);
      if (!obligation) {
        obligation = state.upcomingObligations.find((item) => item.id === id);
      }

      if (!obligation) {
        throw new Error(`Обязательство с ID ${id} не найдено`);
      }

      const payments = await getPaymentHistory(id);

      set({
        selectedObligation: obligation,
        paymentHistory: payments || [],
        isModalOpen: true,
        isProcessing: false,
      });
    } catch (error) {
      console.error('Ошибка загрузки деталей:', error);
      set({
        error: error.message || 'Ошибка загрузки деталей',
        isProcessing: false,
      });
    }
  },

  closeObligationDetails: () => {
    set({
      isModalOpen: false,
      selectedObligation: null,
      paymentHistory: [],
    });
  },

  payObligation: async (id) => {
    set({ isProcessing: true, error: null });
    try {
      await payObligation(id);

      await get().loadObligations();
      await get().loadUpcomingObligations();

      await get().openObligationDetails(id);

      set({ isProcessing: false });
      return { success: true };
    } catch (error) {
      console.error('Ошибка оплаты:', error);
      set({
        error: error.message || 'Ошибка оплаты',
        isProcessing: false,
      });
      return { success: false, error: error.message };
    }
  },

  cancelObligationFromModal: async (id) => {
    set({ isProcessing: true, error: null });
    try {
      await cancelObligation(id);

      await get().loadObligations();
      await get().loadUpcomingObligations();

      // обновить модалку
      await get().openObligationDetails(id);

      set({ isProcessing: false });
      return { success: true };
    } catch (error) {
      console.error('Ошибка отмены:', error);
      set({
        error: error.message || 'Ошибка отмены',
        isProcessing: false,
      });
      return { success: false, error: error.message };
    }
  },

  deleteObligation: async (id) => {
    set({ isProcessing: true, error: null });
    try {
      await deleteObligation(id);

      await get().loadObligations();
      await get().loadUpcomingObligations();

      set({
        isModalOpen: false,
        selectedObligation: null,
        paymentHistory: [],
        isProcessing: false,
      });
      return { success: true };
    } catch (error) {
      console.error('Ошибка удаления:', error);
      set({
        error: error.message || 'Ошибка удаления',
        isProcessing: false,
      });
      return { success: false, error: error.message };
    }
  },
}));

export default useObligationsStore;
