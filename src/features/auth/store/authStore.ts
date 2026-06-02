import { create } from 'zustand';
import { UserDto, LoginDto, RegisterDto } from '@/shared/types/auth';
import axios from 'axios';

interface AuthState {
  user: UserDto | null;
  loading: boolean;
  error: string | null;
  setUser: (user: UserDto | null) => void;
  login: (dto: LoginDto) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  setUser: (user) => set({ user }),
  
  login: async (dto) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('/api/auth/login', dto);
      if (response.data.success) {
        const user = response.data.user;
        set({ user, loading: false });
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(user));
        }
      } else {
        const message = response.data.message || 'فشلت عملية تسجيل الدخول';
        set({ error: message, loading: false });
        throw new Error(message);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'اسم المستخدم أو كلمة المرور غير صحيحة';
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },

  googleLogin: async (token) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('/api/auth/google-login', { token });
      if (response.data.success) {
        const user = response.data.user;
        set({ user, loading: false });
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(user));
        }
      } else {
        const message = response.data.message || 'فشلت عملية تسجيل الدخول بواسطة جوجل';
        set({ error: message, loading: false });
        throw new Error(message);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'فشلت عملية تسجيل الدخول بواسطة جوجل';
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },

  register: async (dto) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('/api/proxy/Auth/register', dto);
      if (response.data.success) {
        set({ loading: false });
      } else {
        const message = response.data.message || 'فشلت عملية التسجيل';
        set({ error: message, loading: false });
        throw new Error(message);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'خطأ أثناء إنشاء الحساب';
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },
  
  logout: async () => {
    set({ loading: true });
    try {
      await axios.post('/api/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    }
    set({ user: null, loading: false });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      // Force reload to clear all states and caches
      window.location.href = '/login';
    }
  },
  
  initialize: () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          set({ user: JSON.parse(stored) });
        } catch (e) {
          localStorage.removeItem('user');
        }
      }
    }
  },
}));
