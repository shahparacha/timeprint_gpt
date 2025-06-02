import { NextConfig } from 'next';

const config: NextConfig = {
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors. REMOVE THIS WHEN MAKING REAL PROJECT!
    ignoreDuringBuilds: true,
  },
};

export default config;