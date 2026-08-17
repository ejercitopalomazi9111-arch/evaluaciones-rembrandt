import type { Metadata } from 'next';
import Link from 'next/link';

import { HeroInicio } from '@/components/secciones/HeroInicio';
import { BandaDiagonal } from '@/components/secciones/BandaDiagonal';
import { NivelesGrid } from '@/components/secciones/NivelesGrid';
import { EspecialidadProgramacion } from '@/components/secciones/EspecialidadProgramacion';
import { ValoresTriada } from '@/components/secciones/Valores';
import { MisionVision } from '@/components/secciones/MisionVision';
import { CtaRecorrido } from '@/components/secciones/CtaRecorrido';
import { Container, Eyebrow, Section } from '@/components/ui/primitivas';
import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { EJES } from '@/content/vida-escolar';
import { seoDe } from '@/content/seo';

export const metadata: Metadata = seoDe('/');

export default function Inicio() {
  return (
    <>
      <HeroInicio />

      <NivelesGrid />

      <BandaDiagonal />

      <EspecialidadProgramacion />

      <ValoresTriada />

      <MisionVision />

      {/* Vida escolar — avance */}
      <Section className="bg-hueso-2">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <Eyebrow>Vida escolar</Eyebrow>
              <h2 className="mt-5 text-4xl">Lo que pasa fuera del cuaderno</h2>
            </div>
            <Link
              href="/vida-escolar"
              className="inline-flex min-h-11 items-center gap-2 font-mono text-xs font-bold tracking-[0.14em] text-tinta uppercase hover:text-rojo-texto"
            >
              Ver vida escolar →
            </Link>
          </div>

          <ul className="mt-10 grid list-none gap-px bg-linea sm:grid-cols-2 lg:grid-cols-4">
            {EJES.map((e, i) => (
              <li key={e.titulo}>
                <Reveal delay={i * 60} className="h-full">
                  <div className="flex h-full flex-col bg-hueso-2 p-7">
                    <Icon name={e.icono} className="size-7 text-rojo" />
                    <h3 className="mt-5 text-xl">{e.titulo}</h3>
                    <p className="mt-3 text-sm text-tinta-suave">{e.texto}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <CtaRecorrido />
    </>
  );
}
