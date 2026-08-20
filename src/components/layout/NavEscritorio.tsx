'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_PRINCIPAL } from '@/content/navegacion';

export function NavEscritorio() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación principal" className="hidden lg:block">
      <ul className="flex list-none items-center gap-1">
        {NAV_PRINCIPAL.map((item) => {
          const activo = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href} className="group relative">
              <Link
                href={item.href}
                aria-current={activo ? 'page' : undefined}
                className={`relative flex min-h-11 items-center px-3.5 font-mono text-xs font-semibold tracking-[0.1em] uppercase transition-colors ${
                  activo ? 'text-rojo-claro' : 'text-white hover:text-rojo-claro'
                }`}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={`absolute right-3.5 bottom-2.5 left-3.5 h-0.5 origin-left bg-rojo transition-transform duration-200 ease-(--ease-tecnico) ${
                    activo ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </Link>

              {item.hijos && (
                <div className="invisible absolute top-full left-0 pt-2 opacity-0 transition-[opacity,visibility] duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <ul className="w-64 list-none border border-white/15 bg-tinta shadow-[6px_6px_0_0_rgba(0,0,0,0.5)]">
                    {item.hijos.map((h) => (
                      <li key={h.href} className="border-b border-white/12 last:border-b-0">
                        <Link
                          href={h.href}
                          className="block px-4 py-3 transition-colors hover:bg-white/10"
                        >
                          <span className="block text-sm font-bold">{h.label}</span>
                          {h.descripcion && (
                            <span className="mt-0.5 block font-mono text-[0.6rem] tracking-wide text-white/70 uppercase">
                              {h.descripcion}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
