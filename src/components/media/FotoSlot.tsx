import Image from 'next/image';
import type { MediaSlot } from '@/content/types';

const RATIO: Record<MediaSlot['ratio'], string> = {
  '16/9': 'aspect-[16/9]',
  '4/3': 'aspect-[4/3]',
  '1/1': 'aspect-square',
  '3/4': 'aspect-[3/4]',
};

/**
 * Hueco de fotografía.
 *
 * Con `src` renderiza la foto real optimizada. Sin `src` dibuja un marcador
 * honesto — jamás una imagen que pretenda ser una foto del plantel. Como la
 * relación de aspecto se fija en ambos casos, el CLS es 0 tanto vacío como
 * lleno: sustituir el marcador por la foto real no mueve nada de la página.
 */
export function FotoSlot({
  slot,
  className = '',
  sizes = '(min-width: 1024px) 50vw, 100vw',
}: {
  slot: MediaSlot;
  className?: string;
  sizes?: string;
}) {
  const marco = `relative overflow-hidden ${RATIO[slot.ratio]} ${className}`;

  if (slot.src) {
    return (
      <div className={marco}>
        <Image
          src={slot.src}
          alt={slot.alt}
          fill
          sizes={sizes}
          quality={82}
          preload={slot.prioridad}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${marco} grano bg-azul-hondo/50 ring-1 ring-white/12`}
      role="img"
      aria-label={`Espacio reservado para una fotografía: ${slot.alt}`}
    >
      {/* marcas de registro, como un grano técnico */}
      <span aria-hidden="true" className="absolute top-3 left-3 h-4 w-px bg-white/25" />
      <span aria-hidden="true" className="absolute top-3 left-3 h-px w-4 bg-white/25" />
      <span aria-hidden="true" className="absolute right-3 bottom-3 h-4 w-px bg-white/25" />
      <span aria-hidden="true" className="absolute right-3 bottom-3 h-px w-4 bg-white/25" />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-5 text-center">
        <svg
          viewBox="0 0 24 24"
          className="size-7 text-white/45"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden="true"
        >
          <path d="M3 7.5h4l1.5-2.5h7L17 7.5h4v12H3z" />
          <circle cx="12" cy="13" r="3.6" />
        </svg>
        <p className="font-mono text-[0.58rem] font-bold tracking-[0.18em] text-white/60 uppercase">
          Espacio para fotografía
        </p>
        <p className="max-w-[26ch] font-mono text-[0.6rem] leading-relaxed text-white/55">
          {slot.id}
        </p>
      </div>
    </div>
  );
}

export function GaleriaSlots({
  slots,
  columnas = 3,
}: {
  slots: readonly MediaSlot[];
  columnas?: 2 | 3;
}) {
  return (
    <ul
      className={`grid list-none gap-4 sm:gap-5 ${
        columnas === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'
      }`}
    >
      {slots.map((s) => (
        <li key={s.id}>
          <FotoSlot slot={s} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
        </li>
      ))}
    </ul>
  );
}
