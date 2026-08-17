import type { MetadataRoute } from 'next';
import { RUTAS_PUBLICAS, SITE_URL } from '@/content/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const ahora = new Date();
  return RUTAS_PUBLICAS.map((ruta) => ({
    url: ruta === '/' ? SITE_URL : `${SITE_URL}${ruta}`,
    lastModified: ahora,
    changeFrequency: ruta.startsWith('/niveles') || ruta === '/' ? 'monthly' : 'yearly',
    priority: ruta === '/' ? 1 : ruta === '/niveles/preparatoria' || ruta === '/admisiones' ? 0.9 : 0.7,
  }));
}
