import { create } from 'zustand';
import type { User } from '@/types';

// Install zustand: npm install zustand
// Simple auth store using localStorage persistence

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const loadFromStorage = () => {
  try {
    const user = localStorage.getItem('praman_user');
    const accessToken = localStorage.getItem('praman_access_token');
    const refreshToken = localStorage.getItem('praman_refresh_token');
    return {
      user: user ? (JSON.parse(user) as User) : null,
      accessToken,
      refreshToken,
    };
  } catch {
    return { user: null, accessToken: null, refreshToken: null };
  }
};

const stored = loadFromStorage();

export const useAuthStore = create<AuthState>((set) => ({
  user: stored.user,
  accessToken: stored.accessToken,
  refreshToken: stored.refreshToken,
  isAuthenticated: !!(stored.accessToken && stored.user),

  login: (user, accessToken, refreshToken) => {
    localStorage.setItem('praman_user', JSON.stringify(user));
    localStorage.setItem('praman_access_token', accessToken);
    localStorage.setItem('praman_refresh_token', refreshToken);
    set({ user, accessToken, refreshToken, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('praman_user');
    localStorage.removeItem('praman_access_token');
    localStorage.removeItem('praman_refresh_token');
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },

  updateUser: (user) => {
    localStorage.setItem('praman_user', JSON.stringify(user));
    set({ user });
  },
}));
