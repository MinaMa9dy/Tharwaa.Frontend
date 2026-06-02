import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    'localhost:3000',
    '127.0.0.1:3000',
    '192.168.1.5:3000',
    '192.168.1.5',
    '*.local',
    '*.vercel.app',
    'sstore.runasp.net'
  ],
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        '127.0.0.1:3000',
        '192.168.1.5:3000',
        '192.168.1.5',
        '*.vercel.app',
        'sstore.runasp.net'
      ]
    }
  }
};

export default nextConfig;
