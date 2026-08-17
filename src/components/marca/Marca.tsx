import Image from 'next/image';


import { INSTITUCION } from '@/content/institucion';

/**
 * El escudo se recortó del membrete oficial y sólo existe a baja resolución,
 * así que el sistema está diseñado para no mostrarlo nunca muy grande.
 */
export function Escudo({ size = 44, className = '' }: { size?: number; className?: string }) {
  return (
    <Image
      src="/marca/escudo.png"
      alt=""
      width={size}
      height={Math.round((size * 786) / 714)}
      sizes={`${size}px`}
      quality={90}
      className={className}
      aria-hidden="true"
    />
  );
}

export function Mascota({
  className = '',
  width = 320,
  preload = false,
}: {
  className?: string;
  width?: number;
  preload?: boolean;
}) {
  return (
    <Image
      src="/marca/mascota.png"
      alt="Bisonte, mascota del Instituto Rembrandt, con el jersey del escudo institucional"
      width={width}
      height={Math.round((width * 669) / 373)}
      sizes={`(min-width: 1024px) ${width}px, 45vw`}
      quality={82}
      preload={preload}
      className={className}
    />
  );
}

/** Escudo + nombre. En el membrete el nombre va en rojo: aquí se respeta. */
export function Lockup({
  tono = 'tinta',
  size = 42,
  className = '',
}: {
  tono?: 'tinta' | 'claro';
  size?: number;
  className?: string;
}) {
  const claro = tono === 'claro';
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <Escudo size={size} />
      <span className="flex flex-col leading-none">
        <span
          className={`font-display text-[0.95rem] leading-[1.05] font-extrabold tracking-[-0.01em] uppercase sm:text-[1.05rem] ${
            claro ? 'text-white' : 'text-rojo-texto'
          }`}
          style={{ fontStretch: '115%' }}
        >
          Instituto
          <br />
          Rembrandt
        </span>
        <span
          className={`mt-1 font-mono text-[0.5rem] font-semibold tracking-[0.22em] uppercase sm:text-[0.55rem] ${
            claro ? 'text-white/55' : 'text-tinta-suave'
          }`}
        >
          Querétaro
        </span>
      </span>
      <span className="sr-only">{INSTITUCION.nombreLegal}</span>
    </span>
  );
}

/** Sello del bachillerato tecnológico — el mayor diferenciador del instituto. */
export function SelloDGETI({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 bg-tinta py-2 pr-4 pl-3 font-mono text-[0.6rem] font-bold tracking-[0.18em] text-white uppercase ${className}`}
    >
      <span aria-hidden="true" className="block h-4 w-1 bg-rojo" />
      Incorporado a DGETI
    </span>
  );
}
