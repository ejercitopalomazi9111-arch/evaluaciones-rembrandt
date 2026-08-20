/**
 * Genera el arte del sitio con un modelo de imagen y lo deja en `public/img/`.
 *
 * Se ejecuta en GitHub Actions, no en local: el entorno de desarrollo de este
 * repositorio sale a internet por un proxy con lista blanca que no alcanza a
 * los CDN de imagen. El runner de Actions sí, así que la generación vive ahí y
 * el resultado se committea. Ver `.github/workflows/generar-arte.yml`.
 *
 *   node scripts/generar-arte-ia.mjs
 *
 * Las semillas están fijas para que dos ejecuciones den el mismo resultado y el
 * commit sea reproducible. Cambiar una semilla es la forma de pedir otra toma.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const SALIDA = new URL('../public/img/', import.meta.url);

/** Estilo común. Va en todas las piezas para que el conjunto se lea como una familia. */
const ESTILO =
  'Flat vector editorial illustration, bold screen-print risograph poster, strictly limited ' +
  'palette of deep indigo navy, royal blue, crimson red and warm bone white. ';
const CIERRE =
  ' Flat graphic shapes, clean geometric linework, subtle halftone grain, modern Mexican poster ' +
  'design, high contrast, balanced composition. No sun, no sun disc, no sky gradient, no text, ' +
  'no letters, no numbers, no watermark, no human faces.';

/**
 * La escena del hero se generó con Gamma (Imagen) y vive en su CDN. Es la única
 * pieza que no sale de Pollinations porque es la más visible del sitio y la
 * calidad se nota. Si el CDN caduca, la pieza cae al respaldo de Pollinations.
 */
const HERO_GAMMA =
  'https://cdn.gamma.app/bra78pkqaxdfqh0/design-anything/LEywikAQo7BuvEEP4isvP/FFtUfL3nw7uuEl5D8iNQv.png';

const PIEZAS = [
  {
    nombre: 'escena-queretaro',
    url: HERO_GAMMA,
    respaldo:
      ESTILO +
      'Wide panoramic scene of the historic stone aqueduct of Queretaro Mexico: long row of tall ' +
      'slender arches receding across layered geometric hills, colonial cantera domes and a bell ' +
      'tower, organ pipe cactus and agave silhouettes in the foreground.' +
      CIERRE,
    genera: [1536, 864],
    ancho: 1600,
    alto: 900,
    calidad: 62,
  },
  {
    nombre: 'vineta-preescolar',
    prompt:
      ESTILO +
      'Circular vignette centered on deep indigo: playful geometric building blocks stacked into ' +
      'a tower, a paper kite with a ribbon tail, a small potted plant, simple rounded shapes, ' +
      'warm amber accent.' +
      CIERRE,
    genera: [1024, 1024],
    ancho: 760,
    alto: 760,
    calidad: 56,
  },
  {
    nombre: 'vineta-primaria',
    prompt:
      ESTILO +
      'Circular vignette centered on deep indigo: an open book with geometric pages, a stack of ' +
      'notebooks, a wooden ruler and a drafting compass, a paper airplane arcing overhead, royal ' +
      'blue accent.' +
      CIERRE,
    genera: [1024, 1024],
    ancho: 760,
    alto: 760,
    calidad: 56,
  },
  {
    nombre: 'vineta-secundaria',
    prompt:
      ESTILO +
      'Circular vignette centered on deep indigo: a microscope, a molecular structure of ' +
      'connected spheres and rods, a laboratory beaker, thin constellation lines, royal blue accent.' +
      CIERRE,
    genera: [1024, 1024],
    ancho: 760,
    alto: 760,
    calidad: 56,
  },
  {
    nombre: 'vineta-preparatoria',
    prompt:
      ESTILO +
      'Circular vignette centered on deep indigo: a printed circuit board with traces and nodes, ' +
      'a computer monitor showing abstract blocks of code, angular brackets, crimson red accent.' +
      CIERRE,
    genera: [1024, 1024],
    ancho: 760,
    alto: 760,
    calidad: 56,
  },
  {
    nombre: 'fondo-preescolar',
    prompt:
      ESTILO +
      'Scene: a small courtyard garden with geometric flowering trees, stacked toy blocks, a kite ' +
      'flying on a long ribbon, low rolling hills of Queretaro behind, warm amber accent.' +
      CIERRE,
    genera: [1280, 960],
    ancho: 1200,
    alto: 900,
    calidad: 56,
  },
  {
    nombre: 'fondo-primaria',
    prompt:
      ESTILO +
      'Scene: a stylised classroom seen as flat geometry, tall windows, rows of desks, open books ' +
      'floating, a chalkboard grid, the Queretaro aqueduct arches visible through the window.' +
      CIERRE,
    genera: [1280, 960],
    ancho: 1200,
    alto: 900,
    calidad: 56,
  },
  {
    nombre: 'fondo-secundaria',
    prompt:
      ESTILO +
      'Scene: a science laboratory as flat geometry, beakers and flasks on a bench, a molecular ' +
      'diagram on the wall, geometric plants, tall windows.' +
      CIERRE,
    genera: [1280, 960],
    ancho: 1200,
    alto: 900,
    calidad: 56,
  },
  {
    nombre: 'fondo-preparatoria',
    prompt:
      ESTILO +
      'Scene: a computer laboratory as flat geometry, rows of monitors showing abstract code ' +
      'blocks, circuit traces running across the floor and walls, crimson red accent.' +
      CIERRE,
    genera: [1280, 960],
    ancho: 1200,
    alto: 900,
    calidad: 56,
  },
  {
    nombre: 'fondo-vida',
    prompt:
      ESTILO +
      'Wide banner scene of school life as flat geometry: papel picado banners strung across a ' +
      'courtyard, a football, a guitar, geometric musical notes, a trophy, planters with agave, ' +
      'arcs of confetti.' +
      CIERRE,
    genera: [1536, 660],
    ancho: 1500,
    alto: 645,
    calidad: 56,
  },
];

