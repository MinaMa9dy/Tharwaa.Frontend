import { apiClient } from '@/shared/api/client';
import { ApiResult } from '@/shared/types/api';
import { WithdrawalDto, RequestWithdrawalDto } from '@/shared/types/withdrawal';

export const withdrawalService = {
  async getAll(marketerId?: string, search?: string, pageNumber?: number, pageSize?: number): Promise<ApiResult<WithdrawalDto[]>> {
    const response = await apiClient.get<ApiResult<WithdrawalDto[]>>('/Withdrawals', {
      params: { marketerId, search, pageNumber, pageSize },
    });
    return response.data;
  },

  async getMyWithdrawals(pageNumber?: number, pageSize?: number): Promise<ApiResult<WithdrawalDto[]>> {
    const response = await apiClient.get<ApiResult<WithdrawalDto[]>>('/Withdrawals/my', {
      params: { pageNumber, pageSize },
    });
    return response.data;
  },

  async getById(id: number): Promise<ApiResult<WithdrawalDto>> {
    const response = await apiClient.get<ApiResult<WithdrawalDto>>(`/Withdrawals/${id}`);
    return response.data;
  },

  async requestWithdrawal(dto: RequestWithdrawalDto): Promise<ApiResult<WithdrawalDto>> {
    const response = await apiClient.post<ApiResult<WithdrawalDto>>('/Withdrawals', dto);
    return response.data;
  },

  async approve(id: number): Promise<ApiResult<void>> {
    const response = await apiClient.patch<ApiResult<void>>(`/Withdrawals/${id}/approve`);
    return response.data;
  },

  async reject(id: number): Promise<ApiResult<void>> {
    const response = await apiClient.patch<ApiResult<void>>(`/Withdrawals/${id}/reject`);
    return response.data;
  },
};
