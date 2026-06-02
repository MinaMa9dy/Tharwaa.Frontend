import { apiClient } from '@/shared/api/client';
import { ApiResult } from '@/shared/types/api';
import { WishlistDto, AddToWishlistDto } from '@/shared/types/wishlist';

export const wishlistService = {
  async getWishlist(): Promise<ApiResult<WishlistDto>> {
    const response = await apiClient.get<ApiResult<WishlistDto>>('/Wishlist');
    return response.data;
  },

  async addToWishlist(dto: AddToWishlistDto): Promise<ApiResult<WishlistDto>> {
    const response = await apiClient.post<ApiResult<WishlistDto>>('/Wishlist', dto);
    return response.data;
  },

  async removeFromWishlist(itemId: number): Promise<ApiResult<WishlistDto>> {
    const response = await apiClient.delete<ApiResult<WishlistDto>>(`/Wishlist/${itemId}`);
    return response.data;
  },
};
