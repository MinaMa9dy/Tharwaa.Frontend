import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { env } from '@/shared/config/env';

export async function GET() {
  if (env.isProd) {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value ?? null;
  const refreshToken = cookieStore.get('refresh_token')?.value ?? null;
  
  return NextResponse.json({ accessToken, refreshToken });
}
