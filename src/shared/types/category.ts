export interface CategoryDto {
  id: number;
  name: string;
  nameEn?: string;
  parentCategoryId?: number | null;
  isActive: boolean;
}

export interface CreateCategoryDto {
  name: string;
  nameEn?: string;
  parentCategoryId?: number | null;
}

export interface UpdateCategoryDto {
  name: string;
  nameEn?: string;
  parentCategoryId?: number | null;
  isActive?: boolean;
}
