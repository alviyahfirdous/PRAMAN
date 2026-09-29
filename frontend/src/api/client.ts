/**
 * PRAMAN API Client
 * =================
 * Uses real backend when available, falls back to synthetic mock data.
 * Mock mode: set VITE_MOCK_MODE=true in .env, OR backend unreachable → auto-fallback.
 */

import axios from 'axios';
import {
  mockLogin,
  MOCK_LEADERSHIP_DASHBOARD,
  MOCK_PI_DASHBOARD,
  MOCK_COORDINATOR_DASHBOARD,
  MOCK_ETHICS_DASHBOARD,
  MOCK_PV_DASHBOARD,
  MOCK_MONITOR_DASHBOARD,
  MOCK_STUDIES,
} from '@/lib/mockData';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Force mock mode via env var OR default to mock when backend isn't there
const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true' || true; // default ON for demo

// ─── REAL AXIOS CLIENT ──────────────────────────────────────
export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('praman_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const rt = localStorage.getItem('praman_refresh_token');
      if (rt) {
        try {
          const res = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, { refresh_token: rt });
          localStorage.setItem('praman_access_token', res.data.access_token);
          localStorage.setItem('praman_refresh_token', res.data.refresh_token);
          original.headers.Authorization = `Bearer ${res.data.access_token}`;
          return apiClient(original);
        } catch {
          localStorage.removeItem('praman_access_token');
          localStorage.removeItem('praman_refresh_token');
          localStorage.removeItem('praman_user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ─── MOCK HELPERS ──────────────────────────────────────────
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const mockResponse = async <T>(data: T) => {
  await delay();
  return { data, status: 200 };
};

// ─── AUTH API ──────────────────────────────────────────────
export const authApi = {
  login: async (username: string, password: string) => {
    if (MOCK_MODE) {
      await delay(600);
      try {
        const result = mockLogin(username, password);
        return { data: result, status: 200 };
      } catch {
        const err = new Error('Invalid credentials') as Error & { response?: unknown };
        err.response = { data: { detail: 'Invalid username or password. Try one of the demo accounts.' }, status: 401 };
        throw err;
      }
    }
    return apiClient.post('/auth/login', { username, password });
  },

  logout: async () => {
    if (MOCK_MODE) return mockResponse({ ok: true });
    return apiClient.post('/auth/logout');
  },

  me: async () => {
    if (MOCK_MODE) {
      const stored = localStorage.getItem('praman_user');
      return mockResponse(stored ? JSON.parse(stored) : null);
    }
    return apiClient.get('/auth/me');
  },

  refresh: async (refresh_token: string) => {
    if (MOCK_MODE) return mockResponse({ access_token: `mock-refreshed-${Date.now()}`, refresh_token, token_type: 'bearer', expires_in: 3600 });
    return apiClient.post('/auth/refresh', { refresh_token });
  },
};

// ─── DASHBOARD API ─────────────────────────────────────────
export const dashboardApi = {
  leadership: () => mockResponse(MOCK_LEADERSHIP_DASHBOARD),
  pi: () => mockResponse(MOCK_PI_DASHBOARD),
  coordinator: () => mockResponse(MOCK_COORDINATOR_DASHBOARD),
  ethics: () => mockResponse(MOCK_ETHICS_DASHBOARD),
  pharmacovigilance: () => mockResponse(MOCK_PV_DASHBOARD),
  monitor: () => mockResponse(MOCK_MONITOR_DASHBOARD),
};

// ─── STUDIES API ───────────────────────────────────────────
export const studiesApi = {
  list: async (status?: string) => {
    const studies = status ? MOCK_STUDIES.filter((s) => s.status === status) : MOCK_STUDIES;
    return mockResponse({ studies, total: studies.length });
  },
  get: async (id: string) => {
    const s = MOCK_STUDIES.find((s) => s.id === id);
    if (!s) throw new Error('Study not found');
    return mockResponse(s);
  },
};
