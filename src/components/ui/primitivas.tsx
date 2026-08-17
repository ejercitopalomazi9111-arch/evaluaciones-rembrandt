import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

/* ── Contenedor y sección ─────────────────────────────────────────────── */

export function Container({
  children,
  className = '',
  ancho = 'normal',
}: {
  children: ReactNode;
  className?: string;
  ancho?: 'normal' | 'estrecho' | 'amplio';
}) {
  const max =
    ancho === 'estrecho' ? 'max-w-3xl' : ancho === 'amplio' ? 'max-w-[86rem]' : 'max-w-[78rem]';
  return (
    <div className={`mx-auto w-full px-(--spacing-gutter) ${max} ${className}`}>{children}</div>
  );
}

export function Section({
  children,
  className = '',
  id,
  compacta = false,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  compacta?: boolean;
}) {
  return (
    <section
      id={id}
      className={`${compacta ? 'py-12 sm:py-16' : 'py-(--spacing-seccion)'} ${className}`}
    >
      {children}
    </section>
  );
}

/* ── Eyebrow: etiqueta mono con regla, la firma tipográfica del sistema ── */

export function Eyebrow({
  children,
  tono = 'tinta',
  className = '',
}: {
  children: ReactNode;
  tono?: 'tinta' | 'claro' | 'rojo';
  className?: string;
}) {
  const color =
    tono === 'claro' ? 'text-white/70' : tono === 'rojo' ? 'text-rojo' : 'text-tinta-suave';
  const regla = tono === 'claro' ? 'bg-white/35' : 'bg-rojo';
  return (
    <p
      className={`flex items-center gap-3 font-mono text-eyebrow font-semibold uppercase ${color} ${className}`}
    >
      <span aria-hidden="true" className={`block h-px w-7 shrink-0 ${regla}`} />
      {children}
    </p>
  );
}

/* ── La doble regla azul + roja de la papelería oficial ───────────────── */

export function ReglaInstitucional({
  className = '',
  alto = 5,
}: {
  className?: string;
  alto?: number;
}) {
  return (
    <span
      aria-hidden="true"
      className={`block w-full ${className}`}
      style={{
        height: alto,
        background:
          'linear-gradient(90deg, var(--color-azul) 0 45%, var(--color-rojo) 45% 100%)',
      }}
    />
  );
}

/* ── Botón ────────────────────────────────────────────────────────────── */

type Variante = 'rojo' | 'azul' | 'linea' | 'claro';

const VARIANTES: Record<Variante, string> = {
  // #A3141F sobre blanco da 7:1; la sombra usa el rojo vivo del escudo.
  rojo: 'bg-rojo-texto text-white shadow-[5px_5px_0_0_var(--color-rojo)] hover:shadow-[2px_2px_0_0_var(--color-rojo)] hover:translate-x-[3px] hover:translate-y-[3px]',
  azul: 'bg-azul text-white shadow-[5px_5px_0_0_var(--color-tinta)] hover:shadow-[2px_2px_0_0_var(--color-tinta)] hover:translate-x-[3px] hover:translate-y-[3px]',
  linea:
    'bg-transparent text-tinta ring-2 ring-tinta ring-inset hover:bg-tinta hover:text-hueso',
  claro:
    'bg-white text-tinta shadow-[5px_5px_0_0_var(--color-rojo)] hover:shadow-[2px_2px_0_0_var(--color-rojo)] hover:translate-x-[3px] hover:translate-y-[3px]',
};

const BASE =
  'inline-flex min-h-(--spacing-toque) items-center justify-center gap-2.5 px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.13em] transition-all duration-150 ease-(--ease-tecnico) active:translate-x-[5px] active:translate-y-[5px] active:shadow-none';

export function Button({
  children,
  href,
  variante = 'rojo',
  className = '',
  ...rest
}: {
  children: ReactNode;
  href?: string;
  variante?: Variante;
  className?: string;
} & Omit<ComponentProps<'button'>, 'ref'>) {
  const cls = `${BASE} ${VARIANTES[variante]} ${className}`;
  if (href) {
    const externo = href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:');
    if (externo) {
      return (
        <a href={href} className={cls}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}

/* ── Tarjeta con esquina cortada ──────────────────────────────────────── */

export function Card({
  children,
  className = '',
  corte = true,
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  corte?: boolean;
  hover?: boolean;
}) {
  return (
    <div
      className={`relative bg-papel ring-1 ring-linea ${corte ? 'corte-esquina' : ''} ${
        hover
          ? 'transition-transform duration-200 ease-(--ease-tecnico) hover:-translate-y-1'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ── Numeral índice: 01 — 04 ──────────────────────────────────────────── */

export function NumeroIndice({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`tabular block font-mono text-4xl leading-none font-bold ${className}`}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

/* ── Etiqueta rectangular ─────────────────────────────────────────────── */

export function Tag({ children, tono = 'azul' }: { children: ReactNode; tono?: 'azul' | 'rojo' | 'linea' }) {
  const c =
    tono === 'rojo'
      ? 'bg-rojo-tenue text-rojo-texto'
      : tono === 'linea'
        ? 'text-tinta-suave ring-1 ring-linea'
        : 'bg-azul-tenue text-azul';
  return (
    <span className={`inline-block px-3 py-1.5 font-mono text-xs font-semibold tracking-wide ${c}`}>
      {children}
    </span>
  );
}

/* ── Acordeón nativo: teclado y semántica gratis ──────────────────────── */

export function Accordion({ items }: { items: readonly { pregunta: string; respuesta: string }[] }) {
  return (
    <div className="divide-y divide-linea border-y border-linea">
      {items.map((it) => (
        <details key={it.pregunta} className="group">
          <summary className="flex min-h-(--spacing-toque) cursor-pointer list-none items-center justify-between gap-4 py-5 text-lg font-bold [&::-webkit-details-marker]:hidden">
            <span className="text-balance">{it.pregunta}</span>
            <span
              aria-hidden="true"
              className="relative grid size-7 shrink-0 place-items-center bg-tinta text-hueso transition-transform duration-200 group-open:rotate-45"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
          </summary>
          <p className="max-w-3xl pb-6 text-tinta-suave">{it.respuesta}</p>
        </details>
      ))}
    </div>
  );
}

/* ── JSON-LD ──────────────────────────────────────────────────────────── */

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
