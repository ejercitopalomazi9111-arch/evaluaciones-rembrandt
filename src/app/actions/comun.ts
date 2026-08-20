/**
 * Lo que comparten las dos implementaciones del envío de formularios.
 *
 * El sitio se publica de dos maneras y cada una puede hacer cosas distintas:
 *
 * - Con servidor (Vercel, Node): `enviar-solicitud.ts` es una Server Action y
 *   manda el correo por Resend.
 * - Como export estático (GitHub Pages): no hay servidor que ejecute nada, así
 *   que `enviar-solicitud.estatico.ts` valida en el navegador y entrega el
 *   camino de respaldo.
 *
 * Este módulo no lleva `'use server'` a propósito: lo importan las dos, y una
 * de ellas corre en el navegador.
 */
import { CONTACTO } from '@/content/institucion';
import { ETIQUETAS, TITULOS, type TipoSolicitud } from '@/lib/esquemas';

export interface EnlacesFallback {
  readonly mailto: string;
  readonly whatsapp?: string;
  readonly tel: string;
}

export type EstadoFormulario =
  | { readonly estado: 'inicial' }
  | {
      readonly estado: 'invalido';
      readonly errores: Readonly<Record<string, string>>;
      readonly valores: Readonly<Record<string, string>>;
    }
  | { readonly estado: 'sin-configurar'; readonly fallback: EnlacesFallback }
  | { readonly estado: 'error'; readonly mensaje: string; readonly fallback: EnlacesFallback }
  | { readonly estado: 'ok'; readonly folio: string; readonly nombre: string };

export const ESTADO_INICIAL: EstadoFormulario = { estado: 'inicial' };

export function esTipo(v: unknown): v is TipoSolicitud {
  return v === 'informes' || v === 'recorrido' || v === 'contacto';
}

export function redactar(tipo: TipoSolicitud, valores: Record<string, string>): string {
  const lineas = Object.entries(valores)
    .filter(([, v]) => v.trim().length > 0)
    .map(([k, v]) => `${ETIQUETAS[k] ?? k}: ${v.trim()}`);
  return `${TITULOS[tipo]}\n\n${lineas.join('\n')}`;
}

export function construirFallback(
  tipo: TipoSolicitud,
  valores: Record<string, string>,
): EnlacesFallback {
  const cuerpo = redactar(tipo, valores);
  const asunto = `${TITULOS[tipo]} — sitio web`;
  const wa = process.env.NEXT_PUBLIC_WHATSAPP?.replace(/\D/g, '');

  return {
    mailto: `mailto:${CONTACTO.email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`,
    // Sólo si la escuela confirmó que ese número tiene WhatsApp.
    whatsapp: wa ? `https://wa.me/${wa}?text=${encodeURIComponent(cuerpo)}` : undefined,
    tel: `tel:${CONTACTO.telefonoE164}`,
  };
}

export function folio(): string {
  return `REM-${Date.now().toString(36).toUpperCase()}`;
}

/**
 * Anti-spam sin estado. Devuelve `true` cuando el envío huele a bot y hay que
 * responder "ok" sin hacer nada: darle un error le diría al bot qué corregir.
 *
 * 1. Honeypot: un campo fuera de pantalla que una persona nunca llena.
 * 2. Tiempo mínimo de llenado. La marca la pone el cliente al montar, porque
 *    las páginas son estáticas y una del servidor quedaría congelada en el
 *    build. Sin JavaScript no hay marca y la comprobación se omite.
 */
export function pareceBot(datos: FormData): boolean {
  const trampa = datos.get('sitio_web');
  if (typeof trampa === 'string' && trampa.trim().length > 0) return true;

  const ts = datos.get('_ts');
  if (typeof ts === 'string' && ts.length > 0) {
    const transcurrido = Date.now() - Number(ts);
    if (Number.isFinite(transcurrido) && (transcurrido < 2500 || transcurrido > 7_200_000)) {
      return true;
    }
  }
  return false;
}
