import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '@/features/products/types';
import { useAuthStore } from './authStore';
import { API_URL } from '@/constants/api-url';
import { toast } from 'sonner';

interface WishlistItem {
  _id: string;
  product_id: Product;
  wishlist: boolean;
  createdAt: string;
}

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  loadWishlistFromServer: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  getTotalItems: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      loadWishlistFromServer: async () => {
        const token = useAuthStore.getState().token;
        if (!token) {
          return;
        }

        set({ isLoading: true });
        try {
          const response = await fetch(`${API_URL}/feedbacks/wishlist`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to load wishlist');
          }

          const data = await response.json();
          set({ items: data.data.wishlist, isLoading: false });
        } catch (error) {
          console.error("Error loading wishlist:", error);
          set({ isLoading: false });
        }
      },

      toggleWishlist: async (productId: string) => {
        const token = useAuthStore.getState().token;
        if (!token) {
          toast.error("Vui lòng đăng nhập để thêm vào yêu thích!");
          return;
        }

        const state = get();
        const existingItem = state.items.find(item => item.product_id._id === productId);

        try {
          if (existingItem) {
            // Remove from wishlist
            const response = await fetch(`${API_URL}/feedbacks/wishlist/${existingItem._id}`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });

            if (!response.ok) {
              throw new Error('Failed to remove from wishlist');
            }

            const updatedItems = state.items.filter(item => item.product_id._id !== productId);
            set({ items: updatedItems });
            toast.success("Đã xóa khỏi danh sách yêu thích!");
          } else {
            // Add to wishlist - Need to create feedback first
            // First check if feedback exists
            const checkResponse = await fetch(`${API_URL}/feedbacks/my-feedbacks`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });

            if (!checkResponse.ok) {
              throw new Error('Failed to check feedbacks');
            }

            const feedbacksData = await checkResponse.json();
            // feedbacksData.data có thể là object hoặc array, cần kiểm tra
            const feedbacksList = Array.isArray(feedbacksData.data) 
              ? feedbacksData.data 
              : feedbacksData.data?.feedbacks || [];
            
            const existingFeedback = feedbacksList.find((f: any) => 
              f.product_id?._id === productId || f.product_id === productId
            );

            if (existingFeedback) {
              // Toggle existing feedback
              const response = await fetch(`${API_URL}/feedbacks/wishlist/${existingFeedback._id}`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (!response.ok) {
                const errorData = await response.json();
                console.error('Toggle wishlist error:', errorData);
                throw new Error(errorData.message || 'Failed to add to wishlist');
              }

              // Reload để đảm bảo dữ liệu chính xác
              await get().loadWishlistFromServer();
              toast.success("Đã thêm vào danh sách yêu thích!");
            } else {
              // Create new feedback with wishlist - wishlist only, no review
              const response = await fetch(`${API_URL}/feedbacks`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                  product_id: productId,
                  rating: 0,
                  wishlist: true,
                }),
              });

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Create feedback error:', errorData);
                
                // Nếu lỗi là đã có feedback, thử load lại và toggle
                if (errorData.message?.includes('already reviewed')) {
                  await get().loadWishlistFromServer();
                  const refreshedItems = get().items;
                  const existingItem = refreshedItems.find(item => item.product_id._id === productId);
                  
                  if (existingItem) {
                    // Feedback đã tồn tại, toggle nó
                    return get().toggleWishlist(productId);
                  }
                }
                
                throw new Error(errorData.message || 'Failed to add to wishlist');
              }

              // Reload để đảm bảo dữ liệu chính xác
              await get().loadWishlistFromServer();
              toast.success("Đã thêm vào danh sách yêu thích!");
            }
          }
        } catch (error) {
          console.error("Error toggling wishlist:", error);
          toast.error("Có lỗi xảy ra. Vui lòng thử lại!");
        }
      },

      isInWishlist: (productId: string) => {
        return get().items.some(item => item.product_id._id === productId);
      },

      getTotalItems: () => {
        return get().items.length;
      },
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
