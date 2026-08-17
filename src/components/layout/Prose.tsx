import type { SeccionLegal } from '@/content/types';
import { Eyebrow, ReglaInstitucional } from '@/components/ui/primitivas';

/** Documento legal. Tipografía de lectura larga, numeración monoespaciada. */
export function DocumentoLegal({
  eyebrow,
  titulo,
  entradilla,
  secciones,
}: {
  eyebrow: string;
  titulo: string;
  entradilla: string;
  secciones: readonly SeccionLegal[];
}) {
  return (
    <article>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="mt-5 text-4xl">{titulo}</h1>
      <p className="mt-5 text-lg text-tinta-suave">{entradilla}</p>
      <ReglaInstitucional className="mt-8" />

      {/* Índice */}
      <nav aria-label="Contenido del documento" className="mt-10 border border-linea bg-papel p-6">
        <p className="font-mono text-[0.6rem] font-bold tracking-[0.18em] text-tinta-suave uppercase">
          Contenido
        </p>
        <ol className="mt-4 list-none space-y-1.5">
          {secciones.map((s, i) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="flex min-h-9 items-baseline gap-3 text-sm hover:text-rojo-texto"
              >
                <span className="tabular font-mono text-[0.65rem] text-rojo">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {s.titulo}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-14 space-y-12">
        {secciones.map((s, i) => (
          <section key={s.id} id={s.id} className="scroll-mt-28">
            <h2 className="flex items-baseline gap-4 text-2xl">
              <span className="tabular font-mono text-sm font-bold text-rojo">
                {String(i + 1).padStart(2, '0')}
              </span>
              {s.titulo}
            </h2>
            <div className="mt-5 space-y-4">
              {s.parrafos.map((p) => (
                <p key={p.slice(0, 40)} className="leading-[1.7] text-tinta-suave">
                  {p}
                </p>
              ))}
            </div>
            {s.lista && (
              <ul className="mt-5 list-none space-y-2.5">
                {s.lista.map((it) => (
                  <li key={it} className="flex gap-3.5 text-tinta-suave">
                    <span aria-hidden="true" className="mt-2.5 block size-1.5 shrink-0 bg-azul" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}
