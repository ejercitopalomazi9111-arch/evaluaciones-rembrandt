import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/PageHero';
import { CtaRecorrido } from '@/components/secciones/CtaRecorrido';
import { BandaDiagonal } from '@/components/secciones/BandaDiagonal';
import { Container, Eyebrow, Section } from '@/components/ui/primitivas';
import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { GaleriaSlots } from '@/components/media/FotoSlot';
import { Mascota } from '@/components/marca/Marca';
import { EJES, GALERIA_VIDA } from '@/content/vida-escolar';
import { seoDe } from '@/content/seo';

export const metadata: Metadata = seoDe('/vida-escolar');

export default function VidaEscolarPage() {
  return (
    <>
      <PageHero
        eyebrow="Vida escolar"
        titulo="Lo que pasa fuera del cuaderno"
        entradilla="Una escuela no se mide sólo por sus promedios. Se mide por lo que los alumnos hacen cuando nadie los está calificando."
        acento="azul"
      />

      <Section>
        <Container>
          <ul className="grid list-none gap-px bg-white/12 sm:grid-cols-2">
            {EJES.map((e, i) => (
              <li key={e.titulo}>
                <Reveal delay={i * 60} className="h-full">
                  <div className="flex h-full gap-5 bg-transparent p-7 sm:p-9">
                    <Icon name={e.icono} className="mt-1 size-7 shrink-0 text-rojo" />
                    <div>
                      <h2 className="text-2xl">{e.titulo}</h2>
                      <p className="mt-3 text-white/70">{e.texto}</p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* La mascota */}
      <Section className="bg-tinta text-hueso">
        <Container>
          <div className="grid items-center gap-10 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-14">
            <Mascota width={220} className="h-auto w-[9rem] justify-self-center sm:w-[13rem]" />
            <div className="max-w-[46ch]">
              <Eyebrow tono="claro">La mascota</Eyebrow>
              <h2 className="mt-5 text-3xl text-white">El bisonte</h2>
              <p className="mt-5 text-lg text-white/75">
                Grande, terco y difícil de mover cuando decide algo. Los alumnos lo adoptaron hace
                años y aparece en cada torneo, cada festival y cada porra. Es lo más parecido que
                tenemos a un carácter escrito en la pared.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <Eyebrow>Galería</Eyebrow>
          <h2 className="mt-5 max-w-2xl text-3xl">El instituto por dentro</h2>
          <p className="mt-4 max-w-[58ch] text-white/70">
            Estos espacios están reservados para fotografías reales del plantel. Se publican
            únicamente con el consentimiento de padres y tutores cuando aparecen alumnos.
          </p>
          <div className="mt-10">
            <GaleriaSlots slots={GALERIA_VIDA} />
          </div>
        </Container>
      </Section>

      <BandaDiagonal />
      <CtaRecorrido />
    </>
  );
}
