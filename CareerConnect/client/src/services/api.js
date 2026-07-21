import axios from 'axios';
import authService from './authService';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000' });
let isRefreshing = false;
let failedQueue = [];

// Function to process the queue of failed requests
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 1. Request Interceptor: Attaches the Access Token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 2. Response Interceptor: Handles Token Expiration (401 Error)
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    // Check if error is 401 and not the refresh request itself
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue the current request
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
        .then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axios(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true; // Mark request to avoid infinite loop
      isRefreshing = true;
      
      return new Promise(async (resolve, reject) => {
        try {
          const newToken = await authService.refresh();
          
          // Update headers for the failed request and all queued requests
          originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
          processQueue(null, newToken);
          
          resolve(axios(originalRequest));
        } catch (_error) {
          // Refresh failed (e.g., Refresh Token expired). Logout user.
          authService.logout();
          window.location = '/login'; // Redirect to login page
          processQueue(_error, null);
          reject(_error);
        } finally {
          isRefreshing = false;
        }
      });
    }
    
    // If error is not 401 or refresh is not possible, return original error
    return Promise.reject(error);
  }
);

export default api;