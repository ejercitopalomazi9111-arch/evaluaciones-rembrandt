@AGENTS.md

# Instituto Rembrandt de Querétaro — guía para asistentes

Sitio institucional (preescolar, primaria, secundaria y preparatoria con
Bachillerato Tecnológico DGETI en Programación). **Next.js 16 · React 19 ·
Tailwind CSS v4 · TypeScript.** Todas las rutas son estáticas, no hay base de
datos, no hay tests y **no hay más dependencias que `next`, `react` y
`react-dom`**.

El `README.md` es la documentación de producto —qué hace el sitio y cómo lo
opera la escuela—. Este archivo es lo que hay que saber **antes de tocar
código**.

---

## 0. Antes de escribir nada

`AGENTS.md` (importado arriba) manda: **esta versión de Next tiene cambios de
ruptura respecto a lo que recuerdas**. La referencia son los docs empaquetados
en `node_modules/next/dist/docs/` —requiere `npm install` primero—, no la
memoria. Rutas útiles:

- `01-app/02-guides/static-exports.md` — qué pierde el export estático.
- `01-app/03-api-reference/` — API real de `next/image`, `next/font`, metadatos.

Diferencias que ya mordieron en este proyecto:

| Recuerdo viejo | Realidad en Next 16 |
|---|---|
| `<Image priority>` | `priority` está deprecado → **`preload`** |
| `quality` libre en `next/image` | hay que declararlo en `images.qualities` |
| `viewport` dentro de `metadata` | es un **export separado** |
| Webpack configurable en `build` | Turbopack es el bundler por defecto: **no añadir clave `webpack()`** |
| `ImageResponse` con `next/font/google` | no lo soporta, ni `clip-path` → la tipografía va versionada en `src/app/_og/` y la geometría con bloques sólidos |

---

## 1. Comandos

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # deben salir 23 rutas, todas ○ (Static)
npm run typecheck    # tsc --noEmit
npm run lint         # eslint (flat config)
```

**Antes de dar por terminado cualquier cambio**: `npm run typecheck`,
`npm run lint` y `npm run build`. Si el build deja de reportar **23 rutas
estáticas**, algo se volvió dinámico sin querer y hay que averiguar qué.

Compilar como lo hace GitHub Pages (es otro camino de código, ver §3):

```bash
EXPORT_ESTATICO=1 RUTA_BASE=/evaluaciones-rembrandt \
  NEXT_PUBLIC_RUTA_BASE=/evaluaciones-rembrandt npm run build   # genera out/
```

Variables de entorno: copiar `.env.example` a `.env.local`. Ninguna es
obligatoria. `SIMULAR_ENVIO=1` prueba el envío de formularios sin tocar la red.

---

## 2. Mapa del repositorio

```
src/
  app/                    App Router; una carpeta por ruta
    (dev)/                /estilo y /pendientes — 404 en producción
    (legal)/              aviso de privacidad y términos
    actions/              envío de formularios (ver §4)
    _og/                  tipografía para la imagen de Open Graph
    globals.css           TODO el sistema de diseño (@theme de Tailwind v4)
    layout.tsx            fuentes, metadatos, JSON-LD, motor de movimiento
    robots.ts sitemap.ts manifest.ts opengraph-image.tsx
  components/
    layout/               cabecera, pie, navegación, PageHero
    secciones/            bloques compuestos (hero, niveles, especialidad…)
    formularios/          FormShell + campos + los tres formularios
    ui/                   primitivas.tsx, Icon, Reveal
    media/ marca/         FotoSlot, MapaSede, escudo y mascota
  content/                TEXTOS Y DATOS — aquí se edita el contenido
  lib/                    validacion.ts, esquemas.ts, ruta.ts
public/                   arte/ img/ marca/ grano.png lienzo.js
scripts/                  generadores de arte y empaquetador de una página
.github/workflows/        publicar.yml, generar-arte.yml
docs-marca/               papelería oficial de la que sale el diseño
sitio.html                GENERADO por CI — no editar a mano
```

Alias de imports: `@/*` → `./src/*`.

---

## 3. La decisión que atraviesa todo: dos formas de compilar

El mismo código se publica de dos maneras, y `next.config.ts` es donde se
bifurca:

| | Con servidor (Vercel, Node) | `EXPORT_ESTATICO=1` (GitHub Pages) |
|---|---|---|
| Formulario | Server Action → correo por Resend | gemelo que valida en el navegador y ofrece correo/WhatsApp/llamada |
| Imágenes | `next/image` optimiza | `unoptimized`, ya vienen en WebP |
| Cabeceras | las pone `headers()` | las pone GitHub |
| Rutas | limpias | `trailingSlash: true` (si no, el servidor de archivos devuelve listados) |

**Trampas que hay que respetar sí o sí:**

1. **Todo archivo de `public/` se referencia con `estatico()`** de
   `@/lib/ruta`. El `basePath` de Next prefija `next/link` y los chunks de
   `_next`, **pero no `public/`**: un `/marca/escudo.png` a pelo es un 404 en
   Pages. Lo mismo aplica a las `url()` de CSS — por eso `layout.tsx` inyecta
   `--grano` y `--escena` como estilo en línea sobre `<body>`.
2. **`robots.ts`, `sitemap.ts` y `manifest.ts` llevan `export const dynamic =
   'force-static'`.** Sin eso el export aborta.
3. **En Vercel no se definen `EXPORT_ESTATICO` ni `RUTA_BASE`**: romperían las
   rutas.
4. Cualquier cosa nueva que dependa del servidor necesita su equivalente
   estático, no un `if` que finja que funciona.

---

## 4. Formularios

Los tres (informes, recorrido, contacto) comparten **una sola acción** y no hay
base de datos:

- `actions/comun.ts` — lo compartido. **No lleva `'use server'` a propósito**:
  lo importan los dos gemelos y uno corre en el navegador. Aquí viven
  `EstadoFormulario`, el redactado del mensaje, el folio y el anti-spam.
- `actions/enviar-solicitud.ts` — Server Action; manda el correo por Resend.
- `actions/enviar-solicitud.estatico.ts` — el gemelo del export; `next.config.ts`
  lo alias-ea sobre el anterior cuando `EXPORT_ESTATICO=1`.

Reglas:

- **Las dos superficies deben exportar exactamente lo mismo.** Un archivo
  `'use server'` sólo puede exportar funciones `async`, así que constantes y
  tipos van en `comun.ts` — y el gemelo estático tampoco los reexporta, para que
  coincidan.
- **El formulario nunca pierde lo que la persona escribió.** Si falta
  configuración o falla el envío, se devuelve `sin-configurar` / `error` con
  enlaces mailto, WhatsApp y teléfono **con el mensaje ya redactado**.
- **Funcionan sin JavaScript**: la Server Action va en el atributo `action` del
  `<form>`.
- Anti-spam sin estado: honeypot fuera de pantalla (clase `.trampa`, nunca
  `display:none`) y tiempo mínimo de llenado. Si huele a bot se responde `ok`
  sin hacer nada: un error le diría al bot qué corregir.
- Validación a mano en `lib/validacion.ts` + `lib/esquemas.ts`. **No añadir zod**:
  son doce campos y la validación es de servidor.

---

## 5. Contenido: nunca se inventa un dato

**Todos los textos institucionales viven en `src/content/`. Cambiar un texto es
cambiar una cadena ahí, nunca tocar JSX.**

`institucion.ts` · `niveles.ts` · `especialidad.ts` · `admisiones.ts` ·
`vida-escolar.ts` · `legal.ts` · `seo.ts` (una entrada por ruta) ·
`navegacion.ts` · `pendientes.ts` · `types.ts`.

La regla que explica la forma de los tipos: **lo que la escuela no ha confirmado
no se inventa**. Por eso casi todo lo no verificado es opcional — si el dato
falta, la sección no se renderiza. La lista de huecos está en `pendientes.ts` y
se consulta en `/pendientes` durante el desarrollo.

Fotografías: van por `MediaSlot` y `<FotoSlot>`. Sin `src` se dibuja un marcador
honesto, **jamás una imagen que pretenda ser el plantel**. La relación de aspecto
está fijada en ambos casos, así que sustituir el marcador por la foto real no
mueve nada (CLS 0). Publicar fotos de menores identificables exige consentimiento
por escrito del padre, madre o tutor.

Añadir una ruta: crear la carpeta en `src/app/`, exportar
`metadata = seoDe('/la-ruta')` y **añadir su entrada en `content/seo.ts`** —de
ahí salen el sitemap y `RUTAS_PUBLICAS`—, más el enlace en `content/navegacion.ts`
y, si debe salir en el archivo único, en el array `RUTAS` de
`scripts/empaquetar-una-pagina.mjs`.

---

## 6. Diseño y movimiento

Sistema propio, **«Geometría tecnológica»**, derivado de la papelería oficial
(`docs-marca/`): la cuña diagonal roja y azul del pie y la doble regla de la
cabecera.

- **Todos los tokens están en `src/app/globals.css`**, en el bloque `@theme` de
  Tailwind v4. **No hay `tailwind.config.js` y no debe crearse.**
- En el membrete el nombre va en rojo y el azul es estructura: aquí **el rojo es
  la acción y el azul es el suelo**.
- Radio máximo **3 px** (el namespace entero está topado), sombras **duras
  desplazadas** —las difusas de Tailwind están anuladas a `none`—, retícula de
  plano técnico.
- Tipografías **Archivo** (variable, con eje de ancho) y **JetBrains Mono**,
  auto-hospedadas por `next/font`: el navegador nunca llama a Google.
- Contraste: `--color-rojo #d0202e` para display y gráficos;
  `--color-rojo-texto #a3141f` para texto pequeño sobre claro y
  `--color-rojo-claro #ff4d5a` sobre tinta.
- Guía viva en **`/estilo`** (sólo en desarrollo). Antes de inventar un
  componente, mirar `components/ui/primitivas.tsx`: `Container`, `Section`,
  `Eyebrow`, `Button`, `Card`, `Tag`, `Accordion`, `ReglaInstitucional`,
  `NumeroIndice`, `IndiceSeccion`, `JsonLd`.

### Reglas de movimiento que no se negocian

1. **Nunca se anima `opacity` sobre texto.** Un texto a media transición no
   cumple contraste. El titular de la portada se destapa con máscara (overflow
   oculto + desplazamiento) a opacidad plena. En elementos decorativos sí se
   puede.
2. **Sólo `transform`**, que resuelve el compositor sin recalcular layout.
3. Todo el movimiento va dentro de `@media (scripting: enabled)` y, cuando usa
   `animation-timeline`, dentro de `@supports`. Sin JS o sin soporte, el
   contenido se ve **completo y estático**, nunca a medias.
4. `prefers-reduced-motion` lo apaga todo, explícitamente.
5. **Nada de `backdrop-filter`** (obliga a Chrome a recomponer en cada
   fotograma de scroll: era la causa principal de que el sitio fuera a tirones)
   y nada de librerías de animación.

`public/lienzo.js` es el motor: un archivo sin dependencias que comparten el
sitio y la versión empaquetada. Un solo `requestAnimationFrame` para todos los
lienzos, pausa fuera de pantalla, `devicePixelRatio` topado a 1.5, ~30 fps de
presupuesto para el fondo. Gracias a él **`<Reveal>` es Server Component y no
envía JavaScript**: el motor observa todos los `.revelar` con un observer
compartido.

---

## 7. Arte e imágenes de `public/`

| Carpeta | Qué es | Cómo se regenera |
|---|---|---|
| `public/arte/` | 6 SVG de arte generativo por código, deterministas | `node scripts/generar-arte.mjs` (cambiar la semilla en `PIEZAS` para variar) |
| `public/img/` | 10 WebP de ilustración generada con IA | **no se regenera en local**: la salida a internet pasa por un proxy con lista blanca que no alcanza los CDN de imagen. Se cambia el prompt o la semilla en `scripts/generar-arte-ia.mjs` y el push dispara `.github/workflows/generar-arte.yml`, que committea el resultado |
| `public/marca/` | escudo y mascota | el escudo sólo existe a baja resolución (recortado del membrete): el sistema está diseñado para no mostrarlo grande |

Ni el arte generativo ni la ilustración representan el plantel ni imitan la obra
de ningún pintor: el vínculo con el nombre del instituto se expresa con
geometría. Las fotos reales entran únicamente por `FotoSlot`.

---

## 8. Publicación

- **GitHub Pages**, automático en cada push a `master`
  (`.github/workflows/publicar.yml`): compila con `EXPORT_ESTATICO=1` y empuja a
  la rama `gh-pages` —no usa `deploy-pages`, que exige permisos de administrador
  que el token de Actions no tiene—.
- El mismo workflow regenera **`sitio.html`**: el sitio entero (las 13 rutas
  públicas, con navegación) en un archivo autocontenido, cero peticiones
  externas. **Es un artefacto generado: no se edita a mano**; se cambia
  `scripts/empaquetar-una-pagina.mjs`.
- **Vercel** es el destino recomendado: recupera la optimización de imágenes, las
  cabeceras y el envío real de correo.

---

## 9. Convenciones de código

- **Todo en español**: nombres de archivos, funciones, variables, comentarios,
  contenido y mensajes de commit. Los componentes van en `PascalCase` español
  (`FotoSlot`, `BarraAccionMovil`, `NivelTemplate`).
- **Server Components por defecto.** Sólo siete archivos llevan `'use client'`
  (formularios, navegación y mapa); añadir uno más debe justificarse.
- **Datos `readonly`** en `content/types.ts` y objetos de contenido `as const`.
- **Cero dependencias nuevas.** Si algo se puede resolver con 70 líneas propias,
  se resuelve así (es el caso de la validación y del motor de movimiento).
- **Los comentarios explican el *porqué*, no el *qué*.** El repo está lleno de
  comentarios que documentan una trampa concreta; al cambiar el código hay que
  mantenerlos vigentes, no borrarlos.
- Commits en español con prefijo convencional: `feat:`, `fix:`, `chore:`,
  `docs:`, `ci:`.
- No hay framework de tests. La verificación es `typecheck` + `lint` + `build`,
  y para cambios visuales, mirar `/estilo` y las rutas afectadas en `npm run dev`.

---

## 10. Lo que está medido (no romper)

- **axe-core, WCAG 2.1 AA: 0 violaciones** en 7 rutas × 2 anchos (390 y 1440 px).
- **Sin desbordamiento horizontal y un solo `<h1>`** en las 13 rutas públicas, a
  320 / 390 / 768 / 1440 px.
- **Funciona con JavaScript desactivado**: nada queda oculto ni desplazado.
- Objetivos táctiles ≥ 44 px; inputs de 16 px para que iOS no haga zoom.
- Navegación móvil con trampa de foco, cierre con `Escape` e `inert` sobre el
  resto de la página.
- El LCP de la portada es **texto**, no una imagen.
- **Cero cookies y cero scripts de terceros**, tal como declara el aviso de
  privacidad. El mapa de Google se carga **sólo si el visitante lo pide**.
  Añadir analítica o cualquier script externo contradice el aviso legal
  publicado.
