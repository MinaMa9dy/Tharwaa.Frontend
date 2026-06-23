import axios from 'axios';
import { env } from '@/shared/config/env';
import { useAuthStore } from '@/features/auth/store/authStore';

export const apiClient = axios.create({
  baseURL: typeof window !== 'undefined' ? '/api/proxy' : env.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Auto-send cookies
});

let isRefreshing = false;
let isRefreshFailed = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ✅ Reset the refresh-failed flag after 10s so the user can retry
// (e.g. after a brief network blip — avoids permanently locking the user out)
function scheduleRefreshFailedReset() {
  setTimeout(() => {
    isRefreshFailed = false;
  }, 10_000);
}

// Response Interceptor for handling expired tokens via silent refresh
apiClient.interceptors.response.use(
  (response) => {
    if (response.status === 204) {
      response.data = { success: true };
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt refresh on auth endpoints themselves
    if (
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshFailed) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Trigger BFF silent refresh
        await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        isRefreshing = false;
        isRefreshFailed = false;
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        isRefreshFailed = true;
        scheduleRefreshFailedReset(); // ✅ Auto-reset after 10s
        processQueue(refreshError);
        
        // Clear auth store and redirect to login if refresh fails
        if (typeof window !== 'undefined') {
          try {
            await axios.post('/api/auth/logout');
          } catch (e) {
            // Ignore network errors on logout
          }
          useAuthStore.setState({ user: null });
          localStorage.removeItem('user');
          window.location.href = '/login?expired=true';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
