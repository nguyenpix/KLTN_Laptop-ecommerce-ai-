
import { create } from 'zustand';
import { User } from '@/features/auth/types';

interface AuthState {
  token: string | null;
  user: User | null;
  isLoggedIn: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoggedIn: false,

  login: (token, user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ token, user, isLoggedIn: true });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    set({ token: null, user: null, isLoggedIn: false });
  },
}));

/**
 * Hydrates the auth store from localStorage.
 */
export const hydrateAuth = () => {
  try {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      if (token && user) {
        useAuthStore.setState({ token, user, isLoggedIn: true });
      }
    }
  } catch (error) {
    console.error("Failed to hydrate auth from localStorage", error);
    useAuthStore.setState({ token: null, user: null, isLoggedIn: false });
  }
};
