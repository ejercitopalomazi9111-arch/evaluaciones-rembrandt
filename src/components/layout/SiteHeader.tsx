import Link from 'next/link';
import { Lockup } from '@/components/marca/Marca';
import { MobileNav } from './MobileNav';
import { NavEscritorio } from './NavEscritorio';
import { CTA_GLOBAL } from '@/content/navegacion';
import { CONTACTO } from '@/content/institucion';
import { Container } from '@/components/ui/primitivas';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 no-imprimir">
      {/* La doble regla azul+roja del membrete oficial, arriba del todo */}
      <span
        aria-hidden="true"
        className="block h-1.5 w-full"
        style={{
          background: 'linear-gradient(90deg, var(--color-azul) 0 45%, var(--color-rojo) 45% 100%)',
        }}
      />
      {/* Fondo SÓLIDO y opaco, sin backdrop-filter. Dos razones: el filtro
          obliga a Chrome a recomponer en cada fotograma de scroll, y un header
          pegajoso translúcido deja ver el contenido pasar por debajo, que se
          lee como texto encimado. */}
      <div className="border-b border-white/12 bg-tinta">
        <Container>
          <div className="flex h-16 items-center justify-between gap-4 sm:h-[4.5rem]">
            <Link href="/" className="shrink-0" aria-label="Instituto Rembrandt — Inicio">
              <Lockup tono="claro" />
            </Link>

            <NavEscritorio />

            <div className="flex items-center gap-2">
              <a
                href={`tel:${CONTACTO.telefonoE164}`}
                className="hidden min-h-11 items-center gap-2 px-3 font-mono text-xs font-semibold tracking-[0.1em] text-white/70 uppercase whitespace-nowrap transition-colors hover:text-rojo-claro xl:inline-flex"
              >
                {CONTACTO.telefonoDisplay}
              </a>
              <Link
                href={CTA_GLOBAL.href}
                className="hidden min-h-11 items-center bg-rojo-texto px-5 font-mono text-xs font-bold tracking-[0.12em] text-white uppercase transition-all duration-150 hover:bg-tinta lg:inline-flex"
              >
                {CTA_GLOBAL.label}
              </Link>
              <MobileNav />
            </div>
          </div>
        </Container>
      </div>
    </header>
  );
}
