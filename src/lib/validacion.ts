/**
 * Validación de formularios a mano. Son doce campos en tres formularios: zod
 * añadiría una dependencia y peso de bundle para algo que aquí cabe en 70
 * líneas, y la validación es sólo de servidor (que es donde zod menos aporta).
 */

export type Regla = (v: string) => string | null;

export const requerido =
  (campo: string): Regla =>
  (v) =>
    v.trim().length === 0 ? `${campo} es obligatorio.` : null;

export const longitud =
  (min: number, max: number, campo = 'Este campo'): Regla =>
  (v) => {
    const t = v.trim();
    if (t.length === 0) return null; // lo resuelve `requerido`
    if (t.length < min) return `${campo} debe tener al menos ${min} caracteres.`;
    if (t.length > max) return `${campo} no puede exceder ${max} caracteres.`;
    return null;
  };

/** Pragmática a propósito: no intenta implementar el RFC 5322. */
export const correo: Regla = (v) => {
  const t = v.trim();
  if (t.length === 0) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t)
    ? null
    : 'Escribe un correo electrónico válido, por ejemplo nombre@dominio.com.';
};

export const telefonoMx: Regla = (v) => {
  const digitos = v.replace(/\D/g, '');
  if (digitos.length === 0) return null;
  return digitos.length >= 10 && digitos.length <= 13
    ? null
    : 'Escribe un teléfono a 10 dígitos, por ejemplo 442 218 2770.';
};

export const unaDe =
  (opciones: readonly string[]): Regla =>
  (v) =>
    v.trim().length === 0 || opciones.includes(v) ? null : 'Selecciona una opción válida.';

export type Esquema = Readonly<Record<string, readonly Regla[]>>;

export type ResultadoValidacion =
  | { ok: true; valores: Record<string, string> }
  | { ok: false; errores: Record<string, string>; valores: Record<string, string> };

export function validar(datos: FormData, esquema: Esquema): ResultadoValidacion {
  const valores: Record<string, string> = {};
  const errores: Record<string, string> = {};

  for (const campo of Object.keys(esquema)) {
    const bruto = datos.get(campo);
    const v = typeof bruto === 'string' ? bruto : '';
    valores[campo] = v;
    for (const regla of esquema[campo]) {
      const e = regla(v);
      if (e) {
        errores[campo] = e;
        break;
      }
    }
  }

  return Object.keys(errores).length > 0 ? { ok: false, errores, valores } : { ok: true, valores };
}
