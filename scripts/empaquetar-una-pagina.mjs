/**
 * Empaqueta el sitio completo en UN archivo HTML autocontenido.
 *
 * Sirve para compartir el sitio por un enlace sin desplegar nada: se abre en
 * cualquier dispositivo, funciona sin conexión y no pide un solo recurso
 * externo. No es un rediseño: reutiliza el HTML y el CSS ya compilados, así
 * que es el mismo sitio.
 *
 * Uso:
 *   npm run build
 *   npx next start -p 3310     (en otra terminal)
 *   # o: SITIO_URL=http://localhost:3000 node scripts/empaquetar-una-pagina.mjs
 *   node scripts/empaquetar-una-pagina.mjs
 *
 * Qué hace y por qué:
 *  - Trae el HTML de las 13 rutas públicas y las apila como <section>, con un
 *    enrutador por hash de unas pocas líneas.
 *  - Incrusta CSS, tipografías (.woff2), escudo, mascota y las piezas de arte
 *    como data URI. El arte va como clases CSS para no repetirse.
 *  - Quita `srcSet` de next/image. OJO: Next lo emite con S MAYÚSCULA, así que
 *    la limpieza necesita la bandera `i`; sin ella el navegador pide
 *    /_next/image, que en un archivo suelto no existe, y las imágenes salen
 *    rotas aunque el `src` sea correcto.
 *  - Reemplaza las partes que dependen de React (menú móvil, revelado al hacer
 *    scroll) por JS plano, y hace que los formularios abran el correo con el
 *    mensaje ya redactado, porque aquí no hay servidor detrás.
 *
 * Limitación consciente: el mapa embebido de Google no puede cargar en un
 * archivo autocontenido, así que queda el enlace a Google Maps.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const BASE = process.env.SITIO_URL || 'http://localhost:3310';
const RAIZ = process.cwd();

const RUTAS = [
  ['/', 'Inicio'],
  ['/instituto', 'El instituto'],
  ['/niveles', 'Niveles'],
  ['/niveles/preescolar', 'Preescolar'],
  ['/niveles/primaria', 'Primaria'],
  ['/niveles/secundaria', 'Secundaria'],
  ['/niveles/preparatoria', 'Preparatoria'],
  ['/vida-escolar', 'Vida escolar'],
  ['/admisiones', 'Admisiones'],
  ['/admisiones/agendar-recorrido', 'Agendar recorrido'],
  ['/contacto', 'Contacto'],
  ['/aviso-de-privacidad', 'Aviso de privacidad'],
  ['/terminos-y-condiciones', 'Términos y condiciones'],
];

const traer = (r) => execSync(`curl -s "${BASE}${r}"`, { maxBuffer: 64 * 1024 * 1024 }).toString();

function entre(html, ini, fin) {
  const a = html.indexOf(ini);
  if (a < 0) return '';
  const b = html.indexOf(fin, a);
  return html.slice(a, b + fin.length);
}

/* ── CSS compilado + fuentes en data URI ─────────────────────────────────── */
const cssFile = execSync(`find ${RAIZ}/.next/static -name "*.css"`).toString().trim().split('\n')[0];
let css = readFileSync(cssFile, 'utf8');

const mediaDir = join(RAIZ, '.next/static/media');
for (const f of readdirSync(mediaDir)) {
  if (!f.endsWith('.woff2')) continue;
  const b64 = readFileSync(join(mediaDir, f)).toString('base64');
  css = css.split(`/_next/static/media/${f}`).join(`data:font/woff2;base64,${b64}`);
}

/* ── Assets: cada uno se incrusta UNA sola vez ───────────────────────────── */
/* El escudo aparece en cabecera, pie y varias secciones de 13 rutas. Si se
   sustituye por su data URI en cada sitio, el archivo se va a 22 MB. En vez de
   eso, el binario vive una vez y se asigna en tiempo de ejecución. */
const { execSync: ex } = await import('node:child_process');
function png(ruta, ancho) {
  const tmp = `/tmp/${ruta.replace(/\W/g, '_')}_${ancho}.png`;
  ex(`cd ${RAIZ} && node -e "require('sharp')('${ruta}').resize({width:${ancho}}).png({palette:true,quality:88,effort:10}).toFile('${tmp}')"`);
  return `data:image/png;base64,${readFileSync(tmp).toString('base64')}`;
}
const DATA_ESCUDO = png('public/marca/escudo.png', 260);
const DATA_MASCOTA = png('public/marca/mascota.png', 460);

