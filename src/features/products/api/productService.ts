import { apiClient } from '@/shared/api/client';
import { ApiResult } from '@/shared/types/api';
import {
  ProductDto,
  AdminProductDto,
  NormalizedAttributeDto,
  CreateProductDto,
  UpdateProductDto,
  ProductParams,
  ProductFileDto,
} from '@/shared/types/product';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeAttributes(variantAttributes: any[]): NormalizedAttributeDto[] {
  return (variantAttributes || []).map((va: any) => ({
    name: va.attributeName || va.name || '',
    value: va.value || '',
  }));
}

function normalizeFiles(photos: any[]): ProductFileDto[] {
  return (photos || []).map((f: any) => ({
    id: f.id,
    url: f.photoUrl || f.url || '',
    isMain: f.isMain || false,
  }));
}

// ─── Public mapper (non-admin) ────────────────────────────────────────────────

function mapPublicProduct(p: any): ProductDto {
  const rawVariants = p.productVariants || p.variants || [];
  const variants = rawVariants.map((v: any) => ({
    id: v.id,
    productId: v.productId || '',
    sku: v.sku || v.SKU || '',
    price: v.price ?? 0,
    stockQuantity: v.stockQuantity ?? v.quantity ?? 0,
    quantity: v.stockQuantity ?? v.quantity ?? 0,
    variantAttributes: v.variantAttributes || [],
    attributes: normalizeAttributes(v.variantAttributes || v.attributes || []),
  }));

  const files = normalizeFiles(p.productPhotos || p.files || []);
  const price = variants[0]?.price ?? 0;
  const stockQuantity = variants.reduce((sum: number, v: any) => sum + v.stockQuantity, 0);

  return {
    id: p.id,
    name: p.name,
    description: p.description,
    categoryId: p.categoryId,
    categoryName: p.categoryName,
    productPhotos: p.productPhotos || [],
    productVariants: variants,
    files,
    variants,
    price,
    stockQuantity,
  };
}

// ─── Admin mapper ─────────────────────────────────────────────────────────────

function mapAdminProduct(p: any): AdminProductDto {
  const rawVariants = p.productVariants || p.variants || [];
  const variants = rawVariants.map((v: any) => ({
    id: v.id,
    productId: v.productId || '',
    sku: v.sku || v.SKU || '',
    price: v.price ?? 0,
    purchasePrice: v.purchasePrice ?? 0,
    stockQuantity: v.stockQuantity ?? v.quantity ?? 0,
    quantity: v.stockQuantity ?? v.quantity ?? 0,
    createdAt: v.createdAt || '',
    updatedAt: v.updatedAt,
    variantAttributes: v.variantAttributes || [],
    attributes: normalizeAttributes(v.variantAttributes || v.attributes || []),
  }));

  const files = normalizeFiles(p.productPhotos || p.files || []);
  const price = variants[0]?.price ?? 0;
  const stockQuantity = variants.reduce((sum: number, v: any) => sum + v.stockQuantity, 0);
  const isDeleted = p.isDeleted ?? false;

  return {
    id: p.id,
    name: p.name,
    description: p.description,
    categoryId: p.categoryId,
    categoryName: p.categoryName,
    supplierId: p.supplierId || '',
    isDeleted,
    isActive: !isDeleted,
    createdAt: p.createdAt || '',
    productPhotos: p.productPhotos || [],
    productVariants: variants,
    files,
    variants,
    price,
    stockQuantity,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const productService = {
  // ── Public endpoints (marketer / non-admin) ───────────────────────────────

  async getAll(params: ProductParams): Promise<ApiResult<ProductDto[]>> {
    const response = await apiClient.get<ApiResult<any>>('/Products', { params });
    if (response.data?.success && response.data?.data) {
      const items = Array.isArray(response.data.data) ? response.data.data : [];
      response.data.data = items.map(mapPublicProduct);
    }
    return response.data;
  },

  async getById(id: string): Promise<ApiResult<ProductDto>> {
    const response = await apiClient.get<ApiResult<any>>(`/Products/${id}`);
    if (response.data?.success && response.data?.data) {
      response.data.data = mapPublicProduct(response.data.data);
    }
    return response.data;
  },

  // ── Admin endpoints (Admin role only) ─────────────────────────────────────

  async getAllAdmin(params: ProductParams): Promise<ApiResult<AdminProductDto[]>> {
    const response = await apiClient.get<ApiResult<any>>('/Products', { params });
    if (response.data?.success && response.data?.data) {
      const items = Array.isArray(response.data.data) ? response.data.data : [];
      response.data.data = items.map(mapAdminProduct);
    }
    return response.data;
  },

  async getByIdAdmin(id: string): Promise<ApiResult<AdminProductDto>> {
    const response = await apiClient.get<ApiResult<any>>(`/Products/${id}`);
    if (response.data?.success && response.data?.data) {
      response.data.data = mapAdminProduct(response.data.data);
    }
    return response.data;
  },

  // ── Mutations (Admin role only) ───────────────────────────────────────────

  async create(dto: CreateProductDto): Promise<ApiResult<AdminProductDto>> {
    const response = await apiClient.post<ApiResult<any>>('/Products', dto);
    if (response.data?.success && response.data?.data) {
      response.data.data = mapAdminProduct(response.data.data);
    }
    return response.data;
  },

  async update(id: string, dto: UpdateProductDto): Promise<ApiResult<AdminProductDto>> {
    const response = await apiClient.put<ApiResult<any>>(`/Products/${id}`, dto);
    if (response.data?.success && response.data?.data) {
      response.data.data = mapAdminProduct(response.data.data);
    }
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

  // ── Files ─────────────────────────────────────────────────────────────────

  async getFiles(productId: string): Promise<ApiResult<ProductFileDto[]>> {
    const response = await apiClient.get<ApiResult<ProductFileDto[]>>(`/Products/${productId}/files`);
    return response.data;
  },

  async uploadFile(productId: string, file: File): Promise<ApiResult<ProductFileDto>> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiResult<ProductFileDto>>(
      `/Products/${productId}/files`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  async deleteFile(productId: string, fileId: number): Promise<ApiResult<void>> {
    const response = await apiClient.delete<ApiResult<void>>(`/Products/${productId}/files/${fileId}`);
    return response.data;
  },

  async uploadPhoto(file: File): Promise<ApiResult<string>> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiResult<string>>(
      '/Products/upload-photo',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  // ── Attributes ────────────────────────────────────────────────────────────

  async getAttributes(): Promise<ApiResult<any[]>> {
    const response = await apiClient.get<ApiResult<any[]>>('/Attributes');
    return response.data;
  },
};
