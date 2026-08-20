'use client';

import Link from 'next/link';
import { useActionState, useEffect, useRef, type ReactNode } from 'react';
import { enviarSolicitud, ESTADO_INICIAL, type EstadoFormulario } from '@/app/actions/enviar-solicitud';
import type { TipoSolicitud } from '@/lib/esquemas';
import { ETIQUETAS } from '@/lib/esquemas';
import { CONTACTO } from '@/content/institucion';
import { Trampa } from './Campos';

const BOTON =
  'inline-flex min-h-(--spacing-toque) items-center justify-center gap-2.5 px-6 py-3 font-mono ' +
  'text-xs font-bold uppercase tracking-[0.13em] transition-all duration-150';

/** Aviso simplificado en el punto de recolección — lo exige la LFPDPPP. */
function AvisoSimplificado() {
  return (
    <p className="border-l-2 border-azul pl-4 text-sm leading-relaxed text-white/70">
      Los datos que envíes serán utilizados por el Instituto Rembrandt de Querétaro únicamente para
      atender tu solicitud. Si incluyes el nombre de un menor de edad, confirmas ser su padre, madre
      o tutor. Consulta el{' '}
      <Link href="/aviso-de-privacidad" className="font-semibold text-azul-vivo underline">
        aviso de privacidad integral
      </Link>
      .
    </p>
  );
}

function PanelExito({ estado }: { estado: Extract<EstadoFormulario, { estado: 'ok' }> }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <div className="corte-esquina bg-azul-hondo/60 p-8 ring-1 ring-white/12 shadow-[6px_6px_0_0_var(--color-rojo)]">
      <p className="font-mono text-[0.6rem] font-bold tracking-[0.2em] text-rojo-claro uppercase">
        Solicitud recibida
      </p>
      <h3 ref={ref} tabIndex={-1} className="mt-4 text-2xl outline-none">
        {estado.nombre ? `Gracias, ${estado.nombre.split(' ')[0]}.` : 'Gracias.'}
      </h3>
      <p className="mt-4 text-white/70">
        Coordinación te contactará para dar seguimiento. Guarda tu folio por si necesitas
        referenciarlo.
      </p>
      <p className="tabular mt-5 inline-block bg-tinta px-4 py-2 font-mono text-sm font-bold text-white">
        {estado.folio}
      </p>
      <p className="mt-6 text-sm text-white/70">
        ¿Prefieres hablar ahora?{' '}
        <a href={`tel:${CONTACTO.telefonoE164}`} className="font-semibold text-azul-vivo underline">
          {CONTACTO.telefonoDisplay}
        </a>
      </p>
    </div>
  );
}

function PanelFallback({
  fallback,
  mensaje,
}: {
  fallback: { mailto: string; whatsapp?: string; tel: string };
  mensaje: string;
}) {
  return (
    <div className="border border-rojo bg-rojo/12 p-6">
      <p className="font-mono text-[0.6rem] font-bold tracking-[0.2em] text-rojo-claro uppercase">
        Envío no disponible
      </p>
      <p className="mt-3 font-semibold">{mensaje}</p>
      <p className="mt-2 text-sm text-white/70">
        No se perdió nada de lo que escribiste: los botones de abajo ya llevan tu mensaje completo.
      </p>
      <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
        <a href={fallback.mailto} className={`${BOTON} bg-rojo-texto text-white`}>
          Enviar por correo
        </a>
        {fallback.whatsapp && (
          <a
            href={fallback.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className={`${BOTON} bg-tinta text-white`}
          >
            Enviar por WhatsApp
          </a>
        )}
        <a href={fallback.tel} className={`${BOTON} text-white ring-2 ring-tinta ring-inset`}>
          Llamar {CONTACTO.telefonoDisplay}
        </a>
      </div>
    </div>
  );
}

export function FormShell({
  tipo,
  children,
  enviar = 'Enviar solicitud',
}: {
  tipo: TipoSolicitud;
  /** Recibe los errores y los valores previos para repoblar sin JS. */
  children: (
    errores: Readonly<Record<string, string>>,
    valores: Readonly<Record<string, string>>,
  ) => ReactNode;
  enviar?: string;
}) {
  const [estado, accion, enviando] = useActionState(enviarSolicitud, ESTADO_INICIAL);
  const resumenRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (estado.estado === 'invalido') resumenRef.current?.focus();
  }, [estado]);

  if (estado.estado === 'ok') {
    return (
      <div aria-live="polite">
        <PanelExito estado={estado} />
      </div>
    );
  }

  const errores = estado.estado === 'invalido' ? estado.errores : {};
  const valores = estado.estado === 'invalido' ? estado.valores : {};

  return (
    <form action={accion} className="space-y-6" noValidate>
      <input type="hidden" name="tipo" value={tipo} />
      <Trampa />

      <div aria-live="polite">
        {estado.estado === 'invalido' && (
          <div className="border border-rojo bg-rojo/12 p-5">
            <p
              ref={resumenRef}
              tabIndex={-1}
              className="font-mono text-[0.62rem] font-bold tracking-[0.16em] text-rojo-claro uppercase outline-none"
            >
              Revisa {Object.keys(errores).length === 1 ? 'este dato' : 'estos datos'}
            </p>
            <ul className="mt-3 list-none space-y-1.5 text-sm">
              {Object.entries(errores).map(([campo, msg]) => (
                <li key={campo} className="text-rojo-claro">
                  <strong className="font-semibold">{ETIQUETAS[campo] ?? campo}:</strong> {msg}
                </li>
              ))}
            </ul>
          </div>
        )}

        {estado.estado === 'sin-configurar' && (
          <PanelFallback
            fallback={estado.fallback}
            mensaje="El envío automático todavía no está configurado en este sitio."
          />
        )}
        {estado.estado === 'error' && (
          <PanelFallback fallback={estado.fallback} mensaje={estado.mensaje} />
        )}
      </div>

      {children(errores, valores)}

      <AvisoSimplificado />

      <button
        type="submit"
        disabled={enviando}
        aria-busy={enviando}
        className={`${BOTON} w-full bg-rojo-texto text-white shadow-[5px_5px_0_0_var(--color-rojo)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[2px_2px_0_0_var(--color-rojo)] disabled:cursor-wait disabled:opacity-70 sm:w-auto`}
      >
        {enviando ? 'Enviando…' : enviar}
      </button>
    </form>
  );
}
