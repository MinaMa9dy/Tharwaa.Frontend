import { NextResponse } from 'next/server';
import axios from 'axios';
import { env } from '@/shared/config/env';

function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Call ASP.NET Core API Google Login endpoint
    const response = await axios.post(`${env.apiUrl}/Auth/google-login`, body);
    
    if (!response.data.success) {
      return NextResponse.json(
        { success: false, message: response.data.message || 'فشلت عملية تسجيل الدخول بواسطة جوجل' },
        { status: response.data.status || 400 }
      );
    }
    
    const authData = response.data.data;
    const { accessToken, refreshToken } = authData;
    
    // Decode claims
    const decoded = decodeJwt(accessToken);
    const userId = decoded?.sub || decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || '';
    const firstName = decoded?.given_name || decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] || '';
    const lastName = decoded?.family_name || decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'] || '';
    const email = decoded?.email || decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || authData.email || '';
    const role = (authData.roles?.[0] || decoded?.role || decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'Marketer') as any;

    const user = {
      id: userId,
      email,
      firstName,
      lastName,
      role,
      isActive: true
    };
    
    const res = NextResponse.json({ success: true, user });
    
    // Set Access Token cookie
    res.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: env.isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
    
    // Set Refresh Token cookie
    res.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: env.isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
    
    return res;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'فشلت عملية تسجيل الدخول بواسطة جوجل';
    return NextResponse.json({ success: false, message }, { status });
  }
}
