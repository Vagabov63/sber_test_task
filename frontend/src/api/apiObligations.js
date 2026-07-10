import api from './axiosConfig'

export const getObligations = () =>
  api.get('/obligations', {}).then(res => res.data);

export const getUpcomingObligations = () =>
  api.get('/obligations/upcoming').then(res => res.data);

export const cancelObligation = (id) =>
  api.patch(`/obligations/${id}/cancel`).then(res => res.data);