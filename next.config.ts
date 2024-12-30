import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const internalHost = process.env.TAURI_DEV_HOST || 'localhost';

const nextConfig: NextConfig = {
  output: 'export',
  // Note: This feature is required to use the Next.js Image component in SSG mode.
  images: {
    unoptimized: true,
  },
  // Configure assetPrefix or else the server won't properly resolve the assets.
  assetPrefix: isProd ? undefined : `http://${internalHost}:3000`,
};

export default nextConfig;
