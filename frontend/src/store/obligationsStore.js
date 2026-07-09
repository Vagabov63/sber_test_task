import { create } from 'zustand';

import { getObligations } from '../api/apiObligations';

const useObligationsStore = create((set, get) => ({
  obligations: [],
  loading: false,
  error: null,

  loadObligations: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getObligations();
      
      const sortedData = [...data].sort((a, b) => {
        return new Date(a.next_payment_date) - new Date(b.next_payment_date);
      });

      set({
        obligations: sortedData,
        loading: false
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
    
    const activePayments = obligations.filter(item => {
      if (item.status !== 'active') return false;
      if (!item.next_payment_date) return false;
      
      const paymentDate = new Date(item.next_payment_date);
      return paymentDate.getMonth() === currentMonth && 
            paymentDate.getFullYear() === currentYear;
    });

    const grouped = {};
    activePayments.forEach(item => {
      const currency = item.currency || 'RUB';
      grouped[currency] = (grouped[currency] || 0) + item.amount;
    });

    set({ currentMonthTotals: grouped });
  },

  getCurrentMonthTotal: () => {
    return get().currentMonthTotals;
  },
}));

export default useObligationsStore;