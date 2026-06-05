# Pruebas (arnés Playwright)

Suite de pruebas automatizadas (headless Chromium) para las dos ediciones. Sin esto, NO confíes en un cambio.

## Requisitos
```bash
cd tests
npm init -y
npm i playwright
npx playwright install chromium
```

## Antes de correr: ajusta las rutas
Cada archivo `.mjs` tiene al inicio una constante con la **ruta ABSOLUTA** al `index.html` correspondiente (estaba apuntando a la máquina de Carlos). Cámbiala a TU ruta local del repo, p. ej.:
```js
// run.mjs y run-exam.mjs:
const FILE = 'C:/ruta/a/tu/repo/offline-demo/index.html';
// run-lite.mjs:
const LITE = pathToFileURL('C:/ruta/a/tu/repo/offline-lite/index.html').href;
const FULL = pathToFileURL('C:/ruta/a/tu/repo/offline-demo/index.html').href;
// build-lite.mjs:
const FULL  = 'C:/ruta/.../offline-demo/index.html';
const OUTDIR= 'C:/ruta/.../offline-lite';   // o donde quieras generar la Lite
```

## Correr
```bash
node run.mjs        # PREMIUM — 47 casos (roles, calificaciones, debug, sesión, etc.)
node run-exam.mjs   # EXÁMENES parciales + anti-trampa — 8 casos
node run-lite.mjs   # LITE — 9 casos (incluye enlace de datos Lite→Completa)
```
Todo debe salir `Fallos: 0`. Las pruebas son por comportamiento (no por estilos), así que cambios de CSS no deberían romperlas.

## Regenerar la Lite
La Lite se GENERA, no se escribe a mano:
```bash
node build-lite.mjs   # extrae el CSS de la Completa + plantilla recortada → offline-lite/index.html
```
Si editas el CSS de la Completa o las plantillas dentro de `build-lite.mjs`, regenera y vuelve a correr `run-lite.mjs`.

## Nota
Los tests siembran `localStorage` por contexto y usan `reducedMotion` para ir rápido; algunos bugs **visuales** (p. ej. elementos con opacidad 0 por animación) NO se detectan con reducedMotion — revisa también con capturas reales si tocas animaciones.
