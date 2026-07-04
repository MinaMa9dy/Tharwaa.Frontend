export interface SupplierDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateSupplierDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  password?: string;
}

export interface UpdateSupplierDto {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  password?: string;
}
