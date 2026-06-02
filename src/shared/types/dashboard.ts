import { MarketerDto } from './marketer';
import { ProductDto } from './product';

export interface DashboardStatsDto {
  totalMarketers: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalWithdrawals: number;
  pendingWithdrawals: number;
}

export interface TopMarketerDto {
  marketerId: string;
  marketerName: string;
  totalOrders: number;
  totalEarnings: number;
}

export interface TopProductDto {
  productId: string;
  productName: string;
  totalOrdered: number;
  imageUrl?: string;
  price?: number;
}

export interface SalesPeriodDto {
  date: string;
  totalRevenue: number;
  orderCount: number;
}
