import { NextResponse } from 'next/server';
import axios from 'axios';
import { env } from '@/shared/config/env';

export async function POST() {
  // ✅ Notify backend to invalidate the refresh token
  try {
    const res_backend = await axios.post(`${env.apiUrl}/Auth/logout`, {}, {
      withCredentials: true,
    });
  } catch (e) {
    // Ignore — still clear cookies even if backend is unreachable
  }

  const res = NextResponse.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
  
  // Clear cookies
  res.cookies.delete('access_token');
  res.cookies.delete('refresh_token');
  
  return res;
}
