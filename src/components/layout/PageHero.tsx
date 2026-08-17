import Link from 'next/link';
import type { ReactNode } from 'react';
import { Container, Eyebrow } from '@/components/ui/primitivas';

/** Encabezado interior. Mantiene la geometría del hero sin competir con él. */
export function PageHero({
  eyebrow,
  titulo,
  entradilla,
  migas,
  acento = 'rojo',
  extra,
}: {
  eyebrow: string;
  titulo: string;
  entradilla?: string;
  migas?: readonly { label: string; href: string }[];
  acento?: 'rojo' | 'azul' | 'ambar';
  extra?: ReactNode;
}) {
  const barra = acento === 'azul' ? 'bg-azul' : acento === 'ambar' ? 'bg-ambar' : 'bg-rojo';

  return (
    <div className="relative overflow-hidden bg-tinta text-hueso">
      <div aria-hidden="true" className="plano-claro absolute inset-0 opacity-55" />
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 hidden w-[38%] bg-azul-hondo lg:block"
        style={{ clipPath: 'polygon(38% 0, 100% 0, 100% 100%, 0 100%)' }}
      />
      <span aria-hidden="true" className={`absolute inset-x-0 bottom-0 h-1 ${barra}`} />

      <Container className="relative">
        <div className="grid gap-8 py-12 sm:py-16 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-end">
          <div className="max-w-[42rem]">
            {migas && (
              <nav aria-label="Ruta de navegación" className="mb-6">
                <ol className="flex list-none flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[0.6rem] tracking-[0.14em] text-white/45 uppercase">
                  <li>
                    <Link href="/" className="hover:text-white">
                      Inicio
                    </Link>
                  </li>
                  {migas.map((m) => (
                    <li key={m.href} className="flex items-center gap-2">
                      <span aria-hidden="true">/</span>
                      <Link href={m.href} className="hover:text-white">
                        {m.label}
                      </Link>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            <Eyebrow tono="claro">{eyebrow}</Eyebrow>
            <h1 className="mt-5 text-4xl text-white">{titulo}</h1>
            {entradilla && <p className="mt-6 text-lg text-white/75">{entradilla}</p>}
          </div>

          {extra && <div className="lg:justify-self-end">{extra}</div>}
        </div>
      </Container>
    </div>
  );
}
