import { ESPECIALIDAD } from '@/content/especialidad';
import { Button, Container, Eyebrow, Section } from '@/components/ui/primitivas';
import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { SelloDGETI } from '@/components/marca/Marca';

/**
 * La pieza de venta del instituto. Tratamiento de plano técnico: fondo tinta,
 * retícula, numeración monoespaciada. Es el mayor diferenciador de la escuela
 * y hasta ahora estaba escondido en el sitio anterior.
 */
export function EspecialidadProgramacion({ conCta = true }: { conCta?: boolean }) {
  return (
    <Section className="relative overflow-hidden bg-tinta text-hueso" id="especialidad">
      <div aria-hidden="true" className="plano-claro absolute inset-0 opacity-60" />
      <div
        aria-hidden="true"
        className="absolute -top-24 -right-24 size-[28rem] bg-azul-hondo/40"
        style={{ clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)' }}
      />

      <Container className="relative">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
          <div>
            <Eyebrow tono="claro">Preparatoria</Eyebrow>
            <h2 className="mt-5 max-w-[15ch] text-3xl text-white">{ESPECIALIDAD.nombre}</h2>
            <SelloDGETI className="mt-6 ring-1 ring-white/15" />
            <p className="mt-7 max-w-[50ch] text-lg text-white/78">{ESPECIALIDAD.resumen}</p>

            <ul className="mt-8 list-none space-y-3">
              {ESPECIALIDAD.perfilEgreso.map((p) => (
                <li key={p} className="flex gap-3.5 text-white/72">
                  <span aria-hidden="true" className="mt-2.5 block size-1.5 shrink-0 bg-rojo" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>

            {conCta && (
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button href="/niveles/preparatoria" variante="claro">
                  Conocer la preparatoria
                </Button>
              </div>
            )}
          </div>

          <ul className="list-none space-y-px self-start bg-white/10">
            {ESPECIALIDAD.competencias.map((c, i) => (
              <li key={c.titulo}>
                <Reveal delay={i * 60}>
                  <div className="flex gap-5 bg-tinta p-6 sm:p-7">
                    <div className="flex flex-col items-center gap-3">
                      <span className="tabular font-mono text-xs font-bold text-rojo-claro">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span aria-hidden="true" className="block w-px flex-1 bg-white/15" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <Icon name={c.icono} className="size-5 text-white/60" />
                        <h3 className="text-xl text-white">{c.titulo}</h3>
                      </div>
                      <p className="mt-2.5 text-white/65">{c.texto}</p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-12 max-w-3xl border-l-2 border-rojo pl-5 font-mono text-xs leading-relaxed text-white/55">
          {ESPECIALIDAD.nota}
        </p>
      </Container>
    </Section>
  );
}
