import { apiClient } from '@/shared/api/client';
import { ApiResult } from '@/shared/types/api';
import { AttributeDto, CreateAttributeDto, UpdateAttributeDto } from '@/shared/types/attribute';

export const attributeService = {
  async getAll(): Promise<ApiResult<AttributeDto[]>> {
    const response = await apiClient.get<ApiResult<AttributeDto[]>>('/Attributes');
    return response.data;
  },

  async getById(id: string): Promise<ApiResult<AttributeDto>> {
    const response = await apiClient.get<ApiResult<AttributeDto>>(`/Attributes/${id}`);
    return response.data;
  },

  async create(dto: CreateAttributeDto): Promise<ApiResult<AttributeDto>> {
    const response = await apiClient.post<ApiResult<AttributeDto>>('/Attributes', dto);
    return response.data;
  },

  async update(id: string, dto: UpdateAttributeDto): Promise<ApiResult<AttributeDto>> {
    const response = await apiClient.put<ApiResult<AttributeDto>>(`/Attributes/${id}`, dto);
    return response.data;
  },

  async delete(id: string): Promise<ApiResult<void>> {
    const response = await apiClient.delete<ApiResult<void>>(`/Attributes/${id}`);
    return response.data;
  },
};
