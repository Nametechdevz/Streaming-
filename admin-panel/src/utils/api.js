import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout')
};

export const usersAPI = {
  list: () => api.get('/users'),
  get: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  toggle: (id) => api.patch(`/users/${id}/toggle`)
};

export const dnsAPI = {
  list: () => api.get('/dns'),
  create: (data) => api.post('/dns', data),
  update: (id, data) => api.put(`/dns/${id}`, data),
  delete: (id) => api.delete(`/dns/${id}`),
  activate: (id) => api.patch(`/dns/${id}/activate`),
  test: (id) => api.post(`/dns/${id}/test`),
  importM3U: (data) => api.post('/dns/import-m3u', data)
};

export const streamsAPI = {
  live: (params) => api.get('/streams/live', { params }),
  movies: (params) => api.get('/streams/movies', { params }),
  series: (params) => api.get('/streams/series', { params }),
  addLive: (data) => api.post('/streams/live', data),
  deleteLive: (id) => api.delete(`/streams/live/${id}`)
};

export const categoriesAPI = {
  list: (type) => api.get('/categories', { params: { type } }),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`)
};

export const dashboardAPI = {
  stats: () => api.get('/dashboard/stats')
};

export default api;
