export enum WithdrawalStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export interface WithdrawalDto {
  id: number;
  marketerId: string;
  marketerName?: string;
  amount: number;
  status: WithdrawalStatus;
  requestedAt: string;
  createdAt?: string;
  processedAt?: string;
  notes?: string;
}

export interface RequestWithdrawalDto {
  amount: number;
  notes?: string;
}