const arte = {};
for (const f of readdirSync(join(RAIZ, 'public/arte'))) {
  const svg = readFileSync(join(RAIZ, 'public/arte', f), 'utf8');
  arte[f.replace('.svg', '')] = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
// El arte se declara una vez como clases CSS en lugar de estilos en línea.
css += '\n' + Object.entries(arte)
  .map(([n, d]) => `.bg-${n}{background-image:url("${d}")}`)
  .join('\n');

function inlineAssets(html) {
  let h = html;
  // OJO: Next emite el atributo como `srcSet`, con S mayúscula. Sin la bandera
  // `i` la limpieza no lo alcanza y el navegador acaba pidiendo /_next/image,
  // que en un archivo suelto no existe: las imágenes salen rotas.
  h = h.replace(/\ssrcset="[^"]*"/gi, '');
  h = h.replace(/\ssizes="[^"]*"/gi, '');
  h = h.replace(/\sloading="lazy"/gi, '');
  // marcadores ligeros; el binario se asigna después desde una sola constante
  h = h.replace(/src="\/_next\/image\?url=([^"]+)"/gi, (m, enc) => {
    const p = decodeURIComponent(enc.replace(/&amp;/g, '&'));
    if (p.includes('escudo')) return `src="${DATA_ESCUDO}"`;
    if (p.includes('mascota')) return `src="${DATA_MASCOTA}"`;
    return m;
  });
  h = h.split('src="/marca/escudo.png"').join(`src="${DATA_ESCUDO}"`);
  h = h.split('src="/marca/mascota.png"').join(`src="${DATA_MASCOTA}"`);
  // estilos en línea del arte → clase declarada una sola vez en el CSS
  h = h.replace(
    /class="([^"]*)"\s+style="background-image:url\(\/arte\/([a-z-]+)\.svg\)"/g,
    (m, cls, nombre) => `class="${cls} bg-${nombre}"`,
  );
  return h;
}

/* ── Cabecera, pie y contenido de cada ruta ──────────────────────────────── */
const inicio = traer('/');
const header = entre(inicio, '<header', '</header>');
const footer = entre(inicio, '<footer', '</footer>');
const barra = entre(inicio, '<div class="fixed inset-x-0 bottom-0', '</div></div>');

const secciones = [];
for (const [ruta, nombre] of RUTAS) {
  const html = traer(ruta);
  let main = entre(html, '<main id="contenido"', '</main>');
  main = main.replace(/^<main[^>]*>/, '').replace(/<\/main>$/, '');
  secciones.push(
    `<section class="ruta" data-ruta="${ruta}" data-nombre="${nombre}" hidden>${main}</section>`,
  );
  process.stderr.write(`  ${ruta} — ${(main.length / 1024).toFixed(0)} KB\n`);
}

/* ── Enlaces internos → rutas por hash ───────────────────────────────────── */
function aHash(html) {
  return html.replace(/href="\/([^"#]*)(#[^"]*)?"/g, (m, p, frag) => {
    const ruta = '/' + p.replace(/\/$/, '');
    if (ruta.startsWith('/_next') || ruta.startsWith('/marca') || ruta.startsWith('/arte')) return m;
    return `href="#${ruta === '/' ? '/' : ruta}${frag ?? ''}"`;
  });
}

const cuerpo = inlineAssets(aHash(`${header}\n<main id="contenido">\n${secciones.join('\n')}\n</main>\n${footer}\n${barra}`));

