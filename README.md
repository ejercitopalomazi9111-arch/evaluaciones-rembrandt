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
