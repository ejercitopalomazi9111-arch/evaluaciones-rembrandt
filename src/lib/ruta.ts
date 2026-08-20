/**
 * Prefijo bajo el que vive el sitio.
 *
 * En un dominio propio es cadena vacía. En GitHub Pages el sitio cuelga de
 * `/<repo>/`, y ahí hay una trampa: `basePath` de Next prefija las rutas de
 * `next/link` y los chunks de `_next`, **pero no los archivos de `public/`**.
 * Cualquier referencia absoluta a `/marca/escudo.png` o `/img/...` tiene que
 * pasar por aquí o acaba en 404.
 *
 * El valor lo inyecta el build (`NEXT_PUBLIC_RUTA_BASE`), así que queda fijo en
 * el HTML generado y no hay lógica en el navegador.
 */
export const RUTA_BASE = process.env.NEXT_PUBLIC_RUTA_BASE ?? '';

/** Ruta de un archivo de `public/`, con el prefijo del despliegue. */
export function estatico(ruta: string): string {
  return `${RUTA_BASE}${ruta}`;
}
