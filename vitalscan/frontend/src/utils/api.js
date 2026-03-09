import axios from 'axios';

// In production (Render), VITE_API_URL is set to the backend service URL.
// In local dev the Vite proxy forwards /api → localhost:8002, so we fall back to '/api'.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
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
