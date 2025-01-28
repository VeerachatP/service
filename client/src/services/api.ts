import axios from 'axios';
import { API_CONFIG } from '../config/api';

const api = axios.create(API_CONFIG);

api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api; 