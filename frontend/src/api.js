import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const client = axios.create({
  baseURL: API_URL,
});

export const sweepstakesAPI = {
  getAll: (params = {}) =>
    client.get('/api/sweepstakes', { params }).then((res) => res.data),

  getById: (id) =>
    client.get(`/api/sweepstakes/${id}`).then((res) => res.data),

  create: (data) =>
    client.post('/api/sweepstakes', data).then((res) => res.data),

  update: (id, data) =>
    client.patch(`/api/sweepstakes/${id}`, data).then((res) => res.data),

  delete: (id) =>
    client.delete(`/api/sweepstakes/${id}`).then((res) => res.data),

  getDashboard: () =>
    client.get('/api/dashboard').then((res) => res.data),
};

export default client;
