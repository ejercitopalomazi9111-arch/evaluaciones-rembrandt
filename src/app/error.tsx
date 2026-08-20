'use client';

import { Container, Eyebrow, Section } from '@/components/ui/primitivas';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Section className="bg-tinta text-hueso">
      <Container>
        <div className="max-w-xl">
          <Eyebrow tono="claro">Algo falló</Eyebrow>
          <h1 className="mt-5 text-4xl text-white">No pudimos cargar esta página</h1>
          <p className="mt-5 text-lg text-white/75">
            Vuelve a intentarlo. Si el problema continúa, escríbenos y lo revisamos.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-8 inline-flex min-h-(--spacing-toque) items-center bg-hueso px-6 font-mono text-xs font-bold tracking-[0.13em] text-tinta uppercase"
          >
            Reintentar
          </button>
        </div>
      </Container>
    </Section>
  );
}
