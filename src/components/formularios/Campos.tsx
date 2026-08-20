'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';

const BASE_CAMPO =
  'block w-full min-h-(--spacing-toque) border border-white/20 bg-tinta/70 px-4 py-3 text-base text-white ' +
  'transition-colors placeholder:text-white/45 focus:border-rojo focus:bg-tinta focus:outline-none ' +
  'aria-[invalid=true]:border-rojo aria-[invalid=true]:bg-rojo/12';

function Etiqueta({ htmlFor, children, opcional }: { htmlFor: string; children: ReactNode; opcional?: boolean }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 flex items-baseline justify-between gap-3 font-mono text-[0.62rem] font-bold tracking-[0.16em] text-white uppercase"
    >
      <span>{children}</span>
      {opcional && <span className="font-normal text-white/70 normal-case">opcional</span>}
    </label>
  );
}

export function FieldError({ id, mensaje }: { id: string; mensaje?: string }) {
  if (!mensaje) return null;
  return (
    <p id={id} className="mt-2 flex items-start gap-2 text-sm font-medium text-rojo-claro">
      <span aria-hidden="true" className="mt-1.5 block size-1.5 shrink-0 bg-rojo" />
      {mensaje}
    </p>
  );
}

interface Comun {
  name: string;
  label: string;
  error?: string;
  defaultValue?: string;
  opcional?: boolean;
  required?: boolean;
}

export function Field({
  name,
  label,
  error,
  defaultValue,
  opcional,
  required,
  type = 'text',
  inputMode,
  autoComplete,
  enterKeyHint = 'next',
  placeholder,
}: Comun & {
  type?: string;
  inputMode?: 'text' | 'tel' | 'email' | 'numeric';
  autoComplete?: string;
  enterKeyHint?: 'next' | 'send' | 'done';
  placeholder?: string;
}) {
  const id = useId();
  const errId = `${id}-error`;
  return (
    <div>
      <Etiqueta htmlFor={id} opcional={opcional}>
        {label}
      </Etiqueta>
      <input
        id={id}
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        enterKeyHint={enterKeyHint}
        placeholder={placeholder}
        required={required}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errId : undefined}
        className={BASE_CAMPO}
      />
      <FieldError id={errId} mensaje={error} />
    </div>
  );
}

export function Textarea({ name, label, error, defaultValue, opcional, required, rows = 5 }: Comun & { rows?: number }) {
  const id = useId();
  const errId = `${id}-error`;
  return (
    <div>
      <Etiqueta htmlFor={id} opcional={opcional}>
        {label}
      </Etiqueta>
      <textarea
        id={id}
        name={name}
        rows={rows}
        required={required}
        defaultValue={defaultValue}
        enterKeyHint="done"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errId : undefined}
        className={`${BASE_CAMPO} resize-y`}
      />
      <FieldError id={errId} mensaje={error} />
    </div>
  );
}

export function Select({
  name,
  label,
  error,
  defaultValue,
  opcional,
  required,
  opciones,
  vacio = 'Selecciona…',
}: Comun & { opciones: readonly string[]; vacio?: string }) {
  const id = useId();
  const errId = `${id}-error`;
  return (
    <div>
      <Etiqueta htmlFor={id} opcional={opcional}>
        {label}
      </Etiqueta>
      <select
        id={id}
        name={name}
        required={required}
        defaultValue={defaultValue ?? ''}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errId : undefined}
        className={BASE_CAMPO}
      >
        <option value="">{vacio}</option>
        {opciones.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <FieldError id={errId} mensaje={error} />
    </div>
  );
}

/**
 * Trampa anti-spam. El honeypot va fuera de pantalla (no display:none, que los
 * bots saltan). La marca de tiempo se pone al montar: la página es estática, así
 * que un valor del servidor quedaría congelado en el momento del build.
 */
export function Trampa() {
  const tsRef = useRef<HTMLInputElement>(null);
  // Se escribe directamente en el DOM (no vía estado): la marca de tiempo es un
  // dato del navegador, no del render, y así no se dispara un render en cascada.
  useEffect(() => {
    if (tsRef.current) tsRef.current.value = String(Date.now());
  }, []);
  return (
    <>
      <div className="trampa" aria-hidden="true">
        <label htmlFor="sitio_web">No llenar este campo</label>
        <input id="sitio_web" name="sitio_web" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input ref={tsRef} type="hidden" name="_ts" defaultValue="" />
    </>
  );
}
