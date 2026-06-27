// ─── Shared raw backend types ─────────────────────────────────────────────────

/** Matches backend ProductPhotoDto */
export interface ProductPhotoDto {
  id: number;
  productId: string;
  photoUrl: string;
  isMain: boolean;
}

/** Matches backend VariantAttributeDto */
export interface VariantAttributeDto {
  id: string;
  variantId: string;
  attributeId: string;
  attributeName: string;
  attributeDataType: string;
  value: string;
}

// ─── Normalized frontend-only types ──────────────────────────────────────────

/** Normalized photo for UI display */
export interface ProductFileDto {
  id: number;
  url: string;
  isMain: boolean;
}

/** Attribute normalized for UI display */
export interface NormalizedAttributeDto {
  name: string;
  value: string;
}

// ─── Public product types (non-admin users / marketer) ───────────────────────

export interface ProductVariantDto {
  id: string;
  productId: string;
  sku: string;
  price: number;
  lowestPriceToSell: number;
  stockQuantity: number;
  /** Alias for stockQuantity – normalized for frontend */
  quantity: number;
  variantAttributes: VariantAttributeDto[];
  /** Normalized attributes for display */
  attributes: NormalizedAttributeDto[];
}

export interface ProductDto {
  id: string;
  name: string;
  description?: string;
  categoryId: number;
  categoryName?: string;
  productPhotos: ProductPhotoDto[];
  productVariants: ProductVariantDto[];
  /** Normalized for display */
  files: ProductFileDto[];
  variants: ProductVariantDto[];
  /** Computed: first variant price */
  price: number;
  /** Computed: total stock across all variants */
  stockQuantity: number;
}

// ─── Admin product types ──────────────────────────────────────────────────────

/** Matches backend AdminProductVariantDto — includes sensitive admin-only fields */
export interface AdminProductVariantDto {
  id: string;
  productId: string;
  sku: string;
  price: number;
  purchasePrice: number;
  lowestPriceToSell: number;
  stockQuantity: number;
  /** Alias for stockQuantity – normalized for frontend */
  quantity: number;
  createdAt: string;
  updatedAt?: string;
  variantAttributes: VariantAttributeDto[];
  /** Normalized attributes for display */
  attributes: NormalizedAttributeDto[];
}

/** Matches backend AdminProductDto — includes admin-only fields */
export interface AdminProductDto {
  id: string;
  name: string;
  description?: string;
  categoryId: number;
  categoryName?: string;
  supplierId: string;
  isDeleted: boolean;
  /** Computed: !isDeleted */
  isActive: boolean;
  createdAt: string;
  productPhotos: ProductPhotoDto[];
  productVariants: AdminProductVariantDto[];
  /** Normalized for display */
  files: ProductFileDto[];
  variants: AdminProductVariantDto[];
  /** Computed: first variant price */
  price: number;
  /** Computed: total stock across all variants */
  stockQuantity: number;
}

// ─── Request / Create types ───────────────────────────────────────────────────

export interface CreateProductPhotoDto {
  photoUrl: string;
  isMain: boolean;
}

export interface CreateVariantAttributeDto {
  attributeId: string;
  value: string;
}

export interface CreateProductVariantDto {
  sku: string;
  price: number;
  purchasePrice: number;
  lowestPriceToSell: number;
  stockQuantity: number;
  variantAttributes: CreateVariantAttributeDto[];
}

export interface CreateProductDto {
  name: string;
  description: string;
  categoryId: number;
  supplierId: string;
  productPhotos?: CreateProductPhotoDto[];
  productVariants?: CreateProductVariantDto[];
}

export interface UpdateProductDto {
  name: string;
  description: string;
  categoryId: number;
  supplierId: string;
  productPhotos?: CreateProductPhotoDto[];
  productVariants?: CreateProductVariantDto[];
}

// ─── Query params ─────────────────────────────────────────────────────────────

export interface ProductParams {
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  isDescending?: boolean;
  pageNumber?: number;
  pageSize?: number;
  includeInactive?: boolean;
}
