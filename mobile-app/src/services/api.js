import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.0.2.2:5000/api'; // Android emulator → localhost

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('user_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res.data,
  err => Promise.reject(err.response?.data || err)
);

export const authService = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout')
};

export const streamService = {
  liveChannels: (params) => api.get('/streams/live', { params }),
  movies: (params) => api.get('/streams/movies', { params }),
  series: (params) => api.get('/streams/series', { params }),
  movieDetail: (id) => api.get(`/streams/movies/${id}`),
  seriesDetail: (id) => api.get(`/streams/series/${id}`),
  liveStreamUrl: (id) => api.get(`/streams/live/${id}/url`),
  movieStreamUrl: (id) => api.get(`/streams/movies/${id}/url`),
  seriesEpisodeUrl: (seriesId, epId) => api.get(`/streams/series/${seriesId}/episode/${epId}/url`)
};

export const categoryService = {
  list: (type) => api.get('/categories', { params: { type } })
};

export const xtreamService = {
  serverInfo: () => api.get('/xtream/server-info'),
  categories: (type) => api.get(`/xtream/categories/${type}`)
};

export default api;
