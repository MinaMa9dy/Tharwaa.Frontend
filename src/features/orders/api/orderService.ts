import { apiClient } from '@/shared/api/client';
import { ApiResult } from '@/shared/types/api';
import { OrderDto, CreateOrderDto, CancelOrderDto, OrderStatus, OrderItemDto } from '@/shared/types/order';
import { track } from '@vercel/analytics';

export const orderService = {
  async getGovernorates(): Promise<ApiResult<{ id: number; name: string; nameAr: string }[]>> {
    const response = await apiClient.get<ApiResult<{ id: number; name: string; nameAr: string }[]>>('/Orders/governorates');
    return response.data;
  },

  async getAll(marketerId?: string, status?: string, search?: string, pageNumber?: number, pageSize?: number, supervisorId?: string, unassignedOnly?: boolean): Promise<ApiResult<OrderDto[]>> {
    const response = await apiClient.get<ApiResult<OrderDto[]>>('/Orders', {
      params: { marketerId, status, search, pageNumber, pageSize, supervisorId, unassignedOnly },
    });
    return response.data;
  },

  async getMyOrders(status?: string, search?: string, pageNumber?: number, pageSize?: number): Promise<ApiResult<OrderDto[]>> {
    const response = await apiClient.get<ApiResult<OrderDto[]>>('/Orders/my', {
      params: { status, search, pageNumber, pageSize },
    });
    return response.data;
  },

  async getById(id: number): Promise<ApiResult<OrderDto>> {
    const response = await apiClient.get<ApiResult<OrderDto>>(`/Orders/${id}`);
    return response.data;
  },

  async create(dto: CreateOrderDto): Promise<ApiResult<OrderDto>> {
    const response = await apiClient.post<ApiResult<OrderDto>>('/Orders', dto);
    if (response.data.success && response.data.data) {
      track('order_placed', { orderId: response.data.data.id });
    }
    return response.data;
  },

  async updateStatus(id: number, status: OrderStatus, reason?: string): Promise<ApiResult<void>> {
    const response = await apiClient.patch<ApiResult<void>>(`/Orders/${id}/status`, { status, reason });
    return response.data;
  },

  async updateNotes(id: number, notes: string): Promise<ApiResult<void>> {
    const response = await apiClient.patch<ApiResult<void>>(`/Orders/${id}/notes`, { notes });
    return response.data;
  },

  async cancel(id: number, dto: CancelOrderDto): Promise<ApiResult<void>> {
    const response = await apiClient.patch<ApiResult<void>>(`/Orders/${id}/cancel`, dto);
    return response.data;
  },

  async getItems(orderId: number): Promise<ApiResult<OrderItemDto[]>> {
    const response = await apiClient.get<ApiResult<OrderItemDto[]>>(`/Orders/${orderId}/items`);
    return response.data;
  },

  async addItem(orderId: number, dto: any): Promise<ApiResult<OrderItemDto>> {
    const response = await apiClient.post<ApiResult<OrderItemDto>>(`/Orders/${orderId}/items`, dto);
    return response.data;
  },

  async updateItem(orderId: number, itemId: number, dto: any): Promise<ApiResult<void>> {
    const response = await apiClient.put<ApiResult<void>>(`/Orders/${orderId}/items/${itemId}`, dto);
    return response.data;
  },

  async deleteItem(orderId: number, itemId: number): Promise<ApiResult<void>> {
    const response = await apiClient.delete<ApiResult<void>>(`/Orders/${orderId}/items/${itemId}`);
    return response.data;
  },
};
