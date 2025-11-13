import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '@/features/products/types';
import { useAuthStore } from './authStore';
import { API_URL } from '@/constants/api-url';
import { toast } from 'sonner';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isCartDirty: boolean;
  setIsCartDirty: (dirty: boolean) => void;
  addToCart: (product: Product, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  updateCartOnServer: (items: CartItem[]) => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  loadCartFromServer: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartDirty: false,
      setIsCartDirty: (dirty: boolean) => set({ isCartDirty: dirty }),

      loadCartFromServer: async () => {
        const token = useAuthStore.getState().token;
        if (!token) {
          set({ items: [] });
          return;
        }

        try {
          const response = await fetch(`${API_URL}/cart`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to load cart from server.');
          }

          const data = await response.json();
          const serverItems = data.data.items.map((item: any) => ({
            product: item.laptop_id, // Backend returns populated laptop_id as product
            quantity: item.quantity,
          }));
          set({ items: serverItems });
        } catch (error) {
          console.error("Error loading cart from server:", error);
          set({ items: [] });
        }
      },

      addToCart: async (product, quantity) => {
        const state = get();
        const existingItemIndex = state.items.findIndex(item => item.product._id === product._id);

        let updatedItems;
        if (existingItemIndex > -1) {
          updatedItems = state.items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          updatedItems = [...state.items, { product, quantity }];
        }

        set({ items: updatedItems });
        get().setIsCartDirty(true);
        toast.success("Sản phẩm đã được thêm vào giỏ hàng!");
      },

      removeFromCart: async (productId) => {
        const state = get();
        const updatedItems = state.items.filter(item => item.product._id !== productId);
        set({ items: updatedItems });
        get().setIsCartDirty(true);
      },

      updateQuantity: async (productId, quantity) => {
        const state = get();
        const existingItemIndex = state.items.findIndex(item => item.product._id === productId);

        if (existingItemIndex > -1) {
          let updatedItems;
          if (quantity <= 0) {
            // Remove item if quantity is 0 or less
            updatedItems = state.items.filter(item => item.product._id !== productId);
          } else {
            updatedItems = state.items.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: quantity }
                : item
            );
          }
          set({ items: updatedItems });
          get().setIsCartDirty(true);
        } else {
          console.warn("Attempted to update quantity for a non-existent item.");
        }
      },

      clearCart: async () => {
        set({ items: [] });
        get().setIsCartDirty(true);
      },

      updateCartOnServer: async (items: CartItem[]) => {
        const token = useAuthStore.getState().token;
        if (!token) {
          console.error("User not authenticated for cart operations.");
          throw new Error("User not authenticated.");
        }

        try {
          const cartItemsPayload = items.map(item => ({
            laptop_id: item.product._id,
            quantity: item.quantity,
          }));

          const response = await fetch(`${API_URL}/cart`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ items: cartItemsPayload }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update cart on server.');
          }

          get().setIsCartDirty(false); // Reset dirty state after successful update
        } catch (error) {
          console.error("Error updating cart on server:", error);
          throw error;
        }
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage', // unique name
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
