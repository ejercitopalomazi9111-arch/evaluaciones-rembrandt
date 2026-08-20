import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/PageHero';
import { ValoresTriada } from '@/components/secciones/Valores';
import { MisionVision } from '@/components/secciones/MisionVision';
import { BandaDiagonal } from '@/components/secciones/BandaDiagonal';
import { CtaRecorrido } from '@/components/secciones/CtaRecorrido';
import { Container, Eyebrow, Section, Tag } from '@/components/ui/primitivas';
import { Escudo } from '@/components/marca/Marca';
import { INSTITUCION, SEDES, direccionCompleta } from '@/content/institucion';
import { seoDe } from '@/content/seo';

export const metadata: Metadata = seoDe('/instituto');

export default function InstitutoPage() {
  return (
    <>
      <PageHero
        eyebrow="El instituto"
        titulo="Un nombre que obliga"
        entradilla="Llevar el nombre de Rembrandt no es una casualidad decorativa: es un recordatorio diario de que enseñar es también formar la mirada."
      />

      {/* El escudo, explicado */}
      <Section>
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-16">
            <div className="corte-esquina bg-azul-hondo/60 p-8 ring-1 ring-white/12">
              <Escudo size={168} className="mx-auto" />
            </div>
            <div className="max-w-[52ch]">
              <Eyebrow>El escudo</Eyebrow>
              <h2 className="mt-5 text-3xl">Todo lo que somos cabe en un escudo</h2>
              <p className="mt-5 text-lg text-white/70">
                En el centro, el autorretrato de Rembrandt van Rijn con su boina — el maestro que
                convirtió la luz en un instrumento de precisión. Alrededor, las tres palabras que
                rigen la casa: <strong className="text-white">Respeto</strong>,{' '}
                <strong className="text-white">Cultura</strong> y{' '}
                <strong className="text-white">Honor</strong>.
              </p>
              <p className="mt-4 text-white/70">
                No hay una declaración de principios más corta ni más exigente que ésa.
              </p>
              <ul className="mt-7 flex list-none flex-wrap gap-2">
                {INSTITUCION.caracteristicas.map((c) => (
                  <li key={c}>
                    <Tag tono="linea">{c}</Tag>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      <BandaDiagonal />
      <ValoresTriada />
      <MisionVision />

      {/* Planteles */}
      <Section className="bg-azul-hondo/45">
        <Container>
          <Eyebrow>Planteles</Eyebrow>
          <h2 className="mt-5 max-w-2xl text-3xl">Dos sedes, a unos pasos una de otra</h2>
          <ul className="mt-10 grid list-none gap-px bg-white/12 sm:grid-cols-2">
            {SEDES.map((s) => (
              <li key={s.id} className="bg-azul-hondo/45 p-7 sm:p-9">
                <p className="font-mono text-[0.6rem] font-bold tracking-[0.18em] text-rojo-claro uppercase">
                  {s.nombre}
                </p>
                <address className="mt-3 text-lg leading-relaxed not-italic">
                  {direccionCompleta(s)}
                </address>
                <p className="mt-4 font-mono text-[0.62rem] tracking-[0.14em] text-white/70 uppercase">
                  {s.niveles.join(' · ')}
                </p>
                <a
                  href={s.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex min-h-11 items-center font-mono text-xs font-bold tracking-[0.14em] text-azul-vivo uppercase hover:underline"
                >
                  Cómo llegar →
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <CtaRecorrido />
    </>
  );
}
