import axios from 'axios';
import { getAccessToken } from '@/lib/supabase';
import { loadingGameStore } from '@/lib/loading-game-store';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
});

api.interceptors.request.use(async (config) => {
  loadingGameStore.requestStarted();
  const token = await getAccessToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    loadingGameStore.requestEnded();
    return response;
  },
  (error) => {
    loadingGameStore.requestEnded();
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
