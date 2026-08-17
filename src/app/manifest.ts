import type { MetadataRoute } from 'next';
import { INSTITUCION } from '@/content/institucion';

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
    icons: [{ src: '/marca/escudo.png', sizes: '714x786', type: 'image/png', purpose: 'any' }],
  };
}
