import Link from 'next/link';
import { Button, Container, Eyebrow, Section } from '@/components/ui/primitivas';
import { Mascota } from '@/components/marca/Marca';

export default function NoEncontrado() {
  return (
    <Section className="bg-tinta text-hueso">
      <Container>
        <div className="grid items-center gap-10 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="max-w-xl">
            <Eyebrow tono="claro">Error 404</Eyebrow>
            <h1 className="mt-5 text-4xl text-white">Esta página no existe</h1>
            <p className="mt-5 text-lg text-white/75">
              Puede que el enlace esté mal escrito o que la página haya cambiado de lugar. Desde el
              inicio llegas a todo.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/" variante="claro">
                Ir al inicio
              </Button>
              <Link
                href="/contacto"
                className="inline-flex min-h-(--spacing-toque) items-center justify-center px-6 font-mono text-xs font-bold tracking-[0.13em] text-white uppercase ring-2 ring-white/35 ring-inset hover:bg-white hover:text-tinta"
              >
                Contacto
              </Link>
            </div>
          </div>
          <Mascota width={200} className="h-auto w-[11rem] justify-self-center sm:w-[13rem]" />
        </div>
      </Container>
    </Section>
  );
}