/* ── Script mínimo: enrutado, menú móvil, revelado y formularios ─────────── */
const script = `
<script>
(function () {
  var rutas = Array.prototype.slice.call(document.querySelectorAll('.ruta'));

  function pintar() {
    var h = (location.hash || '#/').slice(1);
    var base = h.split('#')[0] || '/';
    var encontrada = false;
    rutas.forEach(function (s) {
      var activa = s.dataset.ruta === base;
      s.hidden = !activa;
      if (activa) encontrada = true;
    });
    if (!encontrada) { rutas[0].hidden = false; base = '/'; }
    document.querySelectorAll('header a[href^="#"]').forEach(function (a) {
      var r = a.getAttribute('href').slice(1).split('#')[0];
      if (r && r !== '/' && base.indexOf(r) === 0) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    var frag = h.split('#')[1];
    if (frag) {
      var el = document.getElementById(frag);
      if (el) { el.scrollIntoView(); return; }
    }
    window.scrollTo(0, 0);
    revelar();
  }

  // El movimiento lo lleva el mismo motor que el sitio real (public/lienzo.js),
  // incrustado más abajo: lienzos animados, contadores y revelados.
  function revelar() {
    if (window.__motor) {
      window.__motor.revelados();
      window.__motor.contadores();
      window.__motor.lienzos();
    }
  }

  window.addEventListener('hashchange', pintar);
  pintar();

  // Menú móvil (el original es un componente React; aquí va en JS plano)
  var abrir = document.querySelector('header button[aria-expanded]');
  if (abrir) {
    var panel = document.createElement('div');
    panel.className = 'fixed inset-0 z-100 flex h-[100dvh] flex-col bg-tinta text-hueso lg:hidden';
    panel.hidden = true;
    var enlaces = Array.prototype.slice.call(document.querySelectorAll('header nav a[href^="#"]'))
      .map(function (a) { return '<li class="border-b border-white/10"><a class="flex min-h-14 items-center font-display text-2xl font-extrabold text-white/85" href="' + a.getAttribute('href') + '">' + a.textContent.trim() + '</a></li>'; })
      .join('');
    panel.innerHTML =
      '<div class="flex items-center justify-between border-b border-white/12 px-5 py-4">' +
      '<span class="font-mono text-xs tracking-[0.2em] text-white/60 uppercase">Menú</span>' +
      '<button type="button" class="grid size-11 place-items-center bg-white/10 text-white" data-cerrar>' +
      '<span class="sr-only">Cerrar menú</span>' +
      '<svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>' +
      '</button></div>' +
      '<nav class="flex-1 overflow-y-auto px-5 py-6"><ul class="list-none space-y-1">' + enlaces + '</ul></nav>';
    document.body.appendChild(panel);

    function cerrar() {
      panel.hidden = true;
      abrir.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      abrir.focus();
    }
    abrir.addEventListener('click', function () {
      panel.hidden = false;
      abrir.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      var p = panel.querySelector('a, button');
      if (p) p.focus();
    });
    panel.addEventListener('click', function (e) {
      if (e.target.closest('[data-cerrar]') || e.target.closest('a')) cerrar();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) cerrar();
    });
  }

  // Formularios: sin servidor detrás, se envían por correo con todo ya redactado
  document.querySelectorAll('form').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var datos = new FormData(f);
      var lineas = [];
      f.querySelectorAll('input, textarea, select').forEach(function (c) {
        if (!c.name || c.name.charAt(0) === '_' || c.name === 'sitio_web' || c.name === 'tipo') return;
        if (!c.value) return;
        var lab = f.querySelector('label[for="' + c.id + '"]');
        lineas.push((lab ? lab.textContent.replace('opcional', '').trim() : c.name) + ': ' + c.value);
      });
      if (!lineas.length) { alert('Llena al menos un campo antes de enviar.'); return; }
      var asunto = 'Solicitud desde el sitio web — ' + (datos.get('tipo') || 'contacto');
      location.href = 'mailto:contacto@irembrandt.com.mx?subject=' +
        encodeURIComponent(asunto) + '&body=' + encodeURIComponent(lineas.join('\\n'));
    });
  });

  // El mapa embebido no puede cargar aquí; queda el enlace a Google Maps
  document.querySelectorAll('button').forEach(function (b) {
    if (b.textContent.trim().toLowerCase().indexOf('cargar el mapa') === 0) b.remove();
  });
})();
</script>`;

const scriptFinal = script;

const motor = readFileSync(join(RAIZ, 'public/lienzo.js'), 'utf8');

const salida = `<title>Instituto Rembrandt de Querétaro</title>
<meta name="description" content="Preescolar, Primaria, Secundaria y Preparatoria en Col. Satélite, Querétaro. Bachillerato Tecnológico DGETI con especialidad en Programación.">
<style>${css}</style>
<div id="raiz-sitio" class="flex min-h-[100dvh] flex-col">
${cuerpo}
</div>
<script>${motor}</script>
${scriptFinal}
`;

writeFileSync('sitio-una-pagina.html', salida);
console.log('total:', (salida.length / 1024 / 1024).toFixed(2), 'MB');
