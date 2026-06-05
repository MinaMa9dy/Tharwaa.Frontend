export interface SupervisorDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateSupervisorDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  password?: string;
}

export interface UpdateSupervisorDto {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}
