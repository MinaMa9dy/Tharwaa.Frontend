import { apiClient } from '@/shared/api/client';
import { ApiResult } from '@/shared/types/api';
import { DashboardStatsDto, TopMarketerDto, TopProductDto, SalesPeriodDto } from '@/shared/types/dashboard';

export const dashboardService = {
  async getStats(): Promise<ApiResult<DashboardStatsDto>> {
    const response = await apiClient.get<ApiResult<DashboardStatsDto>>('/Dashboard/stats');
    return response.data;
  },

  async getTopMarketers(): Promise<ApiResult<TopMarketerDto[]>> {
    const response = await apiClient.get<ApiResult<TopMarketerDto[]>>('/Dashboard/top-marketers');
    return response.data;
  },

  async getTopProducts(): Promise<ApiResult<TopProductDto[]>> {
    const response = await apiClient.get<ApiResult<TopProductDto[]>>('/Dashboard/top-products');
    return response.data;
  },

  async getSales(from: string, to: string): Promise<ApiResult<SalesPeriodDto[]>> {
    const response = await apiClient.get<ApiResult<SalesPeriodDto[]>>('/Dashboard/sales', {
      params: { from, to },
    });
    return response.data;
  },
};
