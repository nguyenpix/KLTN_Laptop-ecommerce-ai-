import { create } from 'zustand';
import { Product } from '@/features/products/types';
import { useAuthStore, getUserId, isTokenExpired } from './authStore';
import { API_URL } from '@/constants/api-url';
import { toast } from 'sonner';
import { recommendationsAPI } from '@/features/recommendations/api';

interface WishlistItem {
  _id: string;
  product_id: Product;
  wishlist: boolean;
  createdAt: string;
}

interface WishlistState {
  items: WishlistItem[];
  ownerId: string | null;
  isLoading: boolean;
  loadWishlistFromServer: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  resetWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
  getTotalItems: () => number;
}

const authHeaders = (token: string, json = false): HeadersInit => ({
  Authorization: `Bearer ${token}`,
  ...(json ? { 'Content-Type': 'application/json' } : {}),
});

/**
 * Wishlist KHÔNG được persist xuống localStorage: dữ liệu luôn lấy từ server
 * theo đúng tài khoản đang đăng nhập, tránh lẫn dữ liệu giữa các tài khoản.
 */
export const useWishlistStore = create<WishlistState>()((set, get) => ({
  items: [],
  ownerId: null,
  isLoading: false,

  loadWishlistFromServer: async () => {
    const { token, user, logout } = useAuthStore.getState();
    const userId = getUserId(user);
    if (!token || !userId) return;

    if (isTokenExpired(token)) {
      logout();
      return;
    }

    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/feedbacks/wishlist`, {
        method: 'GET',
        headers: authHeaders(token),
      });

      if (response.status === 401) {
        logout();
        set({ items: [], ownerId: null, isLoading: false });
        return;
      }

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        console.warn('Could not load wishlist:', response.status, errBody?.message || '');
        set({ isLoading: false });
        return;
      }

      const data = await response.json();
      // Tránh race-condition khi user đã đổi trong lúc chờ
      if (getUserId(useAuthStore.getState().user) !== userId) return;

      const items: WishlistItem[] = (data?.data?.wishlist || []).filter(
        (item: WishlistItem) => item && item.product_id && item.product_id._id
      );
      set({ items, ownerId: userId, isLoading: false });
    } catch (error) {
      console.warn('Network error loading wishlist:', error instanceof Error ? error.message : error);
      set({ isLoading: false });
    }
  },

  toggleWishlist: async (productId: string) => {
    const { token, logout } = useAuthStore.getState();
    if (!token || isTokenExpired(token)) {
      if (token) logout();
      toast.error('Vui lòng đăng nhập để thêm vào yêu thích!');
      return;
    }

    const existingItem = get().items.find((item) => item.product_id?._id === productId);

    try {
      if (existingItem) {
        const response = await fetch(`${API_URL}/feedbacks/wishlist/${existingItem._id}`, {
          method: 'POST',
          headers: authHeaders(token),
        });
        if (response.status === 401) {
          logout();
          toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!');
          return;
        }
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          toast.error(errorData.message || 'Không thể xóa khỏi danh sách yêu thích!');
          return;
        }
        set({ items: get().items.filter((item) => item.product_id?._id !== productId) });
        toast.success('Đã xóa khỏi danh sách yêu thích!');
        return;
      }

      // Thêm yêu thích: tìm feedback sẵn có của user cho sản phẩm này
      const checkResponse = await fetch(`${API_URL}/feedbacks/my-feedbacks?limit=1000`, {
        method: 'GET',
        headers: authHeaders(token),
      });
      if (checkResponse.status === 401) {
        logout();
        toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!');
        return;
      }
      if (!checkResponse.ok) {
        toast.error('Không thể kiểm tra danh sách yêu thích!');
        return;
      }

      const feedbacksData = await checkResponse.json();
      const feedbacksList: Array<{ _id: string; product_id?: { _id?: string } | string }> = Array.isArray(feedbacksData.data)
        ? feedbacksData.data
        : feedbacksData.data?.feedbacks || [];
      const existingFeedback = feedbacksList.find((f) =>
        typeof f.product_id === 'string'
          ? f.product_id === productId
          : f.product_id?._id === productId
      );

      const response = existingFeedback
        ? await fetch(`${API_URL}/feedbacks/wishlist/${existingFeedback._id}`, {
            method: 'POST',
            headers: authHeaders(token),
          })
        : await fetch(`${API_URL}/feedbacks`, {
            method: 'POST',
            headers: authHeaders(token, true),
            body: JSON.stringify({ product_id: productId, rating: 0, wishlist: true }),
          });

      if (response.status === 401) {
        logout();
        toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || 'Không thể thêm vào danh sách yêu thích!');
        return;
      }

      await get().loadWishlistFromServer();
      toast.success('Đã thêm vào danh sách yêu thích!');
      recommendationsAPI.toggleLike(productId).catch(() => {});
    } catch (error) {
      console.warn('Error toggling wishlist:', error instanceof Error ? error.message : error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  },

  resetWishlist: () => set({ items: [], ownerId: null, isLoading: false }),

  isInWishlist: (productId: string) => {
    return get().items.some((item) => item.product_id?._id === productId);
  },

  getTotalItems: () => get().items.length,
}));

// Khi đăng xuất hoặc đổi tài khoản: xóa wishlist trong bộ nhớ
useAuthStore.subscribe((state, prevState) => {
  const prevId = getUserId(prevState.user);
  const nextId = getUserId(state.user);
  if (prevId && prevId !== nextId) {
    useWishlistStore.getState().resetWishlist();
  }
});
