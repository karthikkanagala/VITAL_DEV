import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

export async function predictRisk(data) {
  const res = await api.post('/predict', data);
  return res.data;
}

export async function simulateRisk(data) {
  const res = await api.post('/simulate', data);
  return res.data;
}

export default api;
