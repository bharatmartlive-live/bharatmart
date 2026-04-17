import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_BASE_URL
});

export const withMediaUrl = (path = '') => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${MEDIA_BASE_URL}${path}`;
};
