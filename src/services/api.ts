// src/services/api.ts
import axios from 'axios';
import { API_URL as API_BASE_URL } from '../config/config';
import { useAuthStore } from '../store/auth';
import { Alert } from 'react-native';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  async (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    if (status === 401) {
      Alert.alert('Session Expired', 'Please log in again.');
      useAuthStore.getState().logout();
    }
    return Promise.reject(err);
  }
);

export default api;
