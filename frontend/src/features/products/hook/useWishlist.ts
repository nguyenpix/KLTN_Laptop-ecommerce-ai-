import { useWishlistStore } from '@/store/wishlistStore';

export const useWishlist = () => {
  const { items, isLoading, loadWishlistFromServer, toggleWishlist, isInWishlist, getTotalItems } = useWishlistStore();

  return {
    wishlistItems: items,
    isLoading,
    loadWishlist: loadWishlistFromServer,
    toggleWishlist,
    isInWishlist,
    getTotalWishlistItems: getTotalItems,
  };
};