/** Pollinations rechaza el user-agent por defecto de Node; hay que declarar uno de navegador. */
const CABECERAS = {
  'user-agent':
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36',
};

async function bajar(url, intentos = 4) {
  let ultimo;
  for (let i = 0; i < intentos; i++) {
    try {
      const r = await fetch(url, { headers: CABECERAS, signal: AbortSignal.timeout(240_000) });
      if (r.ok) return Buffer.from(await r.arrayBuffer());
      ultimo = new Error(`HTTP ${r.status}`);
    } catch (e) {
      ultimo = e;
    }
    // El servicio limita por ráfaga: conviene esperar más en cada reintento.
    await new Promise((r) => setTimeout(r, 8000 * (i + 1)));
  }
  throw ultimo;
}

function urlPollinations(prompt, [w, h], semilla) {
  return (
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
    `?width=${w}&height=${h}&nologo=true&seed=${semilla}`
  );
}

await mkdir(SALIDA, { recursive: true });

let total = 0;
for (const [i, pieza] of PIEZAS.entries()) {
  const semilla = 20 + i * 7;
  let origen;

  if (pieza.url) {
    try {
      origen = await bajar(pieza.url, 2);
    } catch (e) {
      console.warn(`  ${pieza.nombre}: el origen directo falló (${e.message}); uso el respaldo`);
      origen = await bajar(urlPollinations(pieza.respaldo, pieza.genera, semilla));
    }
  } else {
    origen = await bajar(urlPollinations(pieza.prompt, pieza.genera, semilla));
  }

  const salida = new URL(`${pieza.nombre}.webp`, SALIDA);
  const buffer = await sharp(origen)
    .resize(pieza.ancho, pieza.alto, { fit: 'cover', position: 'centre' })
    .webp({ quality: pieza.calidad, effort: 6 })
    .toBuffer();

  await writeFile(salida, buffer);
  total += buffer.length;
  console.log(`  ${pieza.nombre}.webp  ${(buffer.length / 1024).toFixed(1)} kB`);
}

console.log(`\n${PIEZAS.length} piezas · ${(total / 1024).toFixed(1)} kB en total`);
