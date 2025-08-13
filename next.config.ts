// next.config.ts

import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.sellerpintar.com',
        port: '',
        pathname: '/articles/**',
      },
    ],
  },
};

export default nextConfig;