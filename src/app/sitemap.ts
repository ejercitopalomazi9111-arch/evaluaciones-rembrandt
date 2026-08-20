import type { MetadataRoute } from 'next';
import { RUTAS_PUBLICAS, SITE_URL } from '@/content/seo';

/**
 * `force-static` es obligatorio para el export estático: sin él, Next trata la
 * ruta como dinámica y el build aborta. Aquí no hay nada dinámico que perder.
 */
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const ahora = new Date();
  return RUTAS_PUBLICAS.map((ruta) => ({
    url: ruta === '/' ? SITE_URL : `${SITE_URL}${ruta}`,
    lastModified: ahora,
    changeFrequency: ruta.startsWith('/niveles') || ruta === '/' ? 'monthly' : 'yearly',
    priority: ruta === '/' ? 1 : ruta === '/niveles/preparatoria' || ruta === '/admisiones' ? 0.9 : 0.7,
  }));
}
