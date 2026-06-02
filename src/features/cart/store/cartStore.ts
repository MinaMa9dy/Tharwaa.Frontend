import { create } from 'zustand';
import { CartDto, CartItemDto } from '@/shared/types/cart';
import { cartService } from '../api/cartService';

interface CartState {
  cart: CartDto | null;
  loading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, variantId?: string, quantity?: number, productDetails?: any, customPrice?: number) => Promise<void>;
  updateQty: (itemId: number, quantity: number, priceToSell?: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  loading: false,
  error: null,
  
  fetchCart: async () => {
    set({ loading: true, error: null });
    try {
      const res = await cartService.getCart();
      if (res.success && res.data) {
        set({ cart: res.data, loading: false });
      } else {
        set({ error: res.message || 'فشل تحميل السلة', loading: false });
      }
    } catch (err: any) {
      set({ error: err.message || 'خطأ في جلب بيانات السلة', loading: false });
    }
  },

  addItem: async (productId, variantId, quantity = 1, productDetails?: any, customPrice?: number) => {
    const previousCart = get().cart;
    const sellingPrice = customPrice !== undefined ? customPrice : (productDetails?.price || 0);
    const costPrice = productDetails?.price || 0;
    
    const finalVariantId = variantId || productDetails?.variants?.[0]?.id || productDetails?.productVariants?.[0]?.id;
    if (!finalVariantId) {
      throw new Error("يجب اختيار نوع للمنتج");
    }

    // Optimistic Update
    if (previousCart) {
      const existingItemIndex = previousCart.items.findIndex(i => i.productId === productId && (i.variantId === finalVariantId || i.productVariantId === finalVariantId));
      let newItems = [...previousCart.items];
      
      if (existingItemIndex >= 0) {
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity
        };
      } else {
        newItems.push({
          id: Date.now(), // Temporary ID until backend syncs
          productId,
          productVariantId: finalVariantId,
          variantId: finalVariantId,
          quantity,
          productName: productDetails?.name || '...',
          productPrice: sellingPrice,
          productCostPrice: costPrice
        });
      }
      
      const newTotalPrice = newItems.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0);
      set({ cart: { ...previousCart, items: newItems, totalPrice: newTotalPrice }, error: null });
    } else {
      set({ loading: true, error: null });
    }

    try {
      const res = await cartService.addToCart({ productVariantId: finalVariantId, quantity, priceToSell: sellingPrice });
      if (res.success && res.data) {
        // Sync with real server data
        set({ cart: res.data, loading: false });
      } else {
        // Revert on failure
        if (previousCart) set({ cart: previousCart });
        set({ error: res.message || 'فشل إضافة المنتج للسلة', loading: false });
      }
    } catch (err: any) {
      // Revert on error
      if (previousCart) set({ cart: previousCart });
      set({ error: err.message, loading: false });
    }
  },

  updateQty: async (itemId, quantity, priceToSell) => {
    const previousCart = get().cart;
    if (!previousCart) return;

    const item = previousCart.items.find(i => i.id === itemId);
    const finalPriceToSell = priceToSell !== undefined ? priceToSell : (item?.productPrice || 0);

    // Optimistic Update
    const newItems = previousCart.items.map(it => 
      it.id === itemId ? { ...it, quantity, productPrice: finalPriceToSell } : it
    );
    const newTotalPrice = newItems.reduce((sum, it) => sum + (it.productPrice * it.quantity), 0);
    set({ cart: { ...previousCart, items: newItems, totalPrice: newTotalPrice } });

    try {
      const res = await cartService.updateCartItem(itemId, { quantity, priceToSell: finalPriceToSell });
      if (res.success && res.data) {
        set({ cart: res.data });
      } else {
        // Revert on failure
        set({ cart: previousCart, error: res.message });
      }
    } catch (err: any) {
      // Revert on error
      set({ cart: previousCart, error: err.message });
    }
  },

  removeItem: async (itemId) => {
    const previousCart = get().cart;
    if (!previousCart) return;

    // Optimistic Update
    const newItems = previousCart.items.filter(item => item.id !== itemId);
    const newTotalPrice = newItems.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0);
    set({ cart: { ...previousCart, items: newItems, totalPrice: newTotalPrice } });

    try {
      const res = await cartService.removeFromCart(itemId);
      if (res.success && res.data) {
        set({ cart: res.data });
      } else {
        // Revert on failure
        set({ cart: previousCart, error: res.message });
      }
    } catch (err: any) {
      // Revert on error
      set({ cart: previousCart, error: err.message });
    }
  },

  clearCart: async () => {
    const previousCart = get().cart;
    if (!previousCart) return;
    
    // Optimistic Update
    set({ cart: { ...previousCart, items: [], totalPrice: 0 } });

    try {
      await cartService.clearCart();
    } catch (err: any) {
      // Revert on error
      set({ cart: previousCart, error: err.message });
    }
  },
}));
