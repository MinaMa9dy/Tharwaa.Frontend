export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://Tharwaa.runasp.net/api',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  isDev: process.env.NEXT_PUBLIC_APP_ENV === 'development',
  isProd: process.env.NEXT_PUBLIC_APP_ENV === 'production',
  // Server-only (not prefixed with NEXT_PUBLIC_)
  csrfSecret: process.env.CSRF_SECRET || 'dev-csrf-secret-change-in-prod-12345',
  cookieSecret: process.env.COOKIE_SECRET || 'dev-cookie-secret-change-in-prod-12345',
} as const;

// ✅ Disable SSL/TLS verification only in non-production (dev/staging)
// In production, SSL must be verified for security.
if (process.env.NEXT_PUBLIC_APP_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}
