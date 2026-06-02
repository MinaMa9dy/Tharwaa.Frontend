import { AxiosError } from 'axios';

export interface NormalizedError {
  message: string;
  errors?: string[];
  status?: number;
}

export function normalizeError(error: unknown): NormalizedError {
  if (error instanceof AxiosError) {
    const data = error.response?.data;
    const message = data?.message || data?.title || error.message || 'حدث خطأ غير متوقع';
    const errors = data?.errors 
      ? (Array.isArray(data.errors) 
          ? data.errors 
          : typeof data.errors === 'object'
            ? Object.values(data.errors).flat() as string[]
            : [data.errors])
      : undefined;

    return {
      message,
      errors,
      status: error.response?.status,
    };
  }

  return {
    message: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
  };
}
