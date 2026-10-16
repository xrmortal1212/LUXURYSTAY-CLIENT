import axios from 'axios';
import { API_BASE_URL } from './auth';

const baseURL = `${API_BASE_URL.replace(/\/$/, '')}/api/v1`;

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

let refreshRequest;

const isPublicAuthRequest = (url = '') => /\/auth\/(login|register|verify-email|forgot-password|reset-password|refresh-token)(\?|$)/.test(url);

api.interceptors.response.use(response => response, async error => {
  const originalRequest = error.config;
  if (error.response?.status !== 401 || !originalRequest || originalRequest._retry || isPublicAuthRequest(originalRequest.url)) {
    return Promise.reject(error);
  }

  originalRequest._retry = true;
  refreshRequest ||= axios.post(`${baseURL}/auth/refresh-token`, {}, { withCredentials: true })
    .finally(() => { refreshRequest = undefined; });

  try {
    await refreshRequest;
    return api(originalRequest);
  } catch (refreshError) {
    window.dispatchEvent(new CustomEvent('luxurystay:unauthorized'));
    return Promise.reject(refreshError);
  }
});

export const getApiErrorMessage = (error, fallback = 'Something went wrong. Please try again.') =>
  error.response?.data?.message || error.message || fallback;