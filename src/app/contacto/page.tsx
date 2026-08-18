import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/PageHero';
import { Container, Eyebrow, Section } from '@/components/ui/primitivas';
import { Icon } from '@/components/ui/Icon';
import { FormularioContacto } from '@/components/formularios/Formularios';
import { MapaSede } from '@/components/media/MapaSede';
import { CONTACTO, SEDES, direccionCompleta } from '@/content/institucion';
import { seoDe } from '@/content/seo';

export const metadata: Metadata = seoDe('/contacto');

export default function ContactoPage() {
  return (
    <>
      <PageHero
        eyebrow="Contacto"
        titulo="Hablemos"
        entradilla="Escríbenos, llámanos o pásate por el plantel. Coordinación responde en días hábiles."
        acento="azul"
      />

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-16">
            <div>
              <Eyebrow>Envíanos un mensaje</Eyebrow>
              <h2 className="mt-5 mb-9 text-3xl">Cuéntanos qué necesitas</h2>
              <FormularioContacto />
            </div>

            <aside className="space-y-8">
              <div className="corte-esquina bg-tinta p-7 text-hueso">
                <Eyebrow tono="claro">Directo</Eyebrow>
                <ul className="mt-5 list-none space-y-4">
                  <li>
                    <a
                      href={`tel:${CONTACTO.telefonoE164}`}
                      className="flex min-h-11 items-center gap-3 text-white hover:text-rojo-claro"
                    >
                      <Icon name="telefono" className="size-5 shrink-0 text-rojo-claro" />
                      <span className="tabular font-display text-xl font-bold">
                        {CONTACTO.telefonoDisplay}
                      </span>
                    </a>
                  </li>
                  <li>
                    <a
                      href={`mailto:${CONTACTO.email}`}
                      className="flex min-h-11 items-center gap-3 text-white/80 hover:text-white"
                    >
                      <Icon name="correo" className="size-5 shrink-0 text-rojo-claro" />
                      <span className="text-sm break-all">{CONTACTO.email}</span>
                    </a>
                  </li>
                </ul>
                <ul className="mt-6 flex list-none gap-2 border-t border-white/12 pt-5">
                  <li>
                    <a
                      href={CONTACTO.instagram.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center px-4 font-mono text-[0.65rem] tracking-wide text-white/70 uppercase ring-1 ring-white/20 hover:bg-white/10"
                    >
                      Instagram
                    </a>
                  </li>
                  <li>
                    <a
                      href={CONTACTO.facebook.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center px-4 font-mono text-[0.65rem] tracking-wide text-white/70 uppercase ring-1 ring-white/20 hover:bg-white/10"
                    >
                      Facebook
                    </a>
                  </li>
                </ul>
              </div>

              {SEDES.map((s) => (
                <div key={s.id} className="border border-linea bg-papel p-6">
                  <p className="font-mono text-[0.58rem] font-bold tracking-[0.16em] text-rojo-texto uppercase">
                    {s.nombre}
                  </p>
                  <address className="mt-2 leading-relaxed not-italic">
                    {direccionCompleta(s)}
                  </address>
                  <a
                    href={s.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex min-h-11 items-center font-mono text-xs font-bold tracking-[0.14em] text-azul uppercase hover:underline"
                  >
                    Cómo llegar →
                  </a>
                </div>
              ))}
            </aside>
          </div>
        </Container>
      </Section>

      <Section className="bg-hueso-2" compacta>
        <Container>
          <Eyebrow>Ubicación</Eyebrow>
          <h2 className="mt-5 mb-8 text-3xl">Plantel principal</h2>
          <MapaSede sede={SEDES[0]} />
        </Container>
      </Section>
    </>
  );
}
