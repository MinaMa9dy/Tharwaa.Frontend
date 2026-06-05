export interface ProductFileDto {
  id: number;
  url: string;
  isMain: boolean;
}

export interface VariantAttributeDto {
  name: string;
  value: string;
}

export interface ProductVariantDto {
  id: string;
  sku: string;
  price: number;
  quantity: number;
  attributes: VariantAttributeDto[];
}

export interface ProductDto {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  descriptionEn?: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
  categoryName?: string;
  isActive: boolean;
  variants: ProductVariantDto[];
  files: ProductFileDto[];
}

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
  stockQuantity: number;
  variantAttributes: CreateVariantAttributeDto[];
}

export interface CreateProductDto {
  name: string;
  description: string;
  categoryId: number;
  productPhotos?: CreateProductPhotoDto[];
  productVariants?: CreateProductVariantDto[];
}

export interface UpdateProductDto {
  name: string;
  description: string;
  categoryId: number;
  productPhotos?: CreateProductPhotoDto[];
  productVariants?: CreateProductVariantDto[];
}

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
