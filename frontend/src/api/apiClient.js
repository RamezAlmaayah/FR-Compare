import axios from 'axios';
import { getStoredToken, removeStoredToken } from '../utils/authToken';
import { API_BASE_URL } from './apiConfig';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

apiClient.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401 && !error.config?.url?.startsWith('/auth/login')) {
    removeStoredToken();
    window.dispatchEvent(new Event('auth:expired'));
  }
  return Promise.reject(error);
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default apiClient;
