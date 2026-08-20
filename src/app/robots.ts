import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/content/seo';

/**
 * `force-static` es obligatorio para el export estático: sin él, Next trata la
 * ruta como dinámica y el build aborta. Aquí no hay nada dinámico que perder.
 */
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/estilo', '/pendientes'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
