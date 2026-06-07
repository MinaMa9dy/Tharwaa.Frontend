import { Role } from '../types/auth';

export const ROUTE_ACCESS: Record<string, Role[]> = {
  // Public routes (accessible to anyone)
  '/': [],
  '/login': [],
  '/register': [],
  '/forgot-password': [],
  '/reset-password': [],
  '/confirm-email': [],

  // Admin-only dashboard & configurations
  '/admin/dashboard': ['Admin', 'Supervisor', 'Supplier'],
  '/admin/admins': ['Admin'],
  '/admin/supervisors': ['Admin'],
  '/admin/suppliers': ['Admin'],
  '/admin/settings': ['Admin'],

  // Shared Admin and Supervisor management panels
  '/admin/marketers': ['Admin'],
  '/admin/orders': ['Admin', 'Supervisor'],
  '/admin/withdrawals': ['Admin'],
  '/admin/products': ['Admin', 'Supplier'],
  '/admin/categories': ['Admin', 'Supplier'],

  // Marketer-only catalog & operations
  '/marketer/dashboard': ['Marketer'],
  '/marketer/products': ['Marketer'],
  '/marketer/products/search': ['Marketer'],
  '/marketer/orders': ['Marketer', 'Admin'],
  '/marketer/cart': ['Marketer'],
  '/marketer/wishlist': ['Marketer'],
  '/marketer/profile': ['Marketer'],
  '/marketer/withdrawals': ['Marketer'],
};
