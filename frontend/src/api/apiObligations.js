import api from './axiosConfig'

export const getObligations = () =>
  api.get('/obligations', {}).then(res => res.data);