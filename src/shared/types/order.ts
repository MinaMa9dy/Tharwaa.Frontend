export enum OrderStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled',
}

export interface AddressDto {
  street: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
}

export interface OrderItemDto {
  id: number;
  productId: string;
  productName: string;
  variantId?: string;
  variantSku?: string;
  quantity: number;
  price?: number;
  costPrice?: number;
  unitPrice: number;
  unitProfit: number;
}

export interface OrderDto {
  id: number;
  marketerId: string;
  marketerName?: string;
  supervisorId?: string;
  supervisorName?: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  shippingAddress: AddressDto;
  status: OrderStatus;
  cancellationReason?: string;
  notes?: string;
  createdAt: string;
  totalAmount: number;
  totalCost: number;
  commission: number;
  items: OrderItemDto[];
}

export interface CreateOrderItemDto {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number; // Selling price set by marketer
}

export interface CreateOrderDto {
  customerName: string;
  customerPhone: string;
  shippingAddress: AddressDto;
  items: CreateOrderItemDto[];
}

export interface CancelOrderDto {
  reason?: string;
}
