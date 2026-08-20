import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Next 16 exige declarar las calidades permitidas; sin esto, cualquier
    // `quality` distinto del default rompe el build.
    qualities: [70, 82, 90],
    formats: ['image/avif', 'image/webp'],
    // `dangerouslyAllowSVG` hacía falta cuando las viñetas de nivel eran SVG y
    // pasaban por next/image. Ahora el arte es WebP y los SVG que quedan
    // (`public/arte/`) entran como background-image, sin tocar el optimizador,
    // así que la bandera se retira: menos superficie por nada a cambio.
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
