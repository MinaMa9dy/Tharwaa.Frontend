import { apiClient } from '@/shared/api/client';
import { ApiResult } from '@/shared/types/api';
import {
  SalesReportDto,
  MarketerReportDto,
  ProductReportDto,
  FinancialsReportDto,
} from '@/shared/types/reports';

export const reportsService = {
  async getSalesReport(from: string, to: string): Promise<ApiResult<SalesReportDto>> {
    const response = await apiClient.get<ApiResult<SalesReportDto>>('/Reports/sales', {
      params: { from, to },
    });
    return response.data;
  },

  async getMarketersReport(from?: string, to?: string): Promise<ApiResult<MarketerReportDto[]>> {
    const response = await apiClient.get<ApiResult<MarketerReportDto[]>>('/Reports/marketers', {
      params: { from, to },
    });
    return response.data;
  },

  async getProductsReport(from?: string, to?: string): Promise<ApiResult<ProductReportDto[]>> {
    const response = await apiClient.get<ApiResult<ProductReportDto[]>>('/Reports/products', {
      params: { from, to },
    });
    return response.data;
  },

  async getFinancialsReport(from?: string, to?: string): Promise<ApiResult<FinancialsReportDto>> {
    const response = await apiClient.get<ApiResult<FinancialsReportDto>>('/Reports/financials', {
      params: { from, to },
    });
    return response.data;
  },
};
