export interface MarketerDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  isActive: boolean;
  balance: number;
}

export interface CreateMarketerDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}

export interface UpdateMarketerDto extends Partial<CreateMarketerDto> {
  isActive?: boolean;
}

export interface MarketerBalanceDto {
  userId: string;
  balance: number;
  withdrawnAmount: number;
  pendingWithdrawals: number;
}

export interface MarketerStatsDto {
  marketerId: string;
  totalOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalEarnings: number;
  balance: number;
}
