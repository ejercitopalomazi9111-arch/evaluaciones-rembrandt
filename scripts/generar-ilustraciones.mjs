/**
 * Ilustraciones originales del Instituto Rembrandt.
 *
 * Escenas vectoriales generadas por código: cielo en degradado, capas de
 * silueta con perspectiva atmosférica y elementos de Querétaro (los arcos del
 * acueducto, los cerros, los magueyes). Salen en SVG, así que pesan poco y son
 * nítidas en cualquier pantalla.
 *
 * Por qué no se usó un generador de imágenes por IA: se probó, y aunque la
 * generación funciona, `cdn.gamma.app` está bloqueado por la política de red de
 * este entorno, así que el archivo resultante no se puede descargar al repo.
 *
 *   node scripts/generar-ilustraciones.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';

mkdirSync('public/ilustraciones', { recursive: true });

const AZUL = '#1b2a8f';
const AZUL_HONDO = '#0d1450';
const TINTA = '#0b0e1a';
const ROJO = '#d0202e';
const AMBAR = '#e8a317';

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
const n = (v) => Number(v).toFixed(1);

/** Mezcla dos colores hex en el espacio sRGB. */
function mezclar(a, b, t) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [r1, g1, b1] = p(a);
  const [r2, g2, b2] = p(b);
  const m = (x, y) => Math.round(x + (y - x) * t).toString(16).padStart(2, '0');
  return `#${m(r1, r2)}${m(g1, g2)}${m(b1, b2)}`;
}

/** Perfil de cerro: una suma de senos, que da una cresta creíble sin ruido caro. */
function cresta(r, W, base, altura, ondas) {
  const fases = Array.from({ length: ondas }, () => r() * Math.PI * 2);
  const frec = Array.from({ length: ondas }, (_, i) => (i + 1) * (0.6 + r() * 0.8));
  const amp = Array.from({ length: ondas }, (_, i) => altura / (i + 1.4));
  const pts = [];
  for (let x = 0; x <= W; x += 12) {
    let y = base;
    for (let i = 0; i < ondas; i++) y -= Math.sin((x / W) * Math.PI * 2 * frec[i] + fases[i]) * amp[i];
    pts.push([x, y]);
  }
  return pts;
}

