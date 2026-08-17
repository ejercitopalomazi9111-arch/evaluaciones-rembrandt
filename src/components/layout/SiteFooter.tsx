import Link from 'next/link';
import { CONTACTO, INSTITUCION, SEDES, direccionCompleta } from '@/content/institucion';
import { NAV_PIE } from '@/content/navegacion';
import { Container } from '@/components/ui/primitivas';
import { Escudo } from '@/components/marca/Marca';

/**
 * El pie reproduce la cuña diagonal roja/azul de la papelería oficial
 * (docs-marca/formato-pie.png) como remate del sitio.
 */
export function SiteFooter() {
  return (
    <footer className="relative mt-auto bg-tinta text-hueso no-imprimir">
      {/* cuña diagonal — el gesto del membrete */}
      <div aria-hidden="true" className="relative h-16 overflow-hidden bg-hueso sm:h-24">
        <div
          className="absolute inset-0 bg-tinta"
          style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%)' }}
        />
        <div
          className="absolute inset-0 bg-rojo"
          style={{ clipPath: 'polygon(46% 100%, 100% 42%, 100% 62%, 78% 100%)' }}
        />
        <div
          className="absolute inset-0 bg-azul"
          style={{ clipPath: 'polygon(80% 100%, 100% 76%, 100% 92%, 94% 100%)' }}
        />
      </div>

      <Container>
        <div className="grid gap-12 pb-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,2fr)]">
          <div>
            <div className="flex items-center gap-3">
              <Escudo size={52} />
              <p className="font-display text-lg leading-[1.05] font-extrabold uppercase" style={{ fontStretch: '115%' }}>
                Instituto
                <br />
                Rembrandt
              </p>
            </div>
            <p className="mt-5 max-w-sm text-lg font-bold text-balance">{INSTITUCION.lema}</p>
            <p className="mt-3 font-mono text-[0.62rem] tracking-[0.2em] text-white/45 uppercase">
              {INSTITUCION.caracteristicas.join(' · ')}
            </p>

            <ul className="mt-7 flex list-none flex-wrap gap-3">
              <li>
                <a
                  href={CONTACTO.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 px-4 font-mono text-xs tracking-wide text-white/75 uppercase ring-1 ring-white/20 transition-colors hover:bg-white/10 hover:text-white"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={CONTACTO.facebook.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 px-4 font-mono text-xs tracking-wide text-white/75 uppercase ring-1 ring-white/20 transition-colors hover:bg-white/10 hover:text-white"
                >
                  Facebook
                </a>
              </li>
            </ul>
          </div>

          <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-4">
            {NAV_PIE.map((col) => (
              <nav key={col.label} aria-label={col.label}>
                <p className="font-mono text-[0.6rem] font-bold tracking-[0.2em] text-rojo uppercase">
                  {col.label}
                </p>
                <ul className="mt-4 list-none space-y-1">
                  {col.hijos?.map((h) => (
                    <li key={h.href}>
                      <Link
                        href={h.href}
                        className="flex min-h-9 items-center text-sm text-white/70 transition-colors hover:text-white"
                      >
                        {h.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="grid gap-8 border-t border-white/12 py-10 sm:grid-cols-2 lg:grid-cols-3">
          {SEDES.map((s) => (
            <div key={s.id}>
              <p className="font-mono text-[0.6rem] font-bold tracking-[0.2em] text-white/45 uppercase">
                {s.nombre}
              </p>
              <address className="mt-2 text-sm leading-relaxed text-white/75 not-italic">
                {direccionCompleta(s)}
              </address>
              <a
                href={s.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex min-h-9 items-center font-mono text-[0.65rem] tracking-wide text-rojo uppercase hover:underline"
              >
                Cómo llegar →
              </a>
            </div>
          ))}
          <div>
            <p className="font-mono text-[0.6rem] font-bold tracking-[0.2em] text-white/45 uppercase">
              Contacto
            </p>
            <ul className="mt-2 list-none space-y-1">
              <li>
                <a
                  href={`tel:${CONTACTO.telefonoE164}`}
                  className="tabular flex min-h-9 items-center text-sm text-white/75 hover:text-white"
                >
                  {CONTACTO.telefonoDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACTO.email}`}
                  className="flex min-h-9 items-center text-sm break-all text-white/75 hover:text-white"
                >
                  {CONTACTO.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/12 py-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[0.6rem] tracking-[0.14em] text-white/40 uppercase">
            © {new Date().getFullYear()} {INSTITUCION.nombreLegal}
          </p>
          <ul className="flex list-none flex-wrap gap-x-6 gap-y-1">
            <li>
              <Link
                href="/aviso-de-privacidad"
                className="font-mono text-[0.6rem] tracking-[0.14em] text-white/55 uppercase hover:text-white"
              >
                Aviso de privacidad
              </Link>
            </li>
            <li>
              <Link
                href="/terminos-y-condiciones"
                className="font-mono text-[0.6rem] tracking-[0.14em] text-white/55 uppercase hover:text-white"
              >
                Términos y condiciones
              </Link>
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}
