import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/layout/PageHero';
import { BandaDiagonal } from '@/components/secciones/BandaDiagonal';
import { CtaRecorrido } from '@/components/secciones/CtaRecorrido';
import { Accordion, Container, Eyebrow, JsonLd, Section } from '@/components/ui/primitivas';
import { Reveal } from '@/components/ui/Reveal';
import { FAQ, NOTA_REQUISITOS, PASOS_ADMISION, REQUISITOS } from '@/content/admisiones';
import { seoDe, SITE_URL } from '@/content/seo';

export const metadata: Metadata = seoDe('/admisiones');

const FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map((f) => ({
    '@type': 'Question',
    name: f.pregunta,
    acceptedAnswer: { '@type': 'Answer', text: f.respuesta },
  })),
};

const MIGAS_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Admisiones', item: `${SITE_URL}/admisiones` },
  ],
};

export default function AdmisionesPage() {
  return (
    <>
      <PageHero
        eyebrow="Admisiones"
        titulo="Cinco pasos, sin letra chica"
        entradilla="El proceso completo, explicado antes de que preguntes. Empieza por conocer el plantel: es lo que más ayuda a decidir."
      />

      {/* Proceso */}
      <Section id="proceso">
        <Container>
          <Eyebrow>El proceso</Eyebrow>
          <h2 className="mt-5 max-w-2xl text-3xl">Cómo se ingresa al instituto</h2>

          <ol className="mt-12 list-none">
            {PASOS_ADMISION.map((p, i) => (
              <li key={p.numero}>
                <Reveal delay={i * 60}>
                  <div className="grid gap-5 border-t border-linea py-8 sm:grid-cols-[6rem_minmax(0,1fr)] sm:gap-8 sm:py-10">
                    <span className="tabular font-mono text-3xl leading-none font-bold text-rojo">
                      {p.numero}
                    </span>
                    <div className="max-w-[62ch]">
                      <h3 className="text-2xl">{p.titulo}</h3>
                      <p className="mt-3 text-lg text-tinta-suave">{p.texto}</p>
                      {p.accion && (
                        <Link
                          href={p.accion.href}
                          className="mt-5 inline-flex min-h-11 items-center gap-2 font-mono text-xs font-bold tracking-[0.14em] text-azul uppercase hover:underline"
                        >
                          {p.accion.label} →
                        </Link>
                      )}
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* Requisitos */}
      <Section className="bg-hueso-2" id="requisitos">
        <Container>
          <Eyebrow>Documentación</Eyebrow>
          <h2 className="mt-5 max-w-2xl text-3xl">Qué hay que reunir</h2>

          <div className="mt-10 grid gap-px bg-linea sm:grid-cols-2">
            {REQUISITOS.map((r) => (
              <div key={r.titulo} className="bg-hueso-2 p-7 sm:p-9">
                <h3 className="text-xl">{r.titulo}</h3>
                <ul className="mt-5 list-none space-y-3">
                  {r.puntos.map((p) => (
                    <li key={p} className="flex gap-3.5 text-tinta-suave">
                      <span aria-hidden="true" className="mt-2.5 block size-1.5 shrink-0 bg-azul" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-8 max-w-3xl border-l-2 border-rojo pl-5 text-sm leading-relaxed text-tinta-suave">
            {NOTA_REQUISITOS}
          </p>
        </Container>
      </Section>

      {/* Preguntas frecuentes */}
      <Section id="preguntas">
        <Container ancho="estrecho">
          <Eyebrow>Preguntas frecuentes</Eyebrow>
          <h2 className="mt-5 text-3xl">Lo que más nos preguntan</h2>
          <div className="mt-10">
            <Accordion items={FAQ} />
          </div>
        </Container>
      </Section>

      <BandaDiagonal />
      <CtaRecorrido />

      <JsonLd data={FAQ_JSONLD} />
      <JsonLd data={MIGAS_JSONLD} />
    </>
  );
}
