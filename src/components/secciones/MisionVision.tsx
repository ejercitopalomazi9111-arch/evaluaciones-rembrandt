import { INSTITUCION } from '@/content/institucion';
import { Container, Eyebrow, Section } from '@/components/ui/primitivas';

/** Textos oficiales del instituto, citados íntegros y sin retocar. */
export function MisionVision() {
  const bloques = [
    { id: 'mision', etiqueta: 'Misión', texto: INSTITUCION.mision },
    { id: 'vision', etiqueta: 'Visión', texto: INSTITUCION.vision },
  ];

  return (
    <Section id="mision">
      <Container>
        <Eyebrow>Lo que nos comprometimos a hacer</Eyebrow>
        <div className="mt-10 grid gap-px bg-white/12 md:grid-cols-2">
          {bloques.map((b) => (
            <article key={b.id} id={b.id} className="bg-azul-hondo/45 p-8 sm:p-10">
              <h2
                className="font-mono text-eyebrow font-bold tracking-[0.2em] text-rojo-claro uppercase"
              >
                {b.etiqueta}
              </h2>
              <p className="mt-5 text-xl leading-[1.5] text-balance">{b.texto}</p>
            </article>
          ))}
        </div>
        <p className="mt-8 font-mono text-[0.65rem] tracking-[0.14em] text-white/70 uppercase">
          {INSTITUCION.direccionAcademica.cargo} — {INSTITUCION.direccionAcademica.nombre}
        </p>
      </Container>
    </Section>
  );
}
