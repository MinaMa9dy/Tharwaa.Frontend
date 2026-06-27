export interface GovernorateSalesDto {
  governorate: string;
  orderCount: number;
  totalRevenue: number;
  deliverySuccessRate: number;
}

export interface DailySalesTrendDto {
  date: string;
  orderCount: number;
  revenue: number;
}

export interface ReportOrderDetailsDto {
  id: number;
  marketerName: string;
  customerName: string;
  customerPhone: string;
  governorate: string;
  status: string;
  totalPrice: number;
  marketerProfit: number;
  createdTime: string;
}

export interface SalesReportDto {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  deliverySuccessRate: number;
  governorateBreakdown: GovernorateSalesDto[];
  dailyTrends: DailySalesTrendDto[];
  detailedOrders: ReportOrderDetailsDto[];
}

export interface MarketerReportDto {
  marketerId: string;
  name: string;
  phone: string;
  totalOrdersCount: number;
  deliveredOrdersCount: number;
  deliverySuccessRate: number;
  totalProfitEarned: number;
  approvedWithdrawals: number;
  pendingWithdrawals: number;
  currentBalance: number;
}

export interface ProductReportDto {
  productId: string;
  name: string;
  categoryName: string;
  supplierName: string;
  stockQuantity: number;
  quantitySold: number;
  totalRevenue: number;
  totalProfit: number;
}

export interface MonthlyFinancialTrendDto {
  month: string;
  grossRevenue: number;
  wholesaleCost: number;
  marketersProfit: number;
  netPlatformProfit: number;
}

export interface ReportWithdrawalDetailsDto {
  id: number;
  marketerName: string;
  marketerPhone: string;
  amount: number;
  status: string;
  createdAt: string;
  notes: string;
}

export interface FinancialsReportDto {
  grossRevenue: number;
  totalWholesaleCost: number;
  marketersProfit: number;
  netPlatformProfit: number;
  approvedWithdrawals: number;
  pendingWithdrawals: number;
  monthlyTrends: MonthlyFinancialTrendDto[];
  withdrawalsLog: ReportWithdrawalDetailsDto[];
}
