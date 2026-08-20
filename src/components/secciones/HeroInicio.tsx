import { Container, Eyebrow, Button } from '@/components/ui/primitivas';
import { SelloDGETI } from '@/components/marca/Marca';
import { CONTACTO } from '@/content/institucion';

const DATOS = [
  { valor: '4', etiqueta: 'Niveles educativos' },
  { valor: '3–18', etiqueta: 'Años de edad' },
  { valor: '2', etiqueta: 'Planteles en Satélite' },
  { valor: 'DGETI', etiqueta: 'Bachillerato tecnológico' },
];

/**
 * Hero de portada. El LCP es TEXTO, no imagen: carga instantáneo incluso en 4G
 * lento. La geometría —retícula de plano, cuña diagonal y bandas azul/roja—
 * viene de la papelería institucional (docs-marca/).
 */
export function HeroInicio() {
  return (
    <section className="bg-tinta text-hueso">
      {/* ── Bloque superior con la geometría ───────────────────────────── */}
      <div className="relative overflow-hidden">
        <div aria-hidden="true" className="plano-claro absolute inset-0 opacity-60" />
        {/* Arte generado: cuñas diagonales del membrete, pieza `arte-hero`.
            Es decorativo y va por debajo del texto — el LCP sigue siendo el
            titular, no una imagen. En móvil se omite para no recortar mal. */}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 right-0 hidden w-[58%] bg-cover bg-right bg-no-repeat opacity-90 sm:block"
          style={{ backgroundImage: 'url(/arte/arte-hero.svg)' }}
        />

        <Container className="relative">
          <div className="grid items-start gap-10 pt-14 pb-16 sm:pt-20 sm:pb-24 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-14">
            <div className="max-w-[44rem]">
              <Eyebrow tono="claro">Querétaro · Col. Satélite · Desde 3 años</Eyebrow>

              <h1 className="mt-7 text-hero font-black">
                <span className="block">Respeto,</span>
                <span className="block">cultura</span>
                <span className="block">y honor.</span>
              </h1>

              <p
                className="mt-6 max-w-[24ch] font-display text-2xl leading-[1.12] font-extrabold text-rojo-claro text-balance sm:text-3xl"
                style={{ fontStretch: '108%' }}
              >
                Y una preparatoria que enseña a programar.
              </p>

              <p className="mt-7 max-w-[52ch] text-lg text-white/75">
                Un solo instituto de los 3 a los 18 años, en Col. Satélite. Particular, laico,
                mixto y bilingüe — con un Bachillerato Tecnológico incorporado a la DGETI que se
                cursa con especialidad en Programación.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button href="/admisiones/agendar-recorrido" variante="claro">
                  Agendar un recorrido
                </Button>
                <Button
                  href="/niveles"
                  variante="linea"
                  className="text-white ring-white/35 hover:bg-white hover:text-tinta"
                >
                  Ver los niveles
                </Button>
              </div>

              <p className="mt-8">
                <a
                  href={`tel:${CONTACTO.telefonoE164}`}
                  className="tabular inline-flex min-h-11 items-center gap-3 font-mono text-sm tracking-[0.1em] text-white/55 uppercase transition-colors hover:text-white"
                >
                  <span aria-hidden="true" className="block h-px w-6 bg-rojo-claro" />
                  {CONTACTO.telefonoDisplay}
                </a>
              </p>
            </div>

            <div className="hidden lg:block">
              <SelloDGETI />
            </div>
          </div>
        </Container>
      </div>

      {/* ── Franja de datos: fondo sólido, sin diagonales debajo ────────── */}
      <div className="border-t border-white/12 bg-tinta">
        <Container>
          <dl className="tabular grid grid-cols-2 sm:grid-cols-4">
            {DATOS.map((d, i) => (
              <div
                key={d.etiqueta}
                className={`py-6 sm:px-6 sm:first:pl-0 ${
                  i % 2 === 1 ? 'border-l border-white/12 pl-5 sm:pl-6' : ''
                } ${i < 2 ? 'border-b border-white/12 sm:border-b-0' : ''} ${
                  i === 2 ? 'sm:border-l sm:border-white/12' : ''
                }`}
              >
                <dt className="sr-only">{d.etiqueta}</dt>
                <dd>
                  <span className="block font-display text-3xl font-black text-white">
                    {d.valor}
                  </span>
                  <span className="mt-1.5 block font-mono text-[0.58rem] leading-tight tracking-[0.16em] text-white/55 uppercase">
                    {d.etiqueta}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </div>
    </section>
  );
}
