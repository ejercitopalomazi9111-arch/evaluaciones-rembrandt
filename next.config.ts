import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Next 16 exige declarar las calidades permitidas; sin esto, cualquier
    // `quality` distinto del default rompe el build.
    qualities: [70, 82, 90],
    formats: ['image/avif', 'image/webp'],
    // Las ilustraciones son SVG propios, generados por `scripts/generar-ilustraciones.mjs`.
    // No hay SVG de terceros ni subidos por usuarios, y aun así se sirven con una CSP
    // estricta que impide cualquier script dentro del archivo.
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
