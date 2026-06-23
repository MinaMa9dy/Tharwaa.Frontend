import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  /* config options here */
  allowedDevOrigins: [
    'localhost:3000',
    '127.0.0.1:3000',
    '192.168.1.5:3000',
    '192.168.1.5',
    '192.168.1.2:3000',
    '192.168.1.2',
    '*.local',
    '*.vercel.app',
    ' Tharwaa-frontend.vercel.app'
  ],
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        '127.0.0.1:3000',
        '192.168.1.5:3000',
        '192.168.1.5',
        '192.168.1.2:3000',
        '192.168.1.2',
        '*.vercel.app',
        ' Tharwaa-frontend.vercel.net'
      ]
    }
  }
};

export default nextConfig;
