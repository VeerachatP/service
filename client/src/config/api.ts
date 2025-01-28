const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const API_ENDPOINTS = {
  UPGRADE: `${API_BASE_URL}/upgrade`,
  PROMO: `${API_BASE_URL}/promo`,
  HEALTH: `${API_BASE_URL}/health`
};

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
}; 