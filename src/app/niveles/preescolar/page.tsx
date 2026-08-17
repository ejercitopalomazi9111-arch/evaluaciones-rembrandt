import type { Metadata } from 'next';
import { NIVELES } from '@/content/niveles';
import { NivelTemplate } from '@/components/secciones/NivelTemplate';
import { seoDe } from '@/content/seo';

export const metadata: Metadata = seoDe('/niveles/preescolar');

export default function PreescolarPage() {
  return <NivelTemplate nivel={NIVELES.preescolar} />;
}
