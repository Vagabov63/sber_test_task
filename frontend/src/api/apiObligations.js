import api from './axiosConfig'

export const getObligations = async (params = {}) => {
  const res = await api.get('/obligations', { params });
  return res.data;
};

export const getUpcomingObligations = () =>
  api.get('/obligations/upcoming').then(res => res.data);

export const cancelObligation = (id) =>
  api.patch(`/obligations/${id}/cancel`).then(res => res.data);

export const getPaymentHistory = (id) => 
  api.get(`/obligations/${id}/payments`).then(res => res.data);

export const payObligation = (id) => 
  api.post(`/obligations/${id}/pay`).then(res => res.data);

export const deleteObligation = (id) => 
  api.delete(`/obligations/${id}`).then(res => res.data);