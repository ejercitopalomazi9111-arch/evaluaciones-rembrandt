import type { EnlaceNav } from './types';
import { NIVELES_LISTA } from './niveles';

export const NAV_PRINCIPAL: readonly EnlaceNav[] = [
  { label: 'El instituto', href: '/instituto' },
  {
    label: 'Niveles',
    href: '/niveles',
    hijos: NIVELES_LISTA.map((n) => ({
      label: n.nombre,
      href: `/niveles/${n.slug}`,
      descripcion: n.nombreLargo ?? n.edades,
    })),
  },
  { label: 'Vida escolar', href: '/vida-escolar' },
  { label: 'Admisiones', href: '/admisiones' },
  { label: 'Contacto', href: '/contacto' },
];

export const NAV_PIE: readonly EnlaceNav[] = [
  {
    label: 'El instituto',
    href: '/instituto',
    hijos: [
      { label: 'Identidad y valores', href: '/instituto#valores' },
      { label: 'Misión y visión', href: '/instituto#mision' },
      { label: 'Vida escolar', href: '/vida-escolar' },
    ],
  },
  {
    label: 'Niveles',
    href: '/niveles',
    hijos: NIVELES_LISTA.map((n) => ({ label: n.nombre, href: `/niveles/${n.slug}` })),
  },
  {
    label: 'Admisiones',
    href: '/admisiones',
    hijos: [
      { label: 'Proceso de admisión', href: '/admisiones' },
      { label: 'Agendar recorrido', href: '/admisiones/agendar-recorrido' },
      { label: 'Preguntas frecuentes', href: '/admisiones#preguntas' },
    ],
  },
  {
    label: 'Legal',
    href: '/aviso-de-privacidad',
    hijos: [
      { label: 'Aviso de privacidad', href: '/aviso-de-privacidad' },
      { label: 'Términos y condiciones', href: '/terminos-y-condiciones' },
    ],
  },
];

export const CTA_GLOBAL = {
  label: 'Agendar recorrido',
  href: '/admisiones/agendar-recorrido',
} as const;
