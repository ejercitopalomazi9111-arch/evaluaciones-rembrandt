import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Next 16 exige declarar las calidades permitidas; sin esto, cualquier
    // `quality` distinto del default rompe el build.
    qualities: [70, 82, 90],
    formats: ['image/avif', 'image/webp'],
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },
};

export default nextConfig;
