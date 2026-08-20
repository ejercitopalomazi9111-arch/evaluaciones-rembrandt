/**
 * Generador de arte original del Instituto Rembrandt.
 *
 * Piezas geométricas abstractas que extienden el sistema «Geometría tecnológica»
 * (derivado de la papelería institucional). Son SVG deterministas: misma semilla,
 * mismo resultado, así que el arte es reproducible y versionable.
 *
 * No representan el plantel ni imitan la obra de ningún pintor: son composiciones
 * abstractas construidas con las mismas reglas que el resto del sitio —cuñas
 * diagonales, retícula de plano, marcas de registro y esquinas vivas.
 *
 *   node scripts/generar-arte.mjs
 */
import { writeFileSync } from 'node:fs';

const W = 1600;
const H = 900;

const AZUL = '#1b2a8f';
const AZUL_VIVO = '#2e42c8';
const ROJO = '#d0202e';
const AMBAR = '#e8a317';
const HUESO = '#f4f3ef';

/** PRNG determinista (mulberry32) para que el arte sea reproducible. */
function rng(semilla) {
  let a = semilla >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const entre = (r, a, b) => a + r() * (b - a);
const elige = (r, xs) => xs[Math.floor(r() * xs.length)];

/** Lleva `width`/`height` explícitos: sin ellos, algunos navegadores no
 *  dimensionan un SVG usado como `background-image` con `cover`. */
function svg(hijos) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" fill="none">
${hijos.join('\n')}
</svg>
`;
}

/** Marcas de registro de plano técnico, el detalle que ata todo al sistema. */
function marcasRegistro(r, color, n = 5) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const x = entre(r, 80, W - 80);
    const y = entre(r, 80, H - 80);
    const l = 26;
    out.push(
      `<path d="M${x.toFixed(0)} ${y.toFixed(0)}h0" stroke="none"/><path d="M${(x - l).toFixed(0)} ${y.toFixed(0)}h${l * 2}M${x.toFixed(0)} ${(y - l).toFixed(0)}v${l * 2}" stroke="${color}" stroke-width="1.5" opacity=".5"/>`,
    );
  }
  return out;
}

/* ── 1. Cuñas: el gesto del membrete llevado a gran escala ───────────────── */
function cunas(semilla) {
  const r = rng(semilla);
  const p = [];
  for (let i = 0; i < 5; i++) {
    const x = W - i * entre(r, 120, 190) - 60;
    const ancho = entre(r, 60, 210);
    const sesgo = entre(r, 240, 400);
    p.push(
      `<path d="M${x.toFixed(0)} 0 L${(x + ancho).toFixed(0)} 0 L${(x + ancho - sesgo).toFixed(0)} ${H} L${(x - sesgo).toFixed(0)} ${H}Z" fill="${i % 2 ? AZUL_VIVO : AZUL}" opacity="${(0.5 - i * 0.07).toFixed(2)}"/>`,
    );
  }
  // un solo filo rojo, delgado y decidido
  const xr = entre(r, W * 0.45, W * 0.62);
  p.push(
    `<path d="M${xr.toFixed(0)} 0 L${(xr + 26).toFixed(0)} 0 L${(xr + 26 - 330).toFixed(0)} ${H} L${(xr - 330).toFixed(0)} ${H}Z" fill="${ROJO}" opacity=".9"/>`,
  );
  p.push(...marcasRegistro(r, HUESO, 4));
  return svg(p);
}

/* ── 2. Circuito: trazos ortogonales, el eje «Programación» ──────────────── */
function circuito(semilla) {
  const r = rng(semilla);
  const p = [];
  const paso = 50;
  for (let i = 0; i < 26; i++) {
    let x = W - entre(r, 0, 200);
    let y = Math.round(entre(r, 1, H / paso - 1)) * paso;
    const d = [`M${x.toFixed(0)} ${y}`];
    const tramos = Math.floor(entre(r, 3, 8));
    for (let t = 0; t < tramos; t++) {
      const largo = Math.round(entre(r, 1, 5)) * paso;
      if (t % 2 === 0) {
        x -= largo;
        d.push(`H${x.toFixed(0)}`);
      } else {
        y += (r() > 0.5 ? 1 : -1) * largo;
        d.push(`V${y}`);
      }
      if (x < 60) break;
    }
    const rojo = r() > 0.82;
    p.push(
      `<path d="${d.join('')}" stroke="${rojo ? ROJO : AZUL_VIVO}" stroke-width="${rojo ? 2.5 : 1.8}" opacity="${rojo ? 0.85 : entre(r, 0.3, 0.75).toFixed(2)}"/>`,
    );
    p.push(
      `<rect x="${(x - 5).toFixed(0)}" y="${y - 5}" width="10" height="10" fill="${rojo ? ROJO : AZUL_VIVO}" opacity=".9"/>`,
    );
  }
  return svg(p);
}

/* ── 3. Primitivas: bloques elementales, para Preescolar ─────────────────── */
/* Se reparten sobre una retícula floja con jitter en vez de al azar puro: así se
   leen como un sistema de bloques ordenado, no como ruido. */
function primitivas(semilla) {
  const r = rng(semilla);
  const p = [];
  const cols = 6;
  const filas = 3;
  const cw = W / cols;
  const ch = H / filas;
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < cols; c++) {
      if (r() > 0.78) continue; // huecos deliberados
      const s = entre(r, 46, Math.min(cw, ch) * 0.62);
      const cx = c * cw + cw / 2 + entre(r, -cw * 0.16, cw * 0.16);
      const cy = f * ch + ch / 2 + entre(r, -ch * 0.16, ch * 0.16);
      const col = elige(r, [AMBAR, AMBAR, AMBAR, AZUL_VIVO, ROJO]);
      const o = entre(r, 0.45, 0.95).toFixed(2);
      const forma = Math.floor(entre(r, 0, 4));
      if (forma === 0) {
        p.push(
          `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${(s / 2).toFixed(0)}" fill="${col}" opacity="${o}"/>`,
        );
      } else if (forma === 1) {
        p.push(
          `<path d="M${cx.toFixed(0)} ${(cy - s / 2).toFixed(0)} L${(cx + s / 2).toFixed(0)} ${(cy + s / 2).toFixed(0)} L${(cx - s / 2).toFixed(0)} ${(cy + s / 2).toFixed(0)}Z" fill="${col}" opacity="${o}"/>`,
        );
      } else if (forma === 2) {
        p.push(
          `<rect x="${(cx - s / 2).toFixed(0)}" y="${(cy - s / 2).toFixed(0)}" width="${s.toFixed(0)}" height="${s.toFixed(0)}" fill="${col}" opacity="${o}"/>`,
        );
      } else {
        p.push(
          `<path d="M${(cx - s / 2).toFixed(0)} ${(cy + s / 2).toFixed(0)} A${s.toFixed(0)} ${s.toFixed(0)} 0 0 1 ${(cx + s / 2).toFixed(0)} ${(cy - s / 2).toFixed(0)}" stroke="${col}" stroke-width="${entre(r, 10, 18).toFixed(0)}" opacity="${o}"/>`,
        );
      }
    }
  }
  return svg(p);
}

