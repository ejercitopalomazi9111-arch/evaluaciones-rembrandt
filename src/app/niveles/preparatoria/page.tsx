import type { Metadata } from 'next';
import { NIVELES } from '@/content/niveles';
import { NivelTemplate } from '@/components/secciones/NivelTemplate';
import { EspecialidadProgramacion } from '@/components/secciones/EspecialidadProgramacion';
import { seoDe } from '@/content/seo';

export const metadata: Metadata = seoDe('/niveles/preparatoria');

export default function PreparatoriaPage() {
  return (
    <NivelTemplate
      nivel={NIVELES.preparatoria}
      extra={<EspecialidadProgramacion conCta={false} />}
    />
  );
}
