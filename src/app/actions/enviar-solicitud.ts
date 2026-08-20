'use server';

import {
  construirFallback,
  esTipo,
  folio,
  pareceBot,
  redactar,
  type EstadoFormulario,
} from '@/app/actions/comun';
import { CONTACTO } from '@/content/institucion';
import { ESQUEMAS, TITULOS, type TipoSolicitud } from '@/lib/esquemas';
import { validar } from '@/lib/validacion';

export { ESTADO_INICIAL } from '@/app/actions/comun';
export type { EnlacesFallback, EstadoFormulario } from '@/app/actions/comun';

/**
 * Una sola acción para los tres formularios del sitio.
 *
 * Si no hay RESEND_API_KEY —o el envío falla— NO se pierde nada de lo que la
 * persona escribió: se devuelve un enlace mailto/WhatsApp con el mensaje ya
 * redactado. El formulario siempre tiene un camino que funciona.
 *
 * El gemelo de este archivo es `enviar-solicitud.estatico.ts`, que es el que
 * entra en el export estático, donde no hay servidor que pueda enviar nada.
 */
export async function enviarSolicitud(
  _anterior: EstadoFormulario,
  datos: FormData,
): Promise<EstadoFormulario> {
  const tipoBruto = datos.get('tipo');
  const tipo: TipoSolicitud = esTipo(tipoBruto) ? tipoBruto : 'contacto';

  if (pareceBot(datos)) return { estado: 'ok', folio: folio(), nombre: '' };

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
