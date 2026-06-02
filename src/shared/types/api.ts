export interface ApiMeta {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  sortBy?: string;
  sortOrder?: string;
}

export interface ApiResult<T = void> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  meta?: ApiMeta;
}

export interface PaginatedResult<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
