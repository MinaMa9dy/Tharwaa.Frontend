import { create } from 'zustand';
import { WishlistItemDto } from '@/shared/types/wishlist';
import { wishlistService } from '../api/wishlistService';

interface WishlistState {
  wishlist: WishlistItemDto[] | null;
  loading: boolean;
  error: string | null;
  fetchWishlist: () => Promise<void>;
  addItem: (productId: string, productName: string, productPrice: number, imageUrl?: string) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlist: null,
  loading: false,
  error: null,

  fetchWishlist: async () => {
    set({ loading: true, error: null });
    try {
      const res = await wishlistService.getWishlist();
      if (res.success && res.data) {
        // res.data is a flat array: WishDto[] / WishlistItemDto[]
        const items = Array.isArray(res.data) ? res.data : [];
        set({ wishlist: items, loading: false });
      } else {
        set({ error: res.message || 'Failed to load wishlist', loading: false });
      }
    } catch (err: any) {
      set({ error: err.message || 'Error fetching wishlist', loading: false });
    }
  },

  addItem: async (productId, productName, productPrice, imageUrl) => {
    const previousWishlist = get().wishlist;
    
    // Check if already exists in wishlist locally to prevent duplicate optimistic updates
    if (previousWishlist) {
      const alreadyExists = previousWishlist.some(i => i.productId === productId);
      if (alreadyExists) return;
    }

    // Prepare new item for optimistic state
    const tempId = Date.now(); // temporary ID
    const newItems = previousWishlist 
      ? [...previousWishlist, { id: tempId, productId, productName, productPrice, imageUrl }] 
      : [{ id: tempId, productId, productName, productPrice, imageUrl }];

    // Apply Optimistic Update
    set({ wishlist: newItems, error: null });

    try {
      const res = await wishlistService.addToWishlist({ productId });
      if (res.success && res.data) {
        // res.data is the newly added single WishDto
        const realItem = res.data as any;
        set((state) => {
          const currentList = state.wishlist ? [...state.wishlist] : [];
          const index = currentList.findIndex(i => i.productId === productId);
          if (index >= 0) {
            currentList[index] = {
              ...currentList[index],
              id: realItem.id, // sync with real backend-generated ID
              productPrice: realItem.productPrice || productPrice,
              imageUrl: realItem.imageUrl || imageUrl
            };
          }
          return { wishlist: currentList, loading: false };
        });
      } else {
        // Revert on backend validation error
        set({ wishlist: previousWishlist, error: res.message || 'Failed to add item to wishlist', loading: false });
      }
    } catch (err: any) {
      // Revert on connection error
      set({ wishlist: previousWishlist, error: err.message || 'Connection error', loading: false });
    }
  },

  removeItem: async (itemId) => {
    const previousWishlist = get().wishlist;
    if (!previousWishlist) return;

    // Optimistic Update
    const newItems = previousWishlist.filter(item => item.id !== itemId);
    set({ wishlist: newItems, error: null });

    try {
      const res = await wishlistService.removeFromWishlist(itemId);
      if (res.success) {
        // Sync complete (backend returned 204 NoContent, list already updated)
      } else {
        // Revert on failure
        set({ wishlist: previousWishlist, error: res.message || 'Failed to remove item' });
      }
    } catch (err: any) {
      // Revert on connection error
      set({ wishlist: previousWishlist, error: err.message || 'Connection error' });
    }
  },

  clearWishlist: () => {
    set({ wishlist: null, error: null });
  }
}));
