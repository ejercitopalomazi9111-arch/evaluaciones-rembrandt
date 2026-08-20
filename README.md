# Instituto Rembrandt de Querétaro — sitio web

Sitio institucional del **Instituto Rembrandt de Querétaro**: preescolar, primaria, secundaria y
preparatoria (Bachillerato Tecnológico DGETI con especialidad en Programación).

**Next.js 16 · React 19 · Tailwind CSS v4 · TypeScript.** Todas las rutas se generan estáticas,
no hay base de datos y no se carga ningún script de terceros.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # las 23 rutas deben salir ○ (Static)
npm run typecheck
npm run lint
```

---

## Publicar el sitio (link público)

El sitio se publica solo en **GitHub Pages** cada vez que algo llega a `master`:

    https://ejercitopalomazi9111-arch.github.io/evaluaciones-rembrandt/

Lo hace `.github/workflows/publicar.yml`. No hay que tocar nada en Settings: el
workflow da de alta Pages la primera vez. Si se renombra el repositorio, la URL
cambia con él y el propio workflow se ajusta, porque lee el prefijo de la
configuración de Pages en vez de tenerlo escrito.

### Qué cambia en Pages respecto a un servidor propio

Pages sólo sirve archivos, así que el build usa `EXPORT_ESTATICO=1` y Next 16
deja fuera tres cosas (documentado en `02-guides/static-exports.md`):

| | Con servidor (Vercel, Node) | En GitHub Pages |
|---|---|---|
| Formulario | manda correo por Resend | valida y ofrece correo, WhatsApp o llamada, con el mensaje ya redactado |
| Imágenes | `next/image` optimiza al vuelo | se sirven tal cual, ya en WebP y al tamaño de uso |
| Cabeceras de seguridad | las pone Next | las pone GitHub (todo por HTTPS) |

Nada de eso rompe el sitio: **el formulario nunca pierde lo que la persona
escribió**, sólo cambia por dónde sale.

### Si quieren dominio propio y envío automático de correo

Con Vercel el sitio corre con servidor y recupera las tres filas de la
izquierda, sin cambiar una línea de código:

1. vercel.com → *Add New… → Project* → *Import Git Repository* → este repo.
2. Variables: `NEXT_PUBLIC_SITE_URL` con el dominio final y, para el correo
   automático, `RESEND_API_KEY`, `CORREO_DESTINO` y `CORREO_REMITENTE`.

## Cómo edita el contenido la escuela

**Nunca hay que tocar JSX.** Todos los textos institucionales viven en `src/content/`:

| Archivo | Qué contiene |
|---|---|
| `institucion.ts` | Nombre, lema, valores, misión, visión, sedes y datos de contacto |
| `niveles.ts` | Los cuatro niveles: descripciones, datos clave, ejes y materias |
| `especialidad.ts` | La especialidad en Programación de la preparatoria |
| `admisiones.ts` | Pasos del proceso, requisitos y preguntas frecuentes |
| `vida-escolar.ts` | Ejes de vida escolar y galería |
| `legal.ts` | Aviso de privacidad y términos |
| `seo.ts` | Título y descripción de cada ruta |
| `pendientes.ts` | Datos y fotos que faltan por confirmar |

Cambiar un texto es cambiar una cadena en uno de esos archivos.

### Cómo se publica una fotografía

El sitio se entregó **sin fotos reales**: donde va una foto hay un marcador honesto, nunca una
imagen inventada del plantel. Para publicar una foto:

1. Guarda el archivo en `public/fotos/` con el nombre que indica el hueco — por ejemplo
   `preparatoria-hero.jpg`.
2. Añade `src` a ese hueco en `src/content/niveles.ts` o `vida-escolar.ts`:

```ts
hero: {
  id: 'preparatoria-hero',
  alt: 'Estudiantes de la preparatoria en el laboratorio de cómputo',
  ratio: '16/9',
  nota: '…',
  src: '/fotos/preparatoria-hero.jpg',   // ← esta línea
  prioridad: true,
}
```

La relación de aspecto está fijada de antemano, así que **sustituir el marcador por la foto no
mueve nada de la página**.

> **Menores de edad.** Publica fotografías de alumnas y alumnos identificables únicamente con el
> consentimiento por escrito de su padre, madre o tutor. Cuando no lo tengas, usa encuadres sin
> rostros reconocibles.

### Qué falta por confirmar

Corre `npm run dev` y abre **`/pendientes`**: ahí está la lista exacta de datos que la escuela
debe proporcionar (colegiaturas, horarios, CCT, WhatsApp, mapa curricular DGETI, año de fundación)
y de las fotografías por tomar, con la indicación de encuadre de cada una.

Nada de esa lista se inventó en el sitio: mientras el dato no exista, la sección no se renderiza.

---

## Formularios

Los tres formularios (informes, recorrido y contacto) usan una sola Server Action,
`src/app/actions/enviar-solicitud.ts`, sin base de datos.

- **Con `RESEND_API_KEY`** configurada, la solicitud llega por correo a `CORREO_DESTINO`.
- **Sin configurar, o si el envío falla**, el formulario ofrece enviar por correo, por WhatsApp o
  llamar — con el mensaje **ya redactado**, así que la persona no pierde lo que escribió.
- Funcionan **con JavaScript desactivado** (Server Action vía el atributo `action` del `<form>`).
- Anti-spam sin estado: honeypot fuera de pantalla y tiempo mínimo de llenado.

Copia `.env.example` a `.env.local` y rellena lo que aplique. En desarrollo, `SIMULAR_ENVIO=1`
prueba el camino de éxito sin tocar la red.

---

## Diseño

Sistema propio: **«Geometría tecnológica»**, derivado de la papelería oficial del instituto
(`docs-marca/`) — la cuña diagonal roja y azul del pie y la doble regla de la cabecera.

- Tipografías **Archivo** (variable, con eje de ancho) y **JetBrains Mono**, auto-hospedadas por
  `next/font`: el navegador nunca llama a Google.
- Esquinas vivas (radio máximo 3 px), sombras duras desplazadas, retícula de plano técnico.
- En el membrete el nombre del instituto va en rojo y el azul es estructura: por eso aquí
  **el rojo es la acción y el azul es el suelo**.
- Movimiento con CSS + `IntersectionObserver`, sin librerías, respetando `prefers-reduced-motion`.

Los tokens están en `src/app/globals.css` (bloque `@theme` de Tailwind v4, sin
`tailwind.config.js`). La guía viva está en **`/estilo`** en desarrollo.

### Movimiento

`public/lienzo.js` es el motor de movimiento: un archivo sin dependencias que el sitio y la
versión empaquetada comparten. Anima en `<canvas>` las cuñas del membrete en la portada y los
trazos con pulsos de la sección de Programación, y además maneja los contadores y los revelados
al hacer scroll.

Decisiones de rendimiento, todas deliberadas:

- **Un solo `requestAnimationFrame`** para todos los lienzos de la página, no uno por elemento.
- Cada lienzo **se pausa al salir de pantalla** (`IntersectionObserver`).
- `devicePixelRatio` **tapado a 1.5**: en pantallas 3× el coste se triplica sin verse mejor.
- Presupuesto de **~30 fps** para el fondo: en algo que deriva lento el ojo no distingue más, y
  deja medio hilo libre para el scroll.
- Con `prefers-reduced-motion` se dibuja **un fotograma** y el bucle no arranca.
- **El `Reveal` de React ya no lleva JavaScript propio**: el motor observa todos los `.revelar`
  con un observer compartido, así que es Server Component y no envía nada al navegador.

Dos reglas de la coreografía que no se negocian:

1. **Nunca se anima `opacity` sobre texto.** Un texto a media transición no cumple contraste y una
   auditoría lo marca con razón. El titular de la portada se destapa con máscara (`overflow`
   oculto + desplazamiento), así que va siempre a opacidad plena.
2. **Sólo `transform`**, que resuelve el compositor sin recalcular layout.

También se quitó el `backdrop-filter` de la cabecera pegajosa: obliga a Chrome a recomponer en
cada fotograma de scroll y era la causa principal de que el sitio se sintiera lento.

Medido en Chromium con la CPU **6× ralentizada**: 48–51 fps de media durante scroll continuo y
prácticamente ningún fotograma por encima de 50 ms.

### Arte generativo

Las seis piezas de `public/arte/` son **arte original generado por código**, no imágenes de banco
ni de un modelo de difusión. Las produce `scripts/generar-arte.mjs`, que dibuja composiciones
geométricas abstractas con las mismas reglas que el resto del sitio: cuñas diagonales, trazos
ortogonales, retícula de plano y marcas de registro, en la paleta institucional.

```bash
node scripts/generar-arte.mjs   # regenera las 6 piezas en public/arte/
```

Usa un PRNG con semilla fija, así que **el resultado es determinista**: misma semilla, mismo
dibujo. Para explorar variantes, cambia la semilla de la pieza en el array `PIEZAS` al final del
script y vuelve a correrlo.

| Pieza | Dónde aparece |
|---|---|
| `arte-hero` | telón del hero de la portada |
| `arte-especialidad` | sección del Bachillerato en Programación |
| `arte-preescolar` · `-primaria` · `-secundaria` · `-preparatoria` | cabecera de cada nivel |

Son SVG: pesan ~16 KB **entre las seis**, son nítidos en cualquier pantalla y no producen ningún
salto de layout. Van siempre `aria-hidden`, por debajo del texto y ocultas en móvil donde el
recorte no favorece, de modo que **la página se sostiene igual si no cargan**.

Deliberadamente no representan el plantel ni imitan la obra de ningún pintor: las fotos reales
entran por `FotoSlot`, y el vínculo con el nombre del instituto se expresa con geometría, no
copiando cuadros.

### Ilustración generada con IA

Las diez piezas de `public/img/` (la escena del hero, las cuatro viñetas de nivel, los cuatro
fondos de nivel y la banda de vida escolar) están generadas con un modelo de imagen a partir de
encargos escritos para este proyecto, sobre la paleta del escudo. La receta vive en
`scripts/generar-arte-ia.mjs`: prompts, semillas fijas y post-proceso a WebP.

**No se regeneran en local.** La salida a internet del entorno de desarrollo pasa por un proxy con
lista blanca que no alcanza los CDN de imagen, así que la generación corre en GitHub Actions
(`.github/workflows/generar-arte.yml`) y el propio workflow committea el resultado. Para pedir otra
toma, cambia la semilla o el prompt de la pieza en el script y haz push: el push de ese archivo
dispara el workflow.

Las semillas están fijas a propósito, así que dos ejecuciones dan el mismo resultado y el commit es
reproducible.

Igual que el arte generativo, **no representan el plantel**: son ilustración, no fotografía. Las
fotos reales siguen entrando por `FotoSlot`.

### Marca

`public/marca/escudo.png` se recortó del membrete oficial y sólo existe a baja resolución, por lo
que el sistema está diseñado para no mostrarlo grande. **Conviene pedirle a la escuela el escudo en
vector.**

---

## Accesibilidad y rendimiento

Lo que está **medido**, no supuesto:

- **axe-core, WCAG 2.1 AA: 0 violaciones** en 7 rutas × 2 anchos (390 px y 1440 px).
- **Sin desbordamiento horizontal y un solo `<h1>`** en las 13 rutas públicas, verificado a
  **320 / 390 / 768 / 1440 px**.
- **Funciona con JavaScript desactivado**: ningún elemento queda oculto ni desplazado, y los
  formularios conservan su `action`.

Decisiones de diseño detrás de eso:

- El revelado al hacer scroll anima **sólo `transform`**, nunca `opacity`, y va dentro de
  `@media (scripting: enabled)`. Un texto a medio desvanecer no cumple contraste, y sin JS el
  contenido debe verse igual.
- El rojo del escudo `#d0202e` sirve para display grande y elementos gráficos; el texto pequeño
  usa `--color-rojo-texto #a3141f` sobre claro y `--color-rojo-claro #ff4d5a` sobre tinta.
- Objetivos táctiles ≥ 44 px; inputs de 16 px para que iOS no haga zoom al enfocar.
- Navegación móvil con trampa de foco, cierre con `Escape` e `inert` sobre el resto de la página.
- El LCP de la portada es **texto**, no una imagen.
- El mapa de Google se carga **sólo si el visitante lo pide**.
- Cero cookies y cero scripts de terceros, tal como declara el aviso de privacidad.

Falta por medir: Lighthouse de rendimiento con red y CPU limitadas.

---

## Notas de Next.js 16

Este proyecto sigue `AGENTS.md`: la referencia son los docs empaquetados en
`node_modules/next/dist/docs/`, no la memoria. Puntos que difieren de versiones anteriores:

- `priority` está **deprecado** en `next/image` → se usa **`preload`**.
- `images.qualities` es **obligatorio** si se usa un `quality` distinto del default.
- `viewport` es un export **separado** de `metadata`.
- Turbopack es el bundler por defecto también en `build`: no añadir una clave `webpack()`.
- `ImageResponse` (OG) no puede usar `next/font/google` ni soporta `clip-path`; por eso la
  tipografía va versionada en `src/app/_og/` y la geometría se hace con bloques sólidos.
