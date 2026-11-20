import { create } from 'zustand';
import { User } from '@/features/auth/types';

interface AuthState {
  token: string | null;
  user: User | null;
  isLoggedIn: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

/** Backend có chỗ trả `id`, có chỗ chỉ trả `_id` -> luôn chuẩn hóa về `id`. */
export const normalizeUser = (user: (Partial<User> & { _id?: string }) | null | undefined): User | null => {
  if (!user) return null;
  const id = user.id || user._id;
  return { ...(user as User), id: id ? String(id) : '' };
};

export const getUserId = (user: Partial<User> & { _id?: string } | null | undefined): string | null => {
  if (!user) return null;
  return (user.id || user._id || null) as string | null;
};

/** Kiểm tra JWT token đã hết hạn (hoặc sai định dạng) ngay phía client. */
export const isTokenExpired = (token: string | null | undefined): boolean => {
  if (!token || typeof token !== 'string') return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload) as { exp?: number };
    if (typeof payload.exp !== 'number') return false;
    // Hết hạn nếu exp (giây) <= thời điểm hiện tại
    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

// Các key localStorage chứa dữ liệu gắn với tài khoản
const USER_SCOPED_STORAGE_KEYS = ['cart-storage', 'wishlist-storage'];

const clearAuthStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    USER_SCOPED_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoggedIn: false,

  login: (token, user) => {
    const normalized = normalizeUser(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(normalized));
    }
    set({ token, user: normalized, isLoggedIn: true });
  },

  logout: () => {
    clearAuthStorage();
    // cartStore & wishlistStore lắng nghe sự thay đổi này để tự reset state trong bộ nhớ
    set({ token: null, user: null, isLoggedIn: false });
  },

  setUser: (user) => {
    const normalized = normalizeUser(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(normalized));
    }
    set({ user: normalized });
  },
}));

/**
 * Hydrates the auth store from localStorage.
 * Nếu JWT đã hết hạn -> tự động đăng xuất và xóa cache cũ (tránh lỗi 401 khi gọi Cart/Wishlist).
 */
export const hydrateAuth = () => {
  try {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const user = normalizeUser(JSON.parse(localStorage.getItem('user') || 'null'));
      if (token && user) {
        if (isTokenExpired(token)) {
          clearAuthStorage();
          useAuthStore.setState({ token: null, user: null, isLoggedIn: false });
          return;
        }
        useAuthStore.setState({ token, user, isLoggedIn: true });
      }
    }
  } catch {
    clearAuthStorage();
    useAuthStore.setState({ token: null, user: null, isLoggedIn: false });
  }
};
