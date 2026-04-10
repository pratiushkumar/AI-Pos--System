import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || 'https://ai-pos-system.onrender.com';
console.log('AI POS API URL:', apiUrl);

const api = axios.create({
  baseURL: apiUrl,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);




export default api;
