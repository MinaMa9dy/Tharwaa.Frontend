import { apiClient } from '@/shared/api/client';
import { ApiResult } from '@/shared/types/api';
import { SupervisorDto, CreateSupervisorDto, UpdateSupervisorDto } from '@/shared/types/supervisor';

export const supervisorService = {
  async getAll(search?: string, pageNumber?: number, pageSize?: number): Promise<ApiResult<SupervisorDto[]>> {
    const response = await apiClient.get<ApiResult<SupervisorDto[]>>('/Supervisors', {
      params: { search, pageNumber, pageSize },
    });
    return response.data;
  },

  async getById(id: string): Promise<ApiResult<SupervisorDto>> {
    const response = await apiClient.get<ApiResult<SupervisorDto>>(`/Supervisors/${id}`);
    return response.data;
  },

  async create(dto: CreateSupervisorDto): Promise<ApiResult<SupervisorDto>> {
    const response = await apiClient.post<ApiResult<SupervisorDto>>('/Supervisors', dto);
    return response.data;
  },

  async update(id: string, dto: UpdateSupervisorDto): Promise<ApiResult<SupervisorDto>> {
    const response = await apiClient.put<ApiResult<SupervisorDto>>(`/Supervisors/${id}`, dto);
    return response.data;
  },

  async delete(id: string): Promise<ApiResult<void>> {
    const response = await apiClient.delete<ApiResult<void>>(`/Supervisors/${id}`);
    return response.data;
  },

  async toggleActive(id: string): Promise<ApiResult<void>> {
    const response = await apiClient.patch<ApiResult<void>>(`/Supervisors/${id}/toggle-active`);
    return response.data;
  },
};
