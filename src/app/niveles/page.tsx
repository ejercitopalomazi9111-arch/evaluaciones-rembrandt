import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/PageHero';
import { NivelesGrid } from '@/components/secciones/NivelesGrid';
import { BandaDiagonal } from '@/components/secciones/BandaDiagonal';
import { EspecialidadProgramacion } from '@/components/secciones/EspecialidadProgramacion';
import { CtaRecorrido } from '@/components/secciones/CtaRecorrido';
import { seoDe } from '@/content/seo';

export const metadata: Metadata = seoDe('/niveles');

export default function NivelesPage() {
  return (
    <>
      <PageHero
        eyebrow="Oferta educativa"
        titulo="De los 3 a los 18 años, en un solo instituto"
        entradilla="Cuatro niveles con continuidad real: mismo criterio, misma comunidad y un cierre poco común — un bachillerato tecnológico con especialidad en Programación."
      />
      <NivelesGrid titulo="Los cuatro niveles" />
      <BandaDiagonal />
      <EspecialidadProgramacion />
      <CtaRecorrido />
    </>
  );
}
