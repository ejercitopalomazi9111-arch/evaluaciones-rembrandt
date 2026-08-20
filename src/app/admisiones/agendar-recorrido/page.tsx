import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/PageHero';
import { Container, Eyebrow, Section } from '@/components/ui/primitivas';
import { FormularioRecorrido } from '@/components/formularios/Formularios';
import { CONTACTO, SEDES, direccionCompleta } from '@/content/institucion';
import { seoDe } from '@/content/seo';

export const metadata: Metadata = seoDe('/admisiones/agendar-recorrido');

export default function AgendarRecorridoPage() {
  return (
    <>
      <PageHero
        eyebrow="Admisiones"
        titulo="Agenda un recorrido"
        entradilla="Déjanos tus datos y Coordinación te contacta para acordar día y hora de tu visita guiada."
        migas={[{ label: 'Admisiones', href: '/admisiones' }]}
      />

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-16">
            <div>
              <FormularioRecorrido />
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="corte-esquina bg-azul-hondo/60 p-7 ring-1 ring-white/12">
                <Eyebrow>¿Prefieres llamar?</Eyebrow>
                <a
                  href={`tel:${CONTACTO.telefonoE164}`}
                  className="tabular mt-4 block font-display text-2xl font-black hover:text-rojo-claro"
                >
                  {CONTACTO.telefonoDisplay}
                </a>
                <a
                  href={`mailto:${CONTACTO.email}`}
                  className="mt-3 block text-sm break-all text-azul-vivo underline"
                >
                  {CONTACTO.email}
                </a>

                <div className="mt-7 space-y-5 border-t border-white/12 pt-6">
                  {SEDES.map((s) => (
                    <div key={s.id}>
                      <p className="font-mono text-[0.58rem] font-bold tracking-[0.16em] text-white/70 uppercase">
                        {s.nombre}
                      </p>
                      <address className="mt-1.5 text-sm leading-relaxed not-italic">
                        {direccionCompleta(s)}
                      </address>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
