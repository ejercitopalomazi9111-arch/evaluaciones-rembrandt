import type { Metadata } from 'next';
import { DocumentoLegal } from '@/components/layout/Prose';
import { TERMINOS } from '@/content/legal';
import { seoDe } from '@/content/seo';

export const metadata: Metadata = seoDe('/terminos-y-condiciones');

export default function TerminosPage() {
  return (
    <DocumentoLegal
      eyebrow="Legal"
      titulo="Términos y condiciones"
      entradilla="Condiciones de uso del sitio web del Instituto Rembrandt de Querétaro."
      secciones={TERMINOS}
    />
  );
}
