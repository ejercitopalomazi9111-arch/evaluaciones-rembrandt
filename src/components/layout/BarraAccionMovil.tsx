import Link from 'next/link';
import { CONTACTO } from '@/content/institucion';
import { CTA_GLOBAL } from '@/content/navegacion';

/**
 * Barra fija inferior en móvil: llamar y agendar siempre a un pulgar de
 * distancia. Respeta el área segura de iOS.
 */
export function BarraAccionMovil() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-tinta bg-transparent lg:hidden no-imprimir"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <a
        href={`tel:${CONTACTO.telefonoE164}`}
        className="flex min-h-14 items-center justify-center gap-2 border-r border-tinta/15 font-mono text-[0.68rem] font-bold tracking-[0.12em] text-white uppercase"
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
          <path d="M6.2 3.5h3l1.5 4-2 1.4a12.5 12.5 0 0 0 6.4 6.4l1.4-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.2 5.7a2 2 0 0 1 2-2.2Z" />
        </svg>
        Llamar
      </a>
      <Link
        href={CTA_GLOBAL.href}
        className="flex min-h-14 items-center justify-center bg-rojo-texto font-mono text-[0.68rem] font-bold tracking-[0.12em] text-white uppercase"
      >
        {CTA_GLOBAL.label}
      </Link>
    </div>
  );
}
