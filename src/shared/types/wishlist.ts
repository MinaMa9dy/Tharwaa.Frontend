export interface WishlistItemDto {
  id: number;
  productId: string;
  productName: string;
  productPrice: number;
  imageUrl?: string;
}

export interface WishlistDto {
  id: number;
  marketerId: string;
  items: WishlistItemDto[];
}

export interface AddToWishlistDto {
  productId: string;
}
