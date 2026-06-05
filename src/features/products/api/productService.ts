import { apiClient } from '@/shared/api/client';
import { ApiResult, PaginatedResult } from '@/shared/types/api';
import { ProductDto, CreateProductDto, UpdateProductDto, ProductParams, ProductFileDto } from '@/shared/types/product';

function mapProduct(p: any): ProductDto {
  const variants = (p.productVariants || p.variants || []).map((v: any) => ({
    id: v.id,
    sku: v.sku || v.SKU,
    price: v.price !== undefined ? v.price : (v.newPrice || 0),
    quantity: v.stockQuantity !== undefined ? v.stockQuantity : (v.quantity || 0),
    attributes: (v.variantAttributes || v.attributes || []).map((va: any) => ({
      name: va.attributeName || va.name || 'Attribute',
      value: va.value
    }))
  }));

  const files = (p.productPhotos || p.files || p.productImages || []).map((f: any) => ({
    id: f.id,
    url: f.photoUrl || f.url || '',
    isMain: f.isMain || false
  }));

  const firstVariant = variants[0];
  const computedPrice = p.price !== undefined ? p.price : (firstVariant?.price || 0);
  const computedStock = p.stockQuantity !== undefined ? p.stockQuantity : variants.reduce((sum: number, v: any) => sum + v.quantity, 0);

  return {
    ...p,
    price: computedPrice,
    stockQuantity: computedStock,
    variants,
    files,
    isActive: p.isActive !== undefined ? p.isActive : !p.isDeleted
  };
}

export const productService = {
  async getAll(params: ProductParams): Promise<ApiResult<ProductDto[]>> {
    const response = await apiClient.get<ApiResult<any>>('/Products', {
      params,
    });
    
    if (response.data && response.data.success && response.data.data) {
      // The backend returns the list directly in `data.data` and pagination in `data.meta`
      const dataItems = Array.isArray(response.data.data) ? response.data.data : [];
      response.data.data = dataItems.map(mapProduct);
    }
    
    return response.data;
  },

  async getById(id: string): Promise<ApiResult<ProductDto>> {
    const response = await apiClient.get<ApiResult<any>>(`/Products/${id}`);
    if (response.data && response.data.success && response.data.data) {
      response.data.data = mapProduct(response.data.data);
    }
    return response.data;
  },

  async create(dto: CreateProductDto): Promise<ApiResult<ProductDto>> {
    const response = await apiClient.post<ApiResult<ProductDto>>('/Products', dto);
    return response.data;
  },

  async update(id: string, dto: UpdateProductDto): Promise<ApiResult<ProductDto>> {
    const response = await apiClient.put<ApiResult<ProductDto>>(`/Products/${id}`, dto);
    return response.data;
  },

  async delete(id: string): Promise<ApiResult<void>> {
    const response = await apiClient.delete<ApiResult<void>>(`/Products/${id}`);
    return response.data;
  },

  async toggleActive(id: string): Promise<ApiResult<void>> {
    const response = await apiClient.patch<ApiResult<void>>(`/Products/${id}/toggle-active`);
    return response.data;
  },

  async getFiles(productId: string): Promise<ApiResult<ProductFileDto[]>> {
    const response = await apiClient.get<ApiResult<ProductFileDto[]>>(`/Products/${productId}/files`);
    return response.data;
  },

  async uploadFile(productId: string, file: File): Promise<ApiResult<ProductFileDto>> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiResult<ProductFileDto>>(`/Products/${productId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteFile(productId: string, fileId: number): Promise<ApiResult<void>> {
    const response = await apiClient.delete<ApiResult<void>>(`/Products/${productId}/files/${fileId}`);
    return response.data;
  },

  async getAttributes(): Promise<ApiResult<any[]>> {
    const response = await apiClient.get<ApiResult<any[]>>('/Attributes');
    return response.data;
  },
};
