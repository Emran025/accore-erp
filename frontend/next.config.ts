import type { NextConfig } from 'next';

const isProduction = process.env.NODE_ENV === 'production';
const tauriDevHost = process.env.TAURI_DEV_HOST || 'localhost';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  assetPrefix: isProduction ? undefined : `http://${tauriDevHost}:5000`,
};

export default nextConfig;
