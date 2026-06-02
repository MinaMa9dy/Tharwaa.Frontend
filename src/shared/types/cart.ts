export interface CartItemDto {
  id: number;
  productId: string;
  productVariantId: string;
  productName: string;
  productPrice: number;
  productCostPrice: number;
  variantId?: string;
  variantSku?: string;
  productPhotoUrl?: string;
  quantity: number;
}

export interface CartDto {
  id: number;
  marketerId: string;
  items: CartItemDto[];
  totalPrice: number;
}

export interface AddToCartDto {
  productVariantId: string;
  quantity: number;
  priceToSell: number;
}

export interface UpdateCartItemDto {
  quantity: number;
  priceToSell: number;
}
