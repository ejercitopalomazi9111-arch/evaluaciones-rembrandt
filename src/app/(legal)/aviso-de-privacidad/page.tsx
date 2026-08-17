import type { Metadata } from 'next';
import { DocumentoLegal } from '@/components/layout/Prose';
import { AVISO_PRIVACIDAD } from '@/content/legal';
import { seoDe } from '@/content/seo';

export const metadata: Metadata = seoDe('/aviso-de-privacidad');

export default function AvisoPrivacidadPage() {
  return (
    <DocumentoLegal
      eyebrow="Legal"
      titulo="Aviso de privacidad"
      entradilla="Aviso de privacidad integral conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares y su Reglamento."
      secciones={AVISO_PRIVACIDAD}
    />
  );
}
