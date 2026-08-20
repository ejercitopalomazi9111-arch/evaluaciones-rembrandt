/**
 * Envío de formularios para el export estático (GitHub Pages).
 *
 * En un alojamiento estático no hay servidor que ejecute nada, así que no se
 * puede mandar correo. En vez de fingirlo, se valida en el navegador y se
 * devuelve el mismo estado `sin-configurar` que usa la versión con servidor
 * cuando le faltan credenciales: `PanelFallback` ofrece entonces enviar por
 * correo, por WhatsApp o llamar, con el mensaje ya redactado y sin perder nada
 * de lo que la persona escribió.
 *
 * `next.config.ts` sustituye `@/app/actions/enviar-solicitud` por este módulo
 * cuando se compila con `EXPORT_ESTATICO=1`.
 */
import {
  construirFallback,
  esTipo,
  folio,
  pareceBot,
  type EstadoFormulario,
} from '@/app/actions/comun';
import { ESQUEMAS, type TipoSolicitud } from '@/lib/esquemas';
import { validar } from '@/lib/validacion';

// El gemelo con servidor no puede reexportar constantes (lo prohíbe
// 'use server'), así que aquí tampoco, para que las dos superficies coincidan.

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

  return { estado: 'sin-configurar', fallback: construirFallback(tipo, resultado.valores) };
}
