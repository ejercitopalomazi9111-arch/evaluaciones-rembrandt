import Image from 'next/image';
import { Container, Eyebrow, Button } from '@/components/ui/primitivas';
import { SelloDGETI } from '@/components/marca/Marca';
import { CONTACTO } from '@/content/institucion';

const DATOS: { valor: string; etiqueta: string; contador?: number }[] = [
  { valor: '4', etiqueta: 'Niveles educativos', contador: 4 },
  { valor: '3–18', etiqueta: 'Años de edad' },
  { valor: '2', etiqueta: 'Planteles en Satélite' },
  { valor: 'DGETI', etiqueta: 'Bachillerato tecnológico' },
];

/**
 * Hero de portada: escena ilustrada a sangre con el titular encima.
 *
 * La ilustración (`escena-queretaro.webp`) es original, generada con IA a
 * partir de un encargo propio —el acueducto de Querétaro en la paleta del
 * escudo— por `scripts/generar-arte-ia.mjs`. Va con `object-cover` y una
 * cortinilla oscura sobre la mitad izquierda para garantizar el contraste del
 * texto pase lo que pase con el recorte.
 *
 * El LCP sigue siendo el titular, no la imagen: la escena carga de fondo.
 */
export function HeroInicio() {
  return (
    <section className="relative isolate overflow-hidden bg-tinta text-hueso">
      {/* Escena de fondo. Va como background-image y no con next/image: es
          decorativa, no debe competir con el titular por el LCP, y el navegador
          la compone sin bloquear el pintado del texto. */}
      <div
        aria-hidden="true"
        className="parallax-escena absolute inset-0 -z-20 bg-[image:var(--escena)] bg-cover bg-bottom bg-no-repeat"
      />
      {/* cortinilla: asegura el contraste del texto sobre cualquier recorte */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-tinta via-tinta/85 to-transparent"
      />
      <div aria-hidden="true" className="grano absolute inset-0 -z-10" />

      <Container className="relative">
        <div className="grid items-end gap-8 pt-16 pb-14 sm:pt-24 sm:pb-20 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-10">
          <div className="entra max-w-[44rem]">
            <Eyebrow tono="claro">Querétaro · Col. Satélite · Desde 3 años</Eyebrow>

            <h1 className="titular mt-7 text-hero font-black">
              <span className="linea">
                <span>Respeto,</span>
              </span>
              <span className="linea">
                <span>cultura</span>
              </span>
              <span className="linea">
                <span>y honor.</span>
              </span>
            </h1>

            <p
              className="mt-6 max-w-[24ch] font-display text-2xl leading-[1.12] font-extrabold text-rojo-claro text-balance sm:text-3xl"
              style={{ fontStretch: '108%' }}
            >
              Y una preparatoria que enseña a programar.
            </p>

            <p className="mt-7 max-w-[50ch] text-lg text-white/78">
              Un solo instituto de los 3 a los 18 años. Particular, laico, mixto y bilingüe, con un
              Bachillerato Tecnológico incorporado a la DGETI que se cursa con especialidad en
              Programación.
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
                className="tabular inline-flex min-h-11 items-center gap-3 font-mono text-sm tracking-[0.1em] text-white/60 uppercase transition-colors hover:text-white"
              >
                <span aria-hidden="true" className="block h-px w-6 bg-rojo-claro" />
                {CONTACTO.telefonoDisplay}
              </a>
            </p>
          </div>

          {/* El bisonte se planta en el paisaje, como habitante de la escena. */}
          <div className="relative hidden justify-self-end lg:block">
            <SelloDGETI className="absolute -top-2 right-0 z-10" />
            <Image
              src="/marca/mascota.png"
              alt="Bisonte, mascota del Instituto Rembrandt"
              width={300}
              height={538}
              sizes="300px"
              quality={82}
              className="flota h-auto w-[17rem] drop-shadow-[0_24px_40px_rgba(0,0,0,0.55)] xl:w-[19rem]"
            />
          </div>
        </div>
      </Container>

      {/* franja de datos */}
      <div className="relative border-t border-white/15 bg-tinta/85">
        <Container>
          <dl className="tabular grid grid-cols-2 sm:grid-cols-4">
            {DATOS.map((d, i) => (
              <div
                key={d.etiqueta}
                className={`py-6 sm:px-6 sm:first:pl-0 ${
                  i % 2 === 1 ? 'border-l border-white/15 pl-5 sm:pl-6' : ''
                } ${i < 2 ? 'border-b border-white/15 sm:border-b-0' : ''} ${
                  i === 2 ? 'sm:border-l sm:border-white/15' : ''
                }`}
              >
                <dt className="sr-only">{d.etiqueta}</dt>
                <dd>
                  <span className="block font-display text-3xl font-black text-white">
                    {d.contador ? <span data-contador={d.contador}>0</span> : d.valor}
                  </span>
                  <span className="mt-1.5 block font-mono text-[0.58rem] leading-tight tracking-[0.16em] text-white/60 uppercase">
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
