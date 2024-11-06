import axios from 'axios';

const API_BASE_URL = 'https://back-end-0-1-0.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getIncubatorStats = async () => {
  const response = await api.get('/incubator/stats');
  return response.data;
};

export const deposit = async (amount: number, walletAddress: string) => {
  const response = await api.post('/incubator/deposit', { amount, walletAddress });
  return response.data;
};

export const getUserStats = async (walletAddress: string) => {
  const response = await api.get(`/user/${walletAddress}/stats`);
  return response.data;
};

export default api;