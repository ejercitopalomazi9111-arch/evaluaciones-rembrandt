'use client';

import { useState } from 'react';
import type { Sede } from '@/content/types';
import { direccionCompleta } from '@/content/institucion';

/**
 * Mapa bajo demanda. Mientras nadie lo pida no se abre ninguna conexión con
 * Google: ahorra ~700 kB por página y permite afirmar en el aviso de privacidad
 * que el sitio no llama a terceros por su cuenta.
 */
export function MapaSede({ sede }: { sede: Sede }) {
  const [cargar, setCargar] = useState(false);
  const consulta = encodeURIComponent(direccionCompleta(sede));

  if (cargar) {
    return (
      <div className="aspect-[16/9] w-full border border-white/12 sm:aspect-[21/9]">
        <iframe
          title={`Mapa de ${sede.nombre}`}
          src={`https://maps.google.com/maps?q=${consulta}&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="size-full"
        />
      </div>
    );
  }

  return (
    <div className="grano relative flex aspect-[16/9] w-full flex-col items-center justify-center gap-4 border border-white/12 bg-azul-tenue p-6 text-center sm:aspect-[21/9]">
      <p className="max-w-md font-medium text-white">{direccionCompleta(sede)}</p>
      <p className="max-w-sm text-sm text-white/70">
        El mapa se carga sólo si lo pides: así el sitio no contacta a Google sin tu consentimiento.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => setCargar(true)}
          className="inline-flex min-h-(--spacing-toque) items-center bg-tinta px-5 font-mono text-xs font-bold tracking-[0.13em] text-white uppercase"
        >
          Cargar el mapa
        </button>
        <a
          href={sede.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-(--spacing-toque) items-center px-5 font-mono text-xs font-bold tracking-[0.13em] text-white uppercase ring-2 ring-tinta ring-inset"
        >
          Abrir en Google Maps
        </a>
      </div>
    </div>
  );
}
