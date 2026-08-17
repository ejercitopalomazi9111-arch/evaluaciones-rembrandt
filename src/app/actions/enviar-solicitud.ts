'use server';

import { CONTACTO } from '@/content/institucion';
import { ESQUEMAS, ETIQUETAS, TITULOS, type TipoSolicitud } from '@/lib/esquemas';
import { validar } from '@/lib/validacion';

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

const ESTADO_INICIAL: EstadoFormulario = { estado: 'inicial' };
export { ESTADO_INICIAL };

function esTipo(v: unknown): v is TipoSolicitud {
  return v === 'informes' || v === 'recorrido' || v === 'contacto';
}

function redactar(tipo: TipoSolicitud, valores: Record<string, string>): string {
  const lineas = Object.entries(valores)
    .filter(([, v]) => v.trim().length > 0)
    .map(([k, v]) => `${ETIQUETAS[k] ?? k}: ${v.trim()}`);
  return `${TITULOS[tipo]}\n\n${lineas.join('\n')}`;
}

function construirFallback(tipo: TipoSolicitud, valores: Record<string, string>): EnlacesFallback {
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

function folio(): string {
  return `REM-${Date.now().toString(36).toUpperCase()}`;
}

/**
 * Una sola acción para los tres formularios del sitio.
 *
 * Si no hay RESEND_API_KEY —o el envío falla— NO se pierde nada de lo que la
 * persona escribió: se devuelve un enlace mailto/WhatsApp con el mensaje ya
 * redactado. El formulario siempre tiene un camino que funciona.
 */
export async function enviarSolicitud(
  _anterior: EstadoFormulario,
  datos: FormData,
): Promise<EstadoFormulario> {
  const tipoBruto = datos.get('tipo');
  const tipo: TipoSolicitud = esTipo(tipoBruto) ? tipoBruto : 'contacto';

  // ── Anti-spam sin estado ────────────────────────────────────────────────
  // 1) Honeypot: campo fuera de pantalla que una persona nunca llena.
  const trampa = datos.get('sitio_web');
  if (typeof trampa === 'string' && trampa.trim().length > 0) {
    // Se responde "ok" para no darle señal al bot.
    return { estado: 'ok', folio: folio(), nombre: '' };
  }
  // 2) Tiempo mínimo de llenado. El campo lo pone el cliente al montar, porque
  //    las páginas son estáticas y una marca de tiempo del servidor quedaría
  //    congelada en el momento del build. Si no hay JS, no se comprueba.
  const ts = datos.get('_ts');
  if (typeof ts === 'string' && ts.length > 0) {
    const transcurrido = Date.now() - Number(ts);
    if (Number.isFinite(transcurrido) && (transcurrido < 2500 || transcurrido > 7_200_000)) {
      return { estado: 'ok', folio: folio(), nombre: '' };
    }
  }

  const resultado = validar(datos, ESQUEMAS[tipo]);
  if (!resultado.ok) {
    return { estado: 'invalido', errores: resultado.errores, valores: resultado.valores };
  }

  const { valores } = resultado;
  const nombre = valores.nombre?.trim() ?? '';

  // Modo de desarrollo: no toca la red.
  if (process.env.SIMULAR_ENVIO === '1') {
    return { estado: 'ok', folio: folio(), nombre };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const destino = process.env.CORREO_DESTINO ?? CONTACTO.email;
  const remitente = process.env.CORREO_REMITENTE;

  if (!apiKey || !remitente) {
    return { estado: 'sin-configurar', fallback: construirFallback(tipo, valores) };
  }

  try {
    const respuesta = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: remitente,
        to: [destino],
        reply_to: valores.email,
        subject: `${TITULOS[tipo]} — ${nombre}`,
        text: redactar(tipo, valores),
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!respuesta.ok) {
      return {
        estado: 'error',
        mensaje: 'No pudimos enviar tu solicitud en este momento.',
        fallback: construirFallback(tipo, valores),
      };
    }

    return { estado: 'ok', folio: folio(), nombre };
  } catch {
    return {
      estado: 'error',
      mensaje: 'No pudimos enviar tu solicitud en este momento.',
      fallback: construirFallback(tipo, valores),
    };
  }
}
