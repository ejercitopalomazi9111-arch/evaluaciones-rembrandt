import { INSTITUCION } from '@/content/institucion';
import { Container, Eyebrow, Section } from '@/components/ui/primitivas';
import { Reveal } from '@/components/ui/Reveal';
import { Escudo } from '@/components/marca/Marca';

/**
 * Los tres valores están escritos en el propio escudo del instituto
 * (RESPETO · CULTURA · HONOR). Aquí se sacan del escudo y se explican.
 */
export function ValoresTriada() {
  return (
    <Section id="valores" className="bg-azul-hondo/45">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.9fr)] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Eyebrow>Identidad</Eyebrow>
            <h2 className="mt-5 text-4xl">Tres palabras que están en el escudo</h2>
            <p className="mt-5 text-white/70">
              No son un eslogan que se eligió en una junta: llevan décadas escritas alrededor del
              retrato de Rembrandt en nuestro escudo.
            </p>
            <div className="mt-8 hidden lg:block">
              <Escudo size={120} />
            </div>
          </div>

          <ul className="list-none self-start">
            {INSTITUCION.valores.map((v, i) => (
              <li
                key={v.nombre}
                className="border-t border-white/12 last:border-b last:border-white/12"
              >
                <Reveal delay={i * 80}>
                  <div className="py-8 sm:py-10">
                    <div className="flex items-baseline gap-4">
                      <span className="tabular font-mono text-xs font-bold text-rojo-claro">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 className="text-3xl uppercase" style={{ fontStretch: '118%' }}>
                        {v.nombre}
                      </h3>
                    </div>
                    <p className="mt-4 max-w-[62ch] pl-9 text-lg text-white/70">{v.texto}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
