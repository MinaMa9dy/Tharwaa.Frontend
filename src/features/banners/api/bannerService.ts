import { apiClient } from '@/shared/api/client';
import { ApiResult } from '@/shared/types/api';
import { BannerDto } from '@/shared/types/banner';

export const bannerService = {
  async getAll(): Promise<ApiResult<BannerDto[]>> {
    const response = await apiClient.get<ApiResult<BannerDto[]>>('/Banners');
    return response.data;
  },

  async create(formData: FormData): Promise<ApiResult<BannerDto>> {
    const response = await apiClient.post<ApiResult<BannerDto>>('/Banners', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async delete(id: number): Promise<ApiResult<void>> {
    const response = await apiClient.delete<ApiResult<void>>(`/Banners/${id}`);
    return response.data;
  },
};
