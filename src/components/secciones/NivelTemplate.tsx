import type { ReactNode } from 'react';
import type { Nivel } from '@/content/types';
import { sedePorId, direccionCompleta } from '@/content/institucion';
import { Container, Eyebrow, Section, Tag, Button } from '@/components/ui/primitivas';
import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { PageHero } from '@/components/layout/PageHero';
import { FotoSlot, GaleriaSlots } from '@/components/media/FotoSlot';
import { BandaDiagonal } from './BandaDiagonal';
import { CtaRecorrido } from './CtaRecorrido';

/**
 * Plantilla común de los cuatro niveles, guiada por datos. Lo exclusivo de cada
 * nivel entra por el slot `extra` (la Preparatoria inyecta ahí su especialidad).
 * Las secciones sin datos simplemente no se renderizan.
 */
export function NivelTemplate({ nivel, extra }: { nivel: Nivel; extra?: ReactNode }) {
  const sede = sedePorId(nivel.sedeId);

  return (
    <>
      <PageHero
        eyebrow={`Nivel ${nivel.indice} — ${nivel.edades}`}
        titulo={nivel.nombre}
        entradilla={nivel.claim}
        acento={nivel.acento}
        arte={`/arte/arte-${nivel.slug}.svg`}
        migas={[{ label: 'Niveles', href: '/niveles' }]}
        extra={
          nivel.nombreLargo ? (
            <p className="max-w-xs font-mono text-xs leading-relaxed tracking-[0.12em] text-white/55 uppercase">
              {nivel.nombreLargo}
            </p>
          ) : undefined
        }
      />

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
            <div>
              <p className="text-xl leading-[1.55] text-balance">{nivel.descripcion}</p>

              <dl className="mt-10 grid grid-cols-2 gap-px bg-white/12">
                {nivel.datosClave.map((d) => (
                  <div key={d.etiqueta} className="bg-transparent p-5">
                    <dt className="font-mono text-[0.58rem] font-bold tracking-[0.18em] text-white/70 uppercase">
                      {d.etiqueta}
                    </dt>
                    <dd className="mt-2 font-display text-lg leading-tight font-bold">{d.valor}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <FotoSlot slot={nivel.hero} sizes="(min-width: 1024px) 45vw, 100vw" />
          </div>
        </Container>
      </Section>

      {extra}

      <Section className="bg-azul-hondo/45">
        <Container>
          <Eyebrow>En qué se trabaja</Eyebrow>
          <h2 className="mt-5 max-w-2xl text-3xl">Los ejes del nivel</h2>

          <ul className="mt-10 grid list-none gap-px bg-white/12 sm:grid-cols-2">
            {nivel.destacados.map((d, i) => (
              <li key={d.titulo}>
                <Reveal delay={i * 60} className="h-full">
                  <div className="flex h-full gap-5 bg-azul-hondo/45 p-6 sm:p-8">
                    <Icon name={d.icono} className="mt-0.5 size-6 shrink-0 text-rojo" />
                    <div>
                      <h3 className="text-xl">{d.titulo}</h3>
                      <p className="mt-2.5 text-white/70">{d.texto}</p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>

          {nivel.materias && (
            <div className="mt-12">
              <Eyebrow>Materias</Eyebrow>
              <ul className="mt-5 flex list-none flex-wrap gap-2">
                {nivel.materias.map((m) => (
                  <li key={m}>
                    <Tag tono="linea">{m}</Tag>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>Instalaciones</Eyebrow>
              <h2 className="mt-5 text-3xl">Dónde se cursa</h2>
            </div>
            <div className="corte-esquina-sm bg-azul-hondo/60 p-5 ring-1 ring-white/12">
              <p className="font-mono text-[0.58rem] font-bold tracking-[0.18em] text-rojo-claro uppercase">
                {sede.nombre}
              </p>
              <address className="mt-2 text-sm leading-relaxed text-white/70 not-italic">
                {direccionCompleta(sede)}
              </address>
              <a
                href={sede.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex min-h-9 items-center font-mono text-[0.65rem] tracking-wide text-azul-vivo uppercase hover:underline"
              >
                Cómo llegar →
              </a>
            </div>
          </div>

          <div className="mt-10">
            <GaleriaSlots slots={nivel.galeria} columnas={2} />
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button href="/admisiones">Ver el proceso de admisión</Button>
            <Button href="/contacto" variante="linea">
              Solicitar informes
            </Button>
          </div>
        </Container>
      </Section>

      <BandaDiagonal />
      <CtaRecorrido />
    </>
  );
}
