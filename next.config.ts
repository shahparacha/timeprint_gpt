import { NextConfig } from 'next';

const config: NextConfig = {
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
  },
};

export default config;
