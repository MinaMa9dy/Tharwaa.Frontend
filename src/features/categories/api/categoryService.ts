import { apiClient } from '@/shared/api/client';
import { ApiResult } from '@/shared/types/api';
import { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from '@/shared/types/category';

export const categoryService = {
  async getAll(): Promise<ApiResult<CategoryDto[]>> {
    const response = await apiClient.get<ApiResult<CategoryDto[]>>('/Categories');
    return response.data;
  },

  async getById(id: number): Promise<ApiResult<CategoryDto>> {
    const response = await apiClient.get<ApiResult<CategoryDto>>(`/Categories/${id}`);
    return response.data;
  },

  async create(dto: CreateCategoryDto): Promise<ApiResult<CategoryDto>> {
    const response = await apiClient.post<ApiResult<CategoryDto>>('/Categories', dto);
    return response.data;
  },

  async update(id: number, dto: UpdateCategoryDto): Promise<ApiResult<CategoryDto>> {
    const response = await apiClient.put<ApiResult<CategoryDto>>(`/Categories/${id}`, dto);
    return response.data;
  },

  async delete(id: number): Promise<ApiResult<void>> {
    const response = await apiClient.delete<ApiResult<void>>(`/Categories/${id}`);
    return response.data;
  },

  async toggleActive(id: number): Promise<ApiResult<void>> {
    const response = await apiClient.patch<ApiResult<void>>(`/Categories/${id}/toggle-active`);
    return response.data;
  },
};
