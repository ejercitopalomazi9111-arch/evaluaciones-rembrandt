import type { Metadata } from 'next';
import { INSTITUCION } from './institucion';

/**
 * Dominio del que cuelgan canonical, sitemap, robots y las tarjetas de Open
 * Graph. Se resuelve en este orden:
 *
 * 1. `NEXT_PUBLIC_SITE_URL`, el dominio definitivo, cuando ya está fijado.
 * 2. La URL de producción que Vercel expone sola, para que un despliegue recién
 *    importado tenga metadatos correctos sin configurar nada.
 * 3. El dominio del instituto, que es donde debería acabar viviendo.
 *
 * Sólo lo consumen componentes de servidor y los ficheros de metadatos, así que
 * no hace falta que la segunda variable sea `NEXT_PUBLIC_`.
 */
const dominioVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
  (dominioVercel ? `https://${dominioVercel}` : 'https://www.irembrandt.com.mx');

interface EntradaSeo {
  readonly titulo: string;
  readonly descripcion: string;
}

/** Una entrada por ruta. El título de plantilla añade el nombre del instituto. */
export const SEO: Record<string, EntradaSeo> = {
  '/': {
    titulo: 'Preescolar, Primaria, Secundaria y Preparatoria en Querétaro',
    descripcion:
      'Instituto particular, laico, mixto y bilingüe en Col. Satélite, Querétaro. Preescolar a Preparatoria, con Bachillerato Tecnológico DGETI especialidad en Programación.',
  },
  '/instituto': {
    titulo: 'El instituto',
    descripcion:
      'Respeto, Cultura y Honor. Conoce la identidad, la misión y la visión del Instituto Rembrandt de Querétaro.',
  },
  '/niveles': {
    titulo: 'Niveles educativos',
    descripcion:
      'Preescolar, Primaria, Secundaria y Preparatoria. Un solo instituto de los 3 a los 18 años, en Col. Satélite, Querétaro.',
  },
  '/niveles/preescolar': {
    titulo: 'Preescolar — Jardín de Niños «Las Rosas»',
    descripcion:
      'Preescolar bilingüe de 3 a 5 años en Querétaro. Lenguaje, pensamiento matemático y exploración del mundo sobre una base de confianza.',
  },
  '/niveles/primaria': {
    titulo: 'Primaria',
    descripcion:
      'Primaria bilingüe de 1.º a 6.º en Col. Satélite, Querétaro. Comprensión lectora, matemáticas con sentido y ciencias naturales.',
  },
  '/niveles/secundaria': {
    titulo: 'Secundaria',
    descripcion:
      'Secundaria en Querétaro con base científica sólida y continuidad directa al Bachillerato Tecnológico en Programación.',
  },
  '/niveles/preparatoria': {
    titulo: 'Preparatoria — Bachillerato Tecnológico en Programación',
    descripcion:
      'Bachillerato Tecnológico incorporado a la DGETI con especialidad en Programación en Querétaro. Bachillerato completo más una especialidad técnica con validez oficial.',
  },
  '/vida-escolar': {
    titulo: 'Vida escolar',
    descripcion:
      'Cultura, deporte, comunidad y pensamiento crítico en el Instituto Rembrandt de Querétaro.',
  },
  '/admisiones': {
    titulo: 'Admisiones',
    descripcion:
      'Proceso de admisión paso a paso, requisitos y preguntas frecuentes del Instituto Rembrandt de Querétaro.',
  },
  '/admisiones/agendar-recorrido': {
    titulo: 'Agendar un recorrido',
    descripcion:
      'Visita guiada con Coordinación. Conoce las instalaciones y resuelve tus dudas antes de iniciar el trámite.',
  },
  '/contacto': {
    titulo: 'Contacto',
    descripcion:
      'Teléfono, correo y ubicación de los dos planteles del Instituto Rembrandt en Santiago de Querétaro.',
  },
  '/aviso-de-privacidad': {
    titulo: 'Aviso de privacidad',
    descripcion:
      'Aviso de privacidad integral del Instituto Rembrandt de Querétaro conforme a la LFPDPPP.',
  },
  '/terminos-y-condiciones': {
    titulo: 'Términos y condiciones',
    descripcion: 'Términos de uso del sitio web del Instituto Rembrandt de Querétaro.',
  },
};

export function seoDe(ruta: string): Metadata {
  const e = SEO[ruta];
  if (!e) return {};
  const url = ruta === '/' ? SITE_URL : `${SITE_URL}${ruta}`;
  return {
    title: e.titulo,
    description: e.descripcion,
    alternates: { canonical: url },
    openGraph: {
      title: `${e.titulo} · ${INSTITUCION.nombreLegal}`,
      description: e.descripcion,
      url,
      siteName: INSTITUCION.nombreLegal,
      locale: 'es_MX',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${e.titulo} · ${INSTITUCION.nombreLegal}`,
      description: e.descripcion,
    },
  };
}

/** Rutas indexables, en el orden en que aparecen en el sitemap. */
export const RUTAS_PUBLICAS = Object.keys(SEO);
