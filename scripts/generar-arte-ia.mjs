/**
 * Produce el arte del sitio en `public/img/`.
 *
 * Se ejecuta en GitHub Actions, no en local: la salida a internet del entorno de
 * desarrollo pasa por un proxy con lista blanca que no alcanza los CDN de
 * imagen. El runner de Actions sí, así que la descarga vive ahí y el resultado
 * se committea. Ver `.github/workflows/generar-arte.yml`.
 *
 *   node scripts/generar-arte-ia.mjs
 *
 * ## De dónde sale cada pieza
 *
 * Dos ilustraciones generadas con IA (Gamma/Imagen) a partir de encargos
 * escritos para este proyecto son la única materia prima:
 *
 * - `ESCENA`: el acueducto de Querétaro en la paleta del escudo. De ella salen
 *   la escena del hero, los cuatro fondos de nivel y la banda de vida escolar,
 *   cada uno con un encuadre distinto. Que compartan origen es deliberado: el
 *   sitio se lee como un solo mundo ilustrado en lugar de una colección de
 *   imágenes sueltas que no combinan.
 * - `VINETAS`: una rejilla 2×2 con los cuatro iconos de nivel, que se parte en
 *   cuatro cuadrados.
 *
 * Una versión anterior generaba diez piezas independientes con un modelo
 * gratuito. El resultado era incoherente —mezclaba fotografía y vector, se salía
 * de la paleta y colaba texto ilegible— así que se descartó. Menos fuentes y
 * mejor material gana a más variedad.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const SALIDA = new URL('../public/img/', import.meta.url);

const ESCENA =
  'https://cdn.gamma.app/bra78pkqaxdfqh0/design-anything/LEywikAQo7BuvEEP4isvP/FFtUfL3nw7uuEl5D8iNQv.png';
const VINETAS =
  'https://cdn.gamma.app/bra78pkqaxdfqh0/design-anything/bmcXm02lgbXZs6oGRsKA0/6Vf45D2aNfOSw1An33xZF.png';

/**
 * Encuadres de la escena.
 *
 * - `x` es la posición horizontal del recorte, de 0 (izquierda) a 1 (derecha).
 * - `zoom` amplía antes de recortar. Los arcos del acueducto se repiten, así que
 *   mover sólo el eje horizontal daba cuatro fondos casi idénticos; cambiar
 *   también el acercamiento es lo que hace que cada nivel se lea distinto.
 */
const RECORTES = [
  { nombre: 'escena-queretaro', ancho: 1600, alto: 900, x: 0.5, zoom: 1, calidad: 62 },
  { nombre: 'fondo-preescolar', ancho: 1200, alto: 900, x: 0.04, zoom: 1.7, calidad: 58 },
  { nombre: 'fondo-primaria', ancho: 1200, alto: 900, x: 0.42, zoom: 1.15, calidad: 58 },
  { nombre: 'fondo-secundaria', ancho: 1200, alto: 900, x: 0.72, zoom: 2.1, calidad: 58 },
  { nombre: 'fondo-preparatoria', ancho: 1200, alto: 900, x: 0.99, zoom: 1.35, calidad: 58 },
  { nombre: 'fondo-vida', ancho: 1500, alto: 645, x: 0.5, zoom: 1.25, calidad: 58 },
];

/** La rejilla se lee en el orden en que se pidió: arriba izq/der, abajo izq/der. */
const CUADRANTES = [
  'vineta-preescolar',
  'vineta-primaria',
  'vineta-secundaria',
  'vineta-preparatoria',
];

async function bajar(url, intentos = 4) {
  let ultimo;
  for (let i = 0; i < intentos; i++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(120_000) });
      if (r.ok) return Buffer.from(await r.arrayBuffer());
      ultimo = new Error(`HTTP ${r.status}`);
    } catch (e) {
      ultimo = e;
    }
    await new Promise((r) => setTimeout(r, 4000 * (i + 1)));
  }
  throw ultimo;
}

await mkdir(SALIDA, { recursive: true });
let total = 0;

async function guardar(nombre, buffer) {
  await writeFile(new URL(`${nombre}.webp`, SALIDA), buffer);
  total += buffer.length;
  console.log(`  ${nombre}.webp  ${(buffer.length / 1024).toFixed(1)} kB`);
}

// ── La escena y sus encuadres ────────────────────────────────────────────────
const escena = await bajar(ESCENA);

for (const r of RECORTES) {
  // Se escala por altura y después se recorta a lo ancho, para que el horizonte
  // quede a la misma altura en todas las piezas.
  //
  // El escalado se hace en dos pasos y se leen las medidas reales del resultado
  // en vez de predecirlas: el redondeo de sharp difiere del propio por un píxel
  // y con encuadres pegados al borde (x ≈ 1) eso basta para que `extract` se
  // salga de la imagen y aborte.
  const escalado = await sharp(escena)
    .resize({ height: Math.round(r.alto * r.zoom) })
    .toBuffer();
  const me = await sharp(escalado).metadata();

  const ancho = Math.min(r.ancho, me.width);
  const alto = Math.min(r.alto, me.height);
  const left = Math.min(Math.round((me.width - ancho) * r.x), me.width - ancho);
  // Con acercamiento sobra alto: se conserva la banda inferior, que es donde
  // están los arcos y el caserío. Recortar por arriba sólo quitaría cielo.
  const top = Math.max(0, me.height - alto);

  const buffer = await sharp(escalado)
    .extract({ left, top, width: ancho, height: alto })
    .webp({ quality: r.calidad, effort: 6 })
    .toBuffer();

  await guardar(r.nombre, buffer);
}

// ── Las viñetas: la rejilla partida en cuatro ────────────────────────────────
const rejilla = await bajar(VINETAS);
const mv = await sharp(rejilla).metadata();
const mitadX = Math.floor(mv.width / 2);
const mitadY = Math.floor(mv.height / 2);

for (const [i, nombre] of CUADRANTES.entries()) {
  const buffer = await sharp(rejilla)
    .extract({
      left: (i % 2) * mitadX,
      top: Math.floor(i / 2) * mitadY,
      width: mitadX,
      height: mitadY,
    })
    .resize(760, 760)
    .webp({ quality: 60, effort: 6 })
    .toBuffer();

  await guardar(nombre, buffer);
}

console.log(`\n${RECORTES.length + CUADRANTES.length} piezas · ${(total / 1024).toFixed(1)} kB`);
