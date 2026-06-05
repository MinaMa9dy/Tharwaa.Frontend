import { apiClient } from '@/shared/api/client';
import { ApiResult } from '@/shared/types/api';
import { SupplierDto, CreateSupplierDto, UpdateSupplierDto } from '@/shared/types/supplier';

export const supplierService = {
  async getAll(search?: string, pageNumber?: number, pageSize?: number): Promise<ApiResult<SupplierDto[]>> {
    const response = await apiClient.get<ApiResult<SupplierDto[]>>('/Suppliers', {
      params: { search, pageNumber, pageSize },
    });
    return response.data;
  },

  async getById(id: string): Promise<ApiResult<SupplierDto>> {
    const response = await apiClient.get<ApiResult<SupplierDto>>(`/Suppliers/${id}`);
    return response.data;
  },

  async create(dto: CreateSupplierDto): Promise<ApiResult<SupplierDto>> {
    const response = await apiClient.post<ApiResult<SupplierDto>>('/Suppliers', dto);
    return response.data;
  },

  async update(id: string, dto: UpdateSupplierDto): Promise<ApiResult<SupplierDto>> {
    const response = await apiClient.put<ApiResult<SupplierDto>>(`/Suppliers/${id}`, dto);
    return response.data;
  },

  async delete(id: string): Promise<ApiResult<void>> {
    const response = await apiClient.delete<ApiResult<void>>(`/Suppliers/${id}`);
    return response.data;
  },

  async toggleActive(id: string): Promise<ApiResult<void>> {
    const response = await apiClient.patch<ApiResult<void>>(`/Suppliers/${id}/toggle-active`);
    return response.data;
  },
};
