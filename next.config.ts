import type { NextConfig } from 'next';

/**
 * El sitio se compila de dos formas:
 *
 * - **Con servidor** (Vercel, Node): es la buena. `next/image` optimiza, las
 *   cabeceras de seguridad se envían de verdad y el formulario manda correo por
 *   Resend desde una Server Action.
 * - **Export estático** (`EXPORT_ESTATICO=1`, para GitHub Pages): sale una
 *   carpeta `out/` que cualquier servidor de archivos puede servir. Next 16 no
 *   admite ahí Server Actions, `headers()` ni la optimización de imágenes
 *   —está documentado en `02-guides/static-exports.md`— así que las tres se
 *   sustituyen por su equivalente estático en lugar de fingir que funcionan.
 */
const estatico = process.env.EXPORT_ESTATICO === '1';

/**
 * En GitHub Pages el sitio no cuelga de la raíz del dominio sino de
 * `/<repo>/`, así que hay que declararlo o todos los enlaces y assets apuntan
 * a un sitio que no existe. Se pasa desde el workflow.
 */
const basePath = process.env.RUTA_BASE ?? '';

const nextConfig: NextConfig = {
  ...(estatico
    ? {
        output: 'export' as const,
        basePath,
        assetPrefix: basePath,
        // Sin esto Next emite `instituto.html` **y** una carpeta `instituto/`
        // con las cargas RSC, y el servidor de archivos resuelve la carpeta:
        // la URL acaba devolviendo un listado en vez de la página. Con barra
        // final cada ruta emite su `index.html` y no hay ambigüedad.
        trailingSlash: true,
      }
    : {}),

  images: {
    // Next 16 exige declarar las calidades permitidas; sin esto, cualquier
    // `quality` distinto del default rompe el build.
    qualities: [70, 82, 90],
    formats: ['image/avif', 'image/webp'],
    // Sin servidor no hay optimizador: las imágenes se sirven tal cual. Ya van
    // en WebP y al tamaño de uso, así que la pérdida es pequeña.
    ...(estatico ? { unoptimized: true } : {}),
    // `dangerouslyAllowSVG` hacía falta cuando las viñetas de nivel eran SVG y
    // pasaban por next/image. Ahora el arte es WebP y los SVG que quedan
    // (`public/arte/`) entran como background-image, sin tocar el optimizador,
    // así que la bandera se retira: menos superficie por nada a cambio.
  },

  poweredByHeader: false,

  // El export no ejecuta `headers()`. En Pages las cabeceras de seguridad las
  // pone GitHub (sirve todo por HTTPS con nosniff); en un servidor propio se
  // configuran en el servidor.
  ...(estatico
    ? {}
    : {
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
      }),

  // Sin servidor no puede haber Server Action. El gemelo estático valida en el
  // navegador y ofrece el mismo camino de respaldo (correo, WhatsApp, llamada)
  // que la versión con servidor cuando le faltan credenciales.
  ...(estatico
    ? {
        turbopack: {
          resolveAlias: {
            '@/app/actions/enviar-solicitud': './src/app/actions/enviar-solicitud.estatico.ts',
          },
        },
      }
    : {}),
};

export default nextConfig;
