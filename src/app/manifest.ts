import type { MetadataRoute } from 'next';
import { INSTITUCION } from '@/content/institucion';
import { estatico } from '@/lib/ruta';

/**
 * `force-static` es obligatorio para el export estático: sin él, Next trata la
 * ruta como dinámica y el build aborta. Aquí no hay nada dinámico que perder.
 */
export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: INSTITUCION.nombreLegal,
    short_name: INSTITUCION.nombreCorto,
    description: INSTITUCION.lema,
    start_url: '/',
    display: 'standalone',
    background_color: '#f4f3ef',
    theme_color: '#0b0e1a',
    lang: 'es-MX',
    icons: [{ src: estatico('/marca/escudo.png'), sizes: '714x786', type: 'image/png', purpose: 'any' }],
  };
}
