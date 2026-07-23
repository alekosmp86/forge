/**
 * API & Environment Configuration for vitacore
 * Centralized location for backend URL and API endpoints.
 */

export const API_CONFIG = {
  backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080',
  endpoints: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
  },
} as const;
