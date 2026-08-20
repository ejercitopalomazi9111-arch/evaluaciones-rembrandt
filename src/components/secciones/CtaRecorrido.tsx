import { Button, Container, Section } from '@/components/ui/primitivas';
import { Mascota } from '@/components/marca/Marca';
import { CONTACTO } from '@/content/institucion';

/** Banda de cierre. El bisonte aparece aquí, no en el hero: no compite con el LCP. */
export function CtaRecorrido() {
  return (
    <Section className="relative overflow-hidden bg-azul text-white">
      <div aria-hidden="true" className="grano absolute inset-0 opacity-50" />
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 w-1/3 bg-rojo/80"
        style={{ clipPath: 'polygon(38% 0, 100% 0, 100% 100%, 0 100%)' }}
      />

      <Container className="relative">
        <div className="grid items-end gap-8 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="max-w-2xl">
            <h2 className="text-4xl text-white text-balance">
              La mejor forma de decidir es venir a verlo.
            </h2>
            <p className="mt-5 text-lg text-white/80">
              Agenda un recorrido con Coordinación: conoces las instalaciones, hablas con el
              equipo y resuelves las dudas de fondo antes de llenar un solo papel.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button href="/admisiones/agendar-recorrido" variante="claro">
                Agendar recorrido
              </Button>
              <Button
                href={`tel:${CONTACTO.telefonoE164}`}
                variante="linea"
                className="text-white ring-white/40 hover:bg-white hover:text-azul"
              >
                Llamar {CONTACTO.telefonoDisplay}
              </Button>
            </div>
          </div>

          <div className="relative -mb-(--spacing-seccion) hidden justify-self-end sm:block">
            <Mascota width={230} className="h-auto w-[13rem] lg:w-[15rem]" />
          </div>
        </div>
      </Container>
    </Section>
  );
}
