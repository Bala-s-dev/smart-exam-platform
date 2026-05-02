import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // Ensures env vars are available in all contexts with Turbopack
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
};

export default nextConfig;
