import { apiClient } from '@/shared/api/client';
import { ApiResult } from '@/shared/types/api';

export interface SystemSettingsDto {
  minimumWithdrawalAmount: number;
}

export const settingsService = {
  async get(): Promise<ApiResult<SystemSettingsDto>> {
    const response = await apiClient.get<ApiResult<SystemSettingsDto>>('/Settings');
    return response.data;
  },

  async update(dto: SystemSettingsDto): Promise<ApiResult<SystemSettingsDto>> {
    const response = await apiClient.put<ApiResult<SystemSettingsDto>>('/Settings', dto);
    return response.data;
  },
};