function aPath(pts, H) {
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${n(p[0])} ${n(p[1])}`).join('');
  return `${d}L${n(pts[pts.length - 1][0])} ${H}L0 ${H}Z`;
}

/* ── Escena principal: Querétaro al atardecer ────────────────────────────── */
function escenaQueretaro(semilla, W = 1600, H = 900) {
  const r = rng(semilla);
  const horizonte = H * 0.74;
  const p = [];

  // cielo
  p.push(`<rect width="${W}" height="${H}" fill="url(#cielo)"/>`);

  // sol bajo, justo sobre el horizonte
  const solX = W * 0.66;
  const solY = horizonte - H * 0.075;
  p.push(`<circle cx="${n(solX)}" cy="${n(solY)}" r="${n(H * 0.1)}" fill="url(#sol)"/>`);

  // Nubes: elipses muy alargadas con desvanecido en los extremos. Las
  // versiones anteriores eran rectángulos redondeados y se leían como barras.
  for (let i = 0; i < 11; i++) {
    const y = H * 0.1 + r() * horizonte * 0.66;
    const rx = W * (0.1 + r() * 0.28);
    const ry = 3 + r() * 11;
    const x = r() * W;
    const cerca = Math.max(0, 1 - Math.abs(y - solY) / (H * 0.55));
    const col = cerca > 0.72 ? AMBAR : mezclar(AZUL, AMBAR, cerca * 0.6);
    p.push(
      `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(rx)}" ry="${n(ry)}" fill="${col}" opacity="${(0.09 + cerca * 0.3).toFixed(2)}" filter="url(#suave)"/>`,
    );
  }

  // cerros: cuatro capas, cada una más oscura y más baja
  const capas = [
    { base: horizonte + 4, alt: H * 0.1, col: mezclar(AZUL, AMBAR, 0.3), op: 0.55 },
    { base: horizonte + H * 0.05, alt: H * 0.085, col: AZUL, op: 0.85 },
    { base: horizonte + H * 0.12, alt: H * 0.07, col: AZUL_HONDO, op: 1 },
  ];
  for (const c of capas) {
    p.push(
      `<path d="${aPath(cresta(r, W, c.base, c.alt, 3), H)}" fill="${c.col}" opacity="${c.op}"/>`,
    );
  }

  // acueducto: arcos que se alejan en perspectiva
  const arcos = 13;
  const sueloAc = horizonte + H * 0.055;
  let ax = W * 0.03;
  let escala = 1;
  const ac = [];
  for (let i = 0; i < arcos; i++) {
    const anchoPilar = 17 * escala;
    const luz = 60 * escala;
    const alto = 170 * escala;
    const y = sueloAc - alto;
    const radio = luz / 2;
    ac.push(
      `<path d="M${n(ax)} ${n(sueloAc)}V${n(y + radio)}A${n(radio)} ${n(radio)} 0 0 1 ${n(ax + luz)} ${n(y + radio)}V${n(sueloAc)}h${n(anchoPilar)}V${n(y + radio * 0.6)}A${n(radio + anchoPilar)} ${n(radio + anchoPilar)} 0 0 0 ${n(ax - anchoPilar)} ${n(y + radio * 0.6)}V${n(sueloAc)}Z" fill="${TINTA}"/>`,
    );
    ax += luz + anchoPilar * 2;
    escala *= 0.9;
    if (ax > W * 1.02) break;
  }
  // el acueducto va sobre una banda de tierra
  p.push(`<path d="${aPath(cresta(r, W, sueloAc + 6, H * 0.02, 2), H)}" fill="${TINTA}"/>`);
  p.push(...ac);

  // Magueyes: se plantan SOBRE la cresta del suelo, no dentro de la masa
  // negra, para que las pencas se recorten contra el cielo. Antes quedaban
  // negro sobre negro y simplemente no se veían.
  const suelo = cresta(r, W, sueloAc + 6, H * 0.02, 2);
  const alturaEn = (x) => {
    const i = Math.min(suelo.length - 1, Math.max(0, Math.round(x / 12)));
    return suelo[i][1];
  };
  for (let i = 0; i < 11; i++) {
    const mx = W * 0.03 + r() * W * 0.94;
    const my = alturaEn(mx) + 4;
    const s2 = 38 + r() * 66;
    const pencas = [];
    for (let k = 0; k < 9; k++) {
      const a = -Math.PI * 0.96 + (k / 8) * Math.PI * 0.92;
      const largo = s2 * (0.6 + r() * 0.55);
      const lx = mx + Math.cos(a) * largo * 0.75;
      const ly = my + Math.sin(a) * largo;
      const ancho = s2 * 0.09;
      pencas.push(
        `<path d="M${n(mx)} ${n(my)}Q${n((mx + lx) / 2 + ancho)} ${n((my + ly) / 2)} ${n(lx)} ${n(ly)}Q${n((mx + lx) / 2 - ancho)} ${n((my + ly) / 2)} ${n(mx)} ${n(my)}Z" fill="${TINTA}"/>`,
      );
    }
    p.push(`<g>${pencas.join('')}</g>`);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" fill="none">
<defs>
  <linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${TINTA}"/>
    <stop offset="0.28" stop-color="${AZUL_HONDO}"/>
    <stop offset="0.5" stop-color="${AZUL}"/>
    <stop offset="0.63" stop-color="${mezclar(AZUL, ROJO, 0.6)}"/>
    <stop offset="0.72" stop-color="${AMBAR}"/>
  </linearGradient>
  <filter id="suave" x="-30%" y="-300%" width="160%" height="700%">
    <feGaussianBlur stdDeviation="7"/>
  </filter>
  <radialGradient id="sol">
    <stop offset="0" stop-color="#ffdd8a"/>
    <stop offset="0.5" stop-color="${AMBAR}"/>
    <stop offset="1" stop-color="${AMBAR}" stop-opacity="0"/>
  </radialGradient>
</defs>
${p.join('\n')}
</svg>
`;
}

/* ── Viñeta circular por nivel ───────────────────────────────────────────── */
/* Todo va dentro de un clipPath circular: sin él, las capas de cerro se salen
   hasta los bordes del lienzo cuadrado y la viñeta deja de leerse redonda. */
function vineta(semilla, acento, motivo, S = 400) {
  const r = rng(semilla);
  const cx = S / 2;
  const fondo = [];

  fondo.push(`<rect width="${S}" height="${S}" fill="url(#f${semilla})"/>`);

  // paisaje al fondo, discreto: es telón, no protagonista
  const horiz = S * 0.72;
  fondo.push(
    `<circle cx="${n(S * 0.83)}" cy="${n(horiz - S * 0.28)}" r="${n(S * 0.07)}" fill="${AMBAR}" opacity=".8"/>`,
  );
  fondo.push(
    `<path d="${aPath(cresta(r, S, horiz, S * 0.075, 3), S)}" fill="${AZUL_HONDO}" opacity=".92"/>`,
  );
  fondo.push(`<path d="${aPath(cresta(r, S, horiz + S * 0.09, S * 0.05, 2), S)}" fill="${TINTA}"/>`);

  // motivo centrado y grande, por delante del paisaje
  const g = { x: S * 0.5, y: S * 0.42, s: S * 0.2 };
  const m = [];
  if (motivo === 'bloques') {
    m.push(
      `<rect x="${n(g.x - g.s * 1.05)}" y="${n(g.y - g.s * 0.1)}" width="${n(g.s * 0.8)}" height="${n(g.s * 0.8)}" fill="${AMBAR}"/>`,
      `<circle cx="${n(g.x + g.s * 0.62)}" cy="${n(g.y + g.s * 0.32)}" r="${n(g.s * 0.42)}" fill="${ROJO}"/>`,
      `<path d="M${n(g.x + g.s * 0.05)} ${n(g.y - g.s * 0.95)}L${n(g.x + g.s * 0.72)} ${n(g.y - g.s * 0.12)}L${n(g.x - g.s * 0.62)} ${n(g.y - g.s * 0.12)}Z" fill="#f4f3ef"/>`,
    );
  } else if (motivo === 'libro') {
    m.push(
      `<path d="M${n(g.x - g.s * 1.02)} ${n(g.y - g.s * 0.66)}h${n(g.s * 0.96)}v${n(g.s * 1.32)}h${n(-g.s * 0.96)}Z" fill="#f4f3ef"/>`,
      `<path d="M${n(g.x + g.s * 0.06)} ${n(g.y - g.s * 0.66)}h${n(g.s * 0.96)}v${n(g.s * 1.32)}h${n(-g.s * 0.96)}Z" fill="${acento}"/>`,
      `<path d="M${n(g.x)} ${n(g.y - g.s * 0.82)}v${n(g.s * 1.64)}" stroke="${ROJO}" stroke-width="${n(g.s * 0.13)}"/>`,
    );
  } else if (motivo === 'atomo') {
    m.push(
      `<ellipse cx="${n(g.x)}" cy="${n(g.y)}" rx="${n(g.s * 1.05)}" ry="${n(g.s * 0.42)}" stroke="#f4f3ef" stroke-width="${n(g.s * 0.11)}"/>`,
      `<ellipse cx="${n(g.x)}" cy="${n(g.y)}" rx="${n(g.s * 1.05)}" ry="${n(g.s * 0.42)}" stroke="${acento}" stroke-width="${n(g.s * 0.11)}" transform="rotate(60 ${n(g.x)} ${n(g.y)})"/>`,
      `<ellipse cx="${n(g.x)}" cy="${n(g.y)}" rx="${n(g.s * 1.05)}" ry="${n(g.s * 0.42)}" stroke="${ROJO}" stroke-width="${n(g.s * 0.11)}" transform="rotate(-60 ${n(g.x)} ${n(g.y)})"/>`,
      `<circle cx="${n(g.x)}" cy="${n(g.y)}" r="${n(g.s * 0.2)}" fill="${AMBAR}"/>`,
    );
  } else {
    m.push(
      `<path d="M${n(g.x - g.s * 0.3)} ${n(g.y - g.s * 0.9)}L${n(g.x - g.s * 1.1)} ${n(g.y)}L${n(g.x - g.s * 0.3)} ${n(g.y + g.s * 0.9)}" stroke="#f4f3ef" stroke-width="${n(g.s * 0.19)}" stroke-linecap="square"/>`,
      `<path d="M${n(g.x + g.s * 0.3)} ${n(g.y - g.s * 0.9)}L${n(g.x + g.s * 1.1)} ${n(g.y)}L${n(g.x + g.s * 0.3)} ${n(g.y + g.s * 0.9)}" stroke="${ROJO}" stroke-width="${n(g.s * 0.19)}" stroke-linecap="square"/>`,
      `<path d="M${n(g.x + g.s * 0.12)} ${n(g.y - g.s * 1)}L${n(g.x - g.s * 0.12)} ${n(g.y + g.s * 1)}" stroke="${AMBAR}" stroke-width="${n(g.s * 0.15)}"/>`,
    );
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}" fill="none">
<defs>
  <linearGradient id="f${semilla}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${AZUL}"/><stop offset="1" stop-color="${TINTA}"/>
  </linearGradient>
  <clipPath id="c${semilla}"><circle cx="${cx}" cy="${cx}" r="${cx}"/></clipPath>
</defs>
<g clip-path="url(#c${semilla})">
${fondo.join('\n')}
</g>
<g clip-path="url(#c${semilla})">
${m.join('\n')}
</g>
</svg>
`;
}

const SALIDAS = [
  ['escena-queretaro', escenaQueretaro(90210)],
  ['vineta-preescolar', vineta(11, AMBAR, 'bloques')],
  ['vineta-primaria', vineta(22, '#4d63e0', 'libro')],
  ['vineta-secundaria', vineta(33, '#4d63e0', 'atomo')],
  ['vineta-preparatoria', vineta(44, ROJO, 'codigo')],
];

for (const [nombre, svg] of SALIDAS) {
  writeFileSync(`public/ilustraciones/${nombre}.svg`, svg);
  console.log(`${nombre}.svg — ${(svg.length / 1024).toFixed(1)} KB`);
}
