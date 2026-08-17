import Link from 'next/link';
import { NIVELES_LISTA } from '@/content/niveles';
import { Container, Eyebrow, Section } from '@/components/ui/primitivas';
import { Reveal } from '@/components/ui/Reveal';

const ACENTO = {
  azul: { barra: 'bg-azul', texto: 'text-azul' },
  rojo: { barra: 'bg-rojo', texto: 'text-rojo-texto' },
  ambar: { barra: 'bg-ambar', texto: 'text-tinta' },
} as const;

export function NivelesGrid({ titulo = 'Un instituto, cuatro etapas' }: { titulo?: string }) {
  return (
    <Section id="niveles">
      <Container>
        <div className="max-w-3xl">
          <Eyebrow>Oferta educativa</Eyebrow>
          <h2 className="mt-5 text-4xl">{titulo}</h2>
          <p className="mt-5 text-lg text-tinta-suave">
            La continuidad importa: quien entra en preescolar puede terminar la preparatoria sin
            cambiar de escuela, de criterio ni de comunidad.
          </p>
        </div>

        <ul className="mt-12 grid list-none gap-5 sm:grid-cols-2">
          {NIVELES_LISTA.map((n, i) => {
            const a = ACENTO[n.acento];
            return (
              <li key={n.id}>
                <Reveal delay={i * 70} className="h-full">
                  <Link
                    href={`/niveles/${n.slug}`}
                    className="group corte-esquina relative flex h-full flex-col bg-papel p-7 ring-1 ring-linea transition-transform duration-200 ease-(--ease-tecnico) hover:-translate-y-1 sm:p-9"
                  >
                    <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1.5 ${a.barra}`} />

                    <div className="flex items-baseline justify-between gap-4">
                      <span className={`tabular font-mono text-3xl font-bold ${a.texto}`}>
                        {n.indice}
                      </span>
                      <span className="font-mono text-[0.6rem] tracking-[0.18em] text-tinta-suave uppercase">
                        {n.edades}
                      </span>
                    </div>

                    <h3 className="mt-5 text-2xl">{n.nombre}</h3>
                    {n.nombreLargo && (
                      <p className="mt-1.5 font-mono text-[0.66rem] tracking-[0.12em] text-tinta-suave uppercase">
                        {n.nombreLargo}
                      </p>
                    )}

                    <p className="mt-4 flex-1 text-tinta-suave">{n.claim}</p>

                    <span className="mt-7 inline-flex items-center gap-2 font-mono text-xs font-bold tracking-[0.14em] text-tinta uppercase">
                      Ver el nivel
                      <span
                        aria-hidden="true"
                        className="transition-transform duration-200 group-hover:translate-x-1.5"
                      >
                        →
                      </span>
                    </span>
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
