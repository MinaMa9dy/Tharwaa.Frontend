import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import axios from 'axios';
import { env } from '@/shared/config/env';

async function handleRequest(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const method = request.method;
  let backendUrl = '';
  try {
    const { path } = await context.params;
    const urlPath = path.join('/');
    
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    backendUrl = `${env.apiUrl}/${urlPath}${queryString ? `?${queryString}` : ''}`;
    
    console.log(`\x1b[36m[BFF Proxy]\x1b[0m ${method} ${backendUrl}`);
    
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    let data: any = null;
    
    if (method !== 'GET' && method !== 'HEAD') {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('multipart/form-data')) {
        // Forward files and multipart content
        const formData = await request.formData();
        const apiResponse = await axios({
          method,
          url: backendUrl,
          data: formData,
          headers: {
            ...headers,
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log(`\x1b[32m[BFF Proxy] Success [${apiResponse.status}]\x1b[0m ${method} ${backendUrl}`);
        if (apiResponse.status === 204) {
          return new NextResponse(null, { status: 204 });
        }
        return NextResponse.json(apiResponse.data, { status: apiResponse.status });
      } else {
        data = await request.json().catch(() => null);
        headers['Content-Type'] = 'application/json';
      }
    }
    
    const apiResponse = await axios({
      method,
      url: backendUrl,
      data,
      headers,
    });
    
    console.log(`\x1b[32m[BFF Proxy] Success [${apiResponse.status}]\x1b[0m ${method} ${backendUrl}`);
    if (apiResponse.status === 204) {
      return new NextResponse(null, { status: 204 });
    }
    return NextResponse.json(apiResponse.data, { status: apiResponse.status });
  } catch (error: any) {
    const status = error.response?.status || 500;
    const errData = error.response?.data || { success: false, message: 'حدث خطأ في الاتصال بالخادم' };
    console.error(`\x1b[31m[BFF Proxy] Error [${status}]\x1b[0m ${method} ${backendUrl || 'unknown'}:`, error.message || error);
    if (status === 204) {
      return new NextResponse(null, { status: 204 });
    }
    return NextResponse.json(errData, { status });
  }
}

export {
  handleRequest as GET,
  handleRequest as POST,
  handleRequest as PUT,
  handleRequest as DELETE,
  handleRequest as PATCH,
};
