import Image from 'next/image';
import Link from 'next/link';
import { NIVELES_LISTA } from '@/content/niveles';
import { Container, Eyebrow, IndiceSeccion, Section } from '@/components/ui/primitivas';
import { Reveal } from '@/components/ui/Reveal';

const ACENTO = {
  azul: { barra: 'bg-azul-vivo', texto: 'text-azul-vivo' },
  rojo: { barra: 'bg-rojo', texto: 'text-rojo-claro' },
  ambar: { barra: 'bg-ambar', texto: 'text-ambar' },
} as const;

/**
 * Las cuatro etapas, como tarjetas con viñeta ilustrada.
 *
 * Alturas escalonadas a propósito: una rejilla perfectamente pareja se lee
 * plana. El desfase alterno da ritmo sin desordenar la lectura.
 */
export function NivelesGrid({ titulo = 'Un instituto, cuatro etapas' }: { titulo?: string }) {
  return (
    <Section id="niveles" className="relative">
      <Container>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
          <div className="max-w-2xl">
            <Eyebrow tono="claro">Oferta educativa</Eyebrow>
            <h2 className="mt-5 text-4xl text-white">{titulo}</h2>
          </div>
          <IndiceSeccion numero="01" nombre="Niveles" />
        </div>

        <p className="mt-6 max-w-[58ch] text-lg text-white/70">
          La continuidad importa: quien entra en preescolar puede terminar la preparatoria sin
          cambiar de escuela, de criterio ni de comunidad.
        </p>

        <ul className="mt-12 grid list-none gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {NIVELES_LISTA.map((nivel, i) => {
            const a = ACENTO[nivel.acento];
            return (
              <li key={nivel.id} className={i % 2 === 1 ? 'lg:mt-10' : ''}>
                <Reveal delay={i * 70} className="h-full">
                  <Link
                    href={`/niveles/${nivel.slug}`}
                    className="group corte-esquina relative flex h-full flex-col overflow-hidden bg-azul-hondo/70 ring-1 ring-white/12 transition-transform duration-200 ease-(--ease-tecnico) hover:-translate-y-1.5"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={`/ilustraciones/vineta-${nivel.slug}.svg`}
                        alt=""
                        width={400}
                        height={400}
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                        className="acerca size-full scale-[0.92] object-contain transition-transform duration-500 ease-(--ease-tecnico) group-hover:scale-[1]"
                      />
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className={`tabular font-mono text-2xl font-bold ${a.texto}`}>
                          {nivel.indice}
                          <span className="text-[0.5em] text-white/35">/04</span>
                        </span>
                        <span className="font-mono text-[0.58rem] tracking-[0.16em] text-white/55 uppercase">
                          {nivel.edades}
                        </span>
                      </div>

                      <h3 className="mt-4 text-2xl text-white">{nivel.nombre}</h3>
                      {nivel.nombreLargo && (
                        <p className="mt-1.5 font-mono text-[0.62rem] leading-relaxed tracking-[0.1em] text-white/55 uppercase">
                          {nivel.nombreLargo}
                        </p>
                      )}
                      <p className="mt-3 flex-1 text-sm text-white/70">{nivel.claim}</p>

                      <span className="mt-6 inline-flex items-center gap-2 font-mono text-[0.68rem] font-bold tracking-[0.14em] text-white uppercase">
                        Ver el nivel
                        <span
                          aria-hidden="true"
                          className="transition-transform duration-200 group-hover:translate-x-1.5"
                        >
                          →
                        </span>
                      </span>
                    </div>

                    <span aria-hidden="true" className={`block h-1.5 w-full ${a.barra}`} />
                  </Link>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
