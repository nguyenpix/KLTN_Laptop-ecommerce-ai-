import { create } from 'zustand';

interface AuthState {
  token: string | null;
  user: any | null; // Sẽ thay thế 'any' bằng kiểu User cụ thể
  isLoggedIn: boolean;
  login: (token: string, user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  //  Khởi tạo trạng thái rỗng
  token: null,
  user: null,
  isLoggedIn: false,

  // Hàm login, chỉ ghi vào localStorage ở phía client
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
 * reset trạng thái đăng nhập từ localStorage khi ứng dụng chạy ở client.
 */
export const hydrateAuth = () => {
  try {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (token && user) {
      useAuthStore.setState({ token, user, isLoggedIn: true });
    }
  } catch (error) {
    // Xử lý lỗi nếu JSON parse thất bại
    console.error("Failed to hydrate auth from localStorage", error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    useAuthStore.setState({ token: null, user: null, isLoggedIn: false });
  }
};
