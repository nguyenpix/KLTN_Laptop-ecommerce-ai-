import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '@/features/products/types';
import { useAuthStore, getUserId, isTokenExpired } from './authStore';
import { API_URL } from '@/constants/api-url';
import { toast } from 'sonner';
import { recommendationsAPI } from '@/features/recommendations/api';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  /**
   * Chủ sở hữu của giỏ hàng đang lưu ở local.
   * - null  : giỏ của khách vãng lai (chưa đăng nhập)
   * - string: id của user đã đăng nhập
   * Dùng để tránh việc giỏ của tài khoản A "nhảy" sang tài khoản B.
   */
  ownerId: string | null;
  addToCart: (product: Product, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  resetCart: () => void;
  updateCartOnServer: (items: CartItem[]) => Promise<{ ok: boolean; status: number; message?: string }>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  loadCartFromServer: () => Promise<void>;
}

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (value && typeof value === 'object' && '$numberDecimal' in (value as Record<string, unknown>)) {
    return parseFloat((value as Record<string, string>).$numberDecimal);
  }
  const n = parseFloat(String(value ?? 0));
  return Number.isFinite(n) ? n : 0;
};

/** Gộp các item trùng sản phẩm (cộng dồn số lượng). */
const mergeItems = (base: CartItem[], extra: CartItem[]): CartItem[] => {
  const map = new Map<string, CartItem>();
  [...base, ...extra].forEach((item) => {
    const id = item?.product?._id;
    if (!id) return;
    const existing = map.get(id);
    if (existing) {
      map.set(id, { ...existing, quantity: existing.quantity + item.quantity });
    } else {
      map.set(id, { ...item });
    }
  });
  return Array.from(map.values());
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      ownerId: null,

      loadCartFromServer: async () => {
        const { token, user, logout } = useAuthStore.getState();
        const userId = getUserId(user);
        if (!token || !userId) return;

        if (isTokenExpired(token)) {
          logout();
          return;
        }

        const { items: localItems, ownerId } = get();
        // Chỉ giỏ của khách vãng lai mới được gộp vào tài khoản.
        // Giỏ của một tài khoản khác (ownerId khác) bị bỏ đi hoàn toàn.
        const guestItems = ownerId === null ? localItems : [];

        try {
          const response = await fetch(`${API_URL}/cart`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.status === 401) {
            logout();
            return;
          }

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.warn('Could not load cart from server:', response.status, errorData?.message || '');
            return;
          }

          const data = await response.json();
          const rawItems: Array<{ laptop_id?: Product | null; quantity: number }> = data?.data?.items || [];
          const serverItems: CartItem[] = rawItems
            .filter((item): item is { laptop_id: Product; quantity: number } => Boolean(item && item.laptop_id))
            .map((item) => ({
              product: { ...item.laptop_id, price: toNumber(item.laptop_id.price) },
              quantity: item.quantity,
            }));

          // Tránh race-condition: user đã đổi trong lúc chờ response
          if (getUserId(useAuthStore.getState().user) !== userId) return;

          if (guestItems.length > 0) {
            const merged = mergeItems(serverItems, guestItems);
            set({ items: merged, ownerId: userId });
            await get().updateCartOnServer(merged);
          } else {
            // LUÔN ghi đè, kể cả khi server trả về giỏ rỗng
            set({ items: serverItems, ownerId: userId });
          }
        } catch (error) {
          console.warn('Network error loading cart:', error instanceof Error ? error.message : error);
          if (ownerId !== null && ownerId !== userId) {
            set({ items: [], ownerId: userId });
          }
        }
      },

      addToCart: async (product, quantity) => {
        const { token, user, logout } = useAuthStore.getState();
        const userId = getUserId(user);

        if (token && isTokenExpired(token)) {
          logout();
          toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!');
          return;
        }

        const prevItems = get().items;
        const updatedItems = mergeItems(prevItems, [{ product, quantity }]);
        set({ items: updatedItems, ownerId: token ? userId : null });

        if (token) {
          const result = await get().updateCartOnServer(updatedItems);
          if (result.status === 401) {
            logout();
            toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!');
            return;
          }
          if (!result.ok) {
            set({ items: prevItems });
            toast.error(result.message || 'Không thể thêm vào giỏ hàng!');
            return;
          }
        }
        toast.success('Sản phẩm đã được thêm vào giỏ hàng!');

        recommendationsAPI
          .trackAddToCart({ product_id: product._id, quantity, price: toNumber(product.price) })
          .catch(() => {});
      },

      removeFromCart: async (productId) => {
        const { token, user, logout } = useAuthStore.getState();
        const userId = getUserId(user);
        const prevItems = get().items;
        const updatedItems = prevItems.filter((item) => item?.product?._id && item.product._id !== productId);
        set({ items: updatedItems, ownerId: token && !isTokenExpired(token) ? userId : null });

        if (!token) {
          toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
          return;
        }

        if (isTokenExpired(token)) {
          logout();
          toast.warning('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!');
          return;
        }

        try {
          // Ưu tiên gọi API xóa trực tiếp theo productId; fallback về PUT /cart nếu server chưa restart
          const delRes = await fetch(`${API_URL}/cart/product/${productId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });

          if (delRes.status === 401) {
            logout();
            toast.warning('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!');
            return;
          }

          if (delRes.ok) {
            toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
            return;
          }

          // Fallback sang PUT /cart (ví dụ khi backend chưa restart để nạp route mới)
          const putResult = await get().updateCartOnServer(updatedItems);
          if (putResult.status === 401) {
            logout();
            toast.warning('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!');
            return;
          }
          if (!putResult.ok) {
            set({ items: prevItems });
            toast.error(putResult.message || 'Không thể xóa sản phẩm khỏi giỏ hàng!');
            return;
          }
          toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
        } catch (error) {
          console.warn('Error removing cart item:', error instanceof Error ? error.message : error);
          set({ items: prevItems });
          toast.error('Không thể kết nối máy chủ để xóa sản phẩm!');
        }
      },

      updateQuantity: async (productId, quantity) => {
        const { token, user, logout } = useAuthStore.getState();
        const userId = getUserId(user);
        const prevItems = get().items;
        if (!prevItems.some((item) => item?.product?._id === productId)) {
          return;
        }
        if (!Number.isFinite(quantity)) return;

        if (quantity <= 0) {
          await get().removeFromCart(productId);
          return;
        }

        const updatedItems = prevItems.map((item) =>
          item.product._id === productId ? { ...item, quantity } : item
        );
        set({ items: updatedItems, ownerId: token && !isTokenExpired(token) ? userId : null });

        if (!token) return;
        if (isTokenExpired(token)) {
          logout();
          toast.warning('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!');
          return;
        }

        const result = await get().updateCartOnServer(updatedItems);
        if (result.status === 401) {
          logout();
          toast.warning('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!');
          return;
        }
        if (!result.ok) {
          set({ items: prevItems });
          toast.error(result.message || 'Không thể cập nhật số lượng!');
        }
      },

      clearCart: async () => {
        const { token, logout } = useAuthStore.getState();
        set({ items: [] });
        if (!token) return;
        if (isTokenExpired(token)) {
          logout();
          return;
        }
        const result = await get().updateCartOnServer([]);
        if (result.status === 401) {
          logout();
        }
      },

      /** Chỉ xóa giỏ ở local (dùng khi đăng xuất / sau khi đặt hàng). */
      resetCart: () => {
        set({ items: [], ownerId: null });
      },

      updateCartOnServer: async (items: CartItem[]) => {
        const token = useAuthStore.getState().token;
        if (!token) {
          return { ok: false, status: 401, message: 'User not authenticated.' };
        }

        try {
          const cartItemsPayload = items
            .filter((item) => item?.product?._id)
            .map((item) => ({
              laptop_id: item.product._id,
              quantity: item.quantity,
            }));

          const response = await fetch(`${API_URL}/cart`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ items: cartItemsPayload }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
              ok: false,
              status: response.status,
              message: errorData.message || 'Failed to update cart on server.',
            };
          }

          return { ok: true, status: response.status };
        } catch (error) {
          return {
            ok: false,
            status: 0,
            message: error instanceof Error ? error.message : 'Network error',
          };
        }
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          if (item.product) {
            return total + toNumber(item.product.price) * item.quantity;
          }
          return total;
        }, 0);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, ownerId: state.ownerId }),
    }
  )
);

// Khi đăng xuất hoặc đổi tài khoản: xóa giỏ hàng ở local ngay lập tức
useAuthStore.subscribe((state, prevState) => {
  const prevId = getUserId(prevState.user);
  const nextId = getUserId(state.user);
  if (prevId && prevId !== nextId) {
    useCartStore.getState().resetCart();
  }
});
