import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import https from 'https';
import http from 'http';
import { env } from '@/shared/config/env';

// Persistent keep-alive agents (reused across requests for connection pooling)
const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 100 });
const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 100,
  // ASP.NET Core dev certs are self-signed and trusted via the Windows cert
  // store — which Node's https module reads, unlike undici (native fetch).
  // In production the backend has a real cert so this flag has no effect.
  rejectUnauthorized: process.env.NODE_ENV === 'production',
});

async function nodeRequest(
  method: string,
  backendUrl: string,
  headers: Record<string, string>,
  body?: string | FormData,
): Promise<{ status: number; data: unknown }> {
  return new Promise((resolve, reject) => {
    const url = new URL(backendUrl);
    const isHttps = url.protocol === 'https:';
    const agent = isHttps ? httpsAgent : httpAgent;

    // Serialise body to string for non-multipart requests
    let rawBody: string | undefined;
    if (typeof body === 'string') {
      rawBody = body;
    }

    const options: http.RequestOptions = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        ...headers,
        ...(rawBody ? { 'Content-Length': Buffer.byteLength(rawBody).toString() } : {}),
      },
      agent,
    };

    const lib = isHttps ? https : http;
    const req = lib.request(options, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf-8');
        let data: unknown = {};
        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          data = { raw: text };
        }
        resolve({ status: res.statusCode ?? 500, data });
      });
    });

    req.on('error', reject);

    if (rawBody) {
      req.write(rawBody);
    }

    req.end();
  });
}

async function handleRequest(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
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

    let body: string | FormData | undefined;

    if (method !== 'GET' && method !== 'HEAD') {
      const contentType = request.headers.get('content-type') || '';

      if (contentType.includes('multipart/form-data')) {
        // For multipart, fall back to a direct fetch with the node https agent approach
        // We rebuild the request as a ReadableStream forward
        body = await request.formData();
        // Multipart: send via fetch but with rejectUnauthorized handled via env var
        const origReject = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
        if (process.env.NODE_ENV !== 'production') {
          process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        }
        try {
          const res = await fetch(backendUrl, {
            method,
            headers,
            body,
          });
          if (process.env.NODE_ENV !== 'production') {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = origReject ?? '1';
          }
          console.log(`\x1b[32m[BFF Proxy] Success [${res.status}]\x1b[0m ${method} ${backendUrl}`);
          if (res.status === 204) return new NextResponse(null, { status: 204 });
          const data = await res.json().catch(() => ({ success: false }));
          return NextResponse.json(data, { status: res.status });
        } catch (err) {
          if (process.env.NODE_ENV !== 'production') {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = origReject ?? '1';
          }
          throw err;
        }
      } else {
        const bodyText = await request.text();
        if (bodyText) {
          headers['Content-Type'] = 'application/json';
          body = bodyText;
        }
      }
    }

    const { status, data } = await nodeRequest(method, backendUrl, headers, body);

    console.log(`\x1b[32m[BFF Proxy] Success [${status}]\x1b[0m ${method} ${backendUrl}`);

    if (status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    return NextResponse.json(data, { status });
  } catch (error: any) {
    const status = error?.status ?? 500;
    const errData = { success: false, message: 'حدث خطأ في الاتصال بالخادم' };
    console.error(
      `\x1b[31m[BFF Proxy] Error [${status}]\x1b[0m ${method} ${backendUrl || 'unknown'}:`,
      error.message || error,
    );
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
