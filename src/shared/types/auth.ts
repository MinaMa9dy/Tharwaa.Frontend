export type Role = 'Admin' | 'Supervisor' | 'Supplier' | 'Marketer';

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
}

export interface AuthResponseDto {
  token: string;
  refreshToken: string;
  user: UserDto;
}

export interface RegisterDto {
  email: string;
  password?: string;
  confirmPassword?: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role?: string;
}

export interface LoginDto {
  email: string;
  password?: string;
}

export interface RefreshTokenDto {
  token: string;
  refreshToken: string;
}

export interface ConfirmEmailDto {
  userId: string;
  token: string;
}

export interface ResendEmailConfirmationDto {
  email: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  token: string;
  newPassword?: string;
}

export interface GoogleLoginDto {
  idToken: string;
}
