import { apiClient } from '@/shared/api/client';
import { ApiResult } from '@/shared/types/api';
import { MarketerDto, CreateMarketerDto, UpdateMarketerDto, MarketerBalanceDto, MarketerStatsDto } from '@/shared/types/marketer';

export const marketerService = {
  async getAll(search?: string, pageNumber?: number, pageSize?: number): Promise<ApiResult<MarketerDto[]>> {
    const response = await apiClient.get<ApiResult<MarketerDto[]>>('/Marketers', {
      params: { search, pageNumber, pageSize },
    });
    return response.data;
  },

  async getById(id: string): Promise<ApiResult<MarketerDto>> {
    const response = await apiClient.get<ApiResult<MarketerDto>>(`/Marketers/${id}`);
    return response.data;
  },

  async create(dto: CreateMarketerDto): Promise<ApiResult<MarketerDto>> {
    const response = await apiClient.post<ApiResult<MarketerDto>>('/Marketers', dto);
    return response.data;
  },

  async update(id: string, dto: UpdateMarketerDto): Promise<ApiResult<MarketerDto>> {
    const response = await apiClient.put<ApiResult<MarketerDto>>(`/Marketers/${id}`, dto);
    return response.data;
  },

  async delete(id: string): Promise<ApiResult<void>> {
    const response = await apiClient.delete<ApiResult<void>>(`/Marketers/${id}`);
    return response.data;
  },

  async toggleActive(id: string): Promise<ApiResult<void>> {
    const response = await apiClient.patch<ApiResult<void>>(`/Marketers/${id}/toggle-active`);
    return response.data;
  },

  async getBalance(id: string): Promise<ApiResult<MarketerBalanceDto>> {
    const response = await apiClient.get<ApiResult<MarketerBalanceDto>>(`/Marketers/${id}/balance`);
    return response.data;
  },

  async getStats(id: string): Promise<ApiResult<MarketerStatsDto>> {
    const response = await apiClient.get<ApiResult<MarketerStatsDto>>(`/Marketers/${id}/stats`);
    return response.data;
  },
};