/* ── 4. Barras: ritmo modular ascendente, para Primaria ──────────────────── */
function barras(semilla) {
  const r = rng(semilla);
  const p = [];
  let x = 70;
  while (x < W - 70) {
    const ancho = Math.round(entre(r, 2, 6)) * 22;
    const alto = Math.round(entre(r, 2, 12)) * 46;
    const y = H - alto - entre(r, 0, 120);
    const rojo = r() > 0.88;
    p.push(
      `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${ancho}" height="${alto}" fill="${rojo ? ROJO : AZUL}" opacity="${rojo ? 0.9 : entre(r, 0.3, 0.75).toFixed(2)}"/>`,
    );
    x += ancho + entre(r, 12, 46);
  }
  p.push(...marcasRegistro(r, HUESO, 3));
  return svg(p);
}

/* ── 5. Celosía: estructura y nodos, para Secundaria ─────────────────────── */
function celosia(semilla) {
  const r = rng(semilla);
  const p = [];
  const nodos = [];
  for (let i = 0; i < 26; i++) nodos.push({ x: entre(r, 90, W - 90), y: entre(r, 80, H - 80) });
  for (let i = 0; i < nodos.length; i++) {
    const a = nodos[i];
    const cercanos = nodos
      .map((b, j) => ({ b, j, d: Math.hypot(a.x - b.x, a.y - b.y) }))
      .filter((n) => n.j !== i)
      .sort((m, n) => m.d - n.d)
      .slice(0, 2);
    for (const { b, d } of cercanos) {
      if (d > 420) continue;
      const rojo = r() > 0.9;
      p.push(
        `<path d="M${a.x.toFixed(0)} ${a.y.toFixed(0)} L${b.x.toFixed(0)} ${b.y.toFixed(0)}" stroke="${rojo ? ROJO : AZUL_VIVO}" stroke-width="${rojo ? 2.2 : 1.4}" opacity="${rojo ? 0.8 : 0.45}"/>`,
      );
    }
  }
  for (const n of nodos)
    p.push(
      `<rect x="${(n.x - 6).toFixed(0)}" y="${(n.y - 6).toFixed(0)}" width="12" height="12" fill="${AZUL_VIVO}" opacity=".85"/>`,
    );
  return svg(p);
}

/* ── 6. Filos: velocidad angular, para Preparatoria ──────────────────────── */
function filos(semilla) {
  const r = rng(semilla);
  const p = [];
  for (let i = 0; i < 14; i++) {
    const x = entre(r, W * 0.2, W + 200);
    const ancho = entre(r, 16, 74);
    const sesgo = entre(r, 200, 420);
    const rojo = r() > 0.42;
    p.push(
      `<path d="M${x.toFixed(0)} 0 L${(x + ancho).toFixed(0)} 0 L${(x + ancho - sesgo).toFixed(0)} ${H} L${(x - sesgo).toFixed(0)} ${H}Z" fill="${rojo ? ROJO : AZUL}" opacity="${entre(r, 0.25, 0.8).toFixed(2)}"/>`,
    );
  }
  for (let i = 0; i < 6; i++) {
    const x = entre(r, 120, W - 120);
    const y = entre(r, 90, H - 90);
    p.push(
      `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="14" height="14" fill="${HUESO}" opacity=".5"/>`,
    );
  }
  return svg(p);
}

const PIEZAS = [
  ['arte-hero', cunas, 20260817],
  ['arte-especialidad', circuito, 771],
  ['arte-preescolar', primitivas, 3151],
  ['arte-primaria', barras, 8842],
  ['arte-secundaria', celosia, 6109],
  ['arte-preparatoria', filos, 4477],
];

for (const [nombre, fn, semilla] of PIEZAS) {
  const contenido = fn(semilla);
  writeFileSync(`public/arte/${nombre}.svg`, contenido);
  console.log(`${nombre}.svg — ${(contenido.length / 1024).toFixed(1)} KB`);
}
