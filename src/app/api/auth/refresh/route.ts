import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import axios from 'axios';
import { env } from '@/shared/config/env';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!accessToken || !refreshToken) {
      return NextResponse.json({ success: false, message: 'Tokens missing' }, { status: 401 });
    }

    // Call ASP.NET Core API to rotate tokens
    const response = await axios.post(`${env.apiUrl}/Auth/refresh`, {
      accessToken,
      refreshToken,
    });

    if (!response.data.success) {
      return NextResponse.json(
        { success: false, message: response.data.message || 'Failed to refresh token' },
        { status: 401 }
      );
    }

    const authData = response.data.data;
    const newAccessToken = authData.accessToken;
    const newRefreshToken = authData.refreshToken;

    const res = NextResponse.json({ success: true });

    // Set updated secure cookies
    res.cookies.set('access_token', newAccessToken, {
      httpOnly: true,
      secure: env.isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    res.cookies.set('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: env.isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return res;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'Unauthorized';
    return NextResponse.json({ success: false, message }, { status: 401 });
  }
}
