import { apiClient } from '@/shared/api/client';
import { ApiResult } from '@/shared/types/api';
import { CartDto, AddToCartDto, UpdateCartItemDto } from '@/shared/types/cart';

export const cartService = {
  async getCart(): Promise<ApiResult<CartDto>> {
    const response = await apiClient.get<ApiResult<any>>('/Cart');
    
    if (response.data.success) {
      const itemsData = Array.isArray(response.data.data) ? response.data.data : [];
      
      const itemsWithPrices = itemsData.map((item: any) => {
        const costPrice = item.wholesalePrice || 0;
        const sellingPrice = item.priceToSell !== undefined ? item.priceToSell : costPrice;
        return {
          id: item.id,
          productId: item.productId,
          productVariantId: item.productVariantId,
          productName: item.productName || 'Unknown',
          productPrice: sellingPrice,
          productCostPrice: costPrice,
          variantId: item.productVariantId,
          variantSku: item.variantSku || '',
          productPhotoUrl: item.productPhotoUrl || '',
          quantity: item.quantity
        };
      });

      response.data.data = {
        id: 1,
        marketerId: '',
        items: itemsWithPrices,
        totalPrice: itemsWithPrices.reduce((sum, i) => sum + (i.productPrice * i.quantity), 0)
      };
    }
    
    return response.data;
  },

  async addToCart(dto: AddToCartDto): Promise<ApiResult<CartDto>> {
    const response = await apiClient.post<ApiResult<any>>('/Cart', dto);
    if (response.data.success) {
      return this.getCart();
    }
    return response.data;
  },

  async updateCartItem(itemId: number, dto: UpdateCartItemDto): Promise<ApiResult<CartDto>> {
    const response = await apiClient.put<ApiResult<any>>(`/Cart/${itemId}`, dto);
    if (response.data.success) {
      return this.getCart();
    }
    return response.data;
  },

  async removeFromCart(itemId: number): Promise<ApiResult<CartDto>> {
    const response = await apiClient.delete<ApiResult<any>>(`/Cart/${itemId}`);
    if (response.status === 204 || response.data?.success) {
      return this.getCart();
    }
    return response.data || { success: false, message: 'Failed to remove item' };
  },

  async clearCart(): Promise<ApiResult<void>> {
    const response = await apiClient.delete<ApiResult<void>>('/Cart/clear');
    if (response.status === 204 || response.data?.success) {
      return { success: true };
    }
    return response.data || { success: false, message: 'Failed to clear cart' };
  },
};
