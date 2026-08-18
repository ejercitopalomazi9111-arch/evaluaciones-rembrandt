'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { CONTACTO } from '@/content/institucion';
import { CTA_GLOBAL, NAV_PRINCIPAL } from '@/content/navegacion';
import { Lockup } from '@/components/marca/Marca';

/**
 * Cajón de navegación a pantalla completa. Trampa de foco, cierre con Escape,
 * bloqueo del scroll de fondo, `inert` sobre el resto de la página y foco de
 * vuelta al disparador al cerrar.
 */
export function MobileNav() {
  const [abierto, setAbierto] = useState(false);
  const [rutaPrevia, setRutaPrevia] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const botonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const panelId = useId();

  // Al navegar se cierra el cajón. Se ajusta durante el render en lugar de en
  // un efecto: así no hay un segundo render con el menú aún abierto.
  if (rutaPrevia !== pathname) {
    setRutaPrevia(pathname);
    if (abierto) setAbierto(false);
  }

  useEffect(() => {
    if (!abierto) return;

    const raiz = document.getElementById('raiz-sitio');
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    raiz?.setAttribute('inert', '');

    const panel = panelRef.current;
    const disparador = botonRef.current;
    panel?.querySelector<HTMLElement>('a, button')?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAbierto(false);
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const focusables = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (focusables.length === 0) return;
      const primero = focusables[0];
      const ultimo = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previo;
      raiz?.removeAttribute('inert');
      disparador?.focus();
    };
  }, [abierto]);

  return (
    <>
      <button
        ref={botonRef}
        type="button"
        onClick={() => setAbierto(true)}
        aria-expanded={abierto}
        aria-controls={panelId}
        className="grid size-11 place-items-center bg-tinta text-hueso lg:hidden"
      >
        <span className="sr-only">Abrir menú de navegación</span>
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {abierto && (
        <div
          id={panelId}
          ref={panelRef}
          className="fixed inset-0 z-100 flex h-[100dvh] flex-col bg-tinta text-hueso lg:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="flex items-center justify-between border-b border-white/12 px-(--spacing-gutter) py-4">
            <Lockup tono="claro" size={38} />
            <button
              type="button"
              onClick={() => setAbierto(false)}
              className="grid size-11 place-items-center bg-white/10 text-white"
            >
              <span className="sr-only">Cerrar menú</span>
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <nav aria-label="Navegación principal" className="flex-1 overflow-y-auto px-(--spacing-gutter) py-6">
            <ul className="list-none space-y-1">
              {NAV_PRINCIPAL.map((item, i) => {
                const activo = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href} className="border-b border-white/10 pb-1">
                    <Link
                      href={item.href}
                      aria-current={activo ? 'page' : undefined}
                      className={`flex min-h-(--spacing-toque) items-baseline gap-4 py-3 font-display text-2xl font-extrabold ${
                        activo ? 'text-white' : 'text-white/85'
                      }`}
                    >
                      <span className="tabular font-mono text-xs font-bold text-rojo-claro">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {item.label}
                    </Link>
                    {item.hijos && (
                      <ul className="list-none pb-3 pl-9">
                        {item.hijos.map((h) => (
                          <li key={h.href}>
                            <Link
                              href={h.href}
                              className="flex min-h-11 items-center font-mono text-xs tracking-wide text-white/60 uppercase"
                            >
                              {h.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-white/12 px-(--spacing-gutter) py-4">
            <Link
              href={CTA_GLOBAL.href}
              className="flex min-h-(--spacing-toque) items-center justify-center bg-rojo-texto px-6 py-3.5 font-mono text-xs font-bold tracking-[0.13em] text-white uppercase"
            >
              {CTA_GLOBAL.label}
            </Link>
            <a
              href={`tel:${CONTACTO.telefonoE164}`}
              className="mt-2 flex min-h-(--spacing-toque) items-center justify-center gap-2 font-mono text-xs tracking-[0.13em] text-white/70 uppercase"
            >
              {CONTACTO.telefonoDisplay}
            </a>
          </div>
        </div>
      )}
    </>
  );
}
