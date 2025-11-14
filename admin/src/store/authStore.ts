import { create } from 'zustand';

interface AuthState {
  token: string | null;
  user: any | null; 
  isLoggedIn: boolean;
  login: (user: any, token: string) => void;
  logout: () => void;
}


const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof window === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};


const deleteCookie = (name: string) => {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

export const useAuthStore = create<AuthState>((set) => ({
  
  token: null,
  user: null,
  isLoggedIn: false,

  
  login: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setCookie('token', token, 7); 
      setCookie('isLoggedIn', 'true', 7);
    }
    set({ token, user, isLoggedIn: true });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      deleteCookie('token');
      deleteCookie('isLoggedIn');
    }
    set({ token: null, user: null, isLoggedIn: false });
  },
}));

export const hydrateAuth = () => {
  try {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (token && user) {
      useAuthStore.setState({ token, user, isLoggedIn: true });
    }
  } catch (error) {
    
    console.error("Failed to hydrate auth from localStorage", error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    useAuthStore.setState({ token: null, user: null, isLoggedIn: false });
  }
};
