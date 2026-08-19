import type { NextConfig } from 'next';

/**
 * Desktop development is served from the same origin selected by Tauri's devUrl.
 * Keeping asset URLs relative avoids cross-origin cache collisions between Client
 * and Server sessions and makes browser-based review use the actual active build.
 */
const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
