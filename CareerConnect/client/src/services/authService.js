import api from './api';
import axios from 'axios';

const authService = {
  async login({ email, password }) {
    const res = await api.post('/auth/login', { email, password });
    const { accessToken, refreshToken, user } = res.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  async registerCandidate(payload) {
    const res = await api.post('/auth/register/candidate', payload);
    const { accessToken, refreshToken, user } = res.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  async registerCompany(payload) {
    const res = await api.post('/auth/register/company', payload);
    const { accessToken, refreshToken, user } = res.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },
  
  // NEW FUNCTION: Token Refresh Logic
  async refresh() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');
    
    // Call the refresh endpoint with a plain axios request (bypass `api` instance)
    // to avoid triggering the same response interceptor and causing recursion.
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
    
    const { accessToken, newRefreshToken } = res.data;
    localStorage.setItem('accessToken', accessToken);
    // Refresh token rotation (optional, but good practice)
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    }
    
    return accessToken;
  },
  // END NEW FUNCTION

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
};

export default authService;