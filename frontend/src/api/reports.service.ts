import api from './axios';

export const reportsService = {
  getDashboard: () => api.get('/reports/dashboard'),
};
