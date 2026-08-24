# Notas importantes

Lo que no cabe en el `README.md` (documentación de producto) ni en `CLAUDE.md`
(cómo tocar el código): el estado real del proyecto, lo que falta y por qué
algunas cosas están como están.

---

## 1. Lo que la escuela debe confirmar

Nada de esta lista se inventó en el sitio. Mientras el dato no exista, la
sección correspondiente **no se renderiza**. La lista vive en
`src/content/pendientes.ts` y se consulta en `/pendientes` con `npm run dev`.

### Bloquean la publicación

| Qué | Pregunta para la escuela |
|---|---|
| Escudo en vector | El actual se recortó del membrete y sólo existe a baja resolución. ¿Hay original en `.ai`, `.svg`, `.eps` o al menos 1000 px? |
| Dominio | ¿El sitio vivirá en `irembrandt.com.mx`? Hay que fijar `NEXT_PUBLIC_SITE_URL` antes de publicar. |
| Buzón de solicitudes | ¿A qué correo deben llegar los formularios y quién configura la clave de Resend? |

### Bloquean una sección

- Inscripción y colegiatura vigentes por nivel.
- Fechas de inscripción e inicio del ciclo escolar.
- Horario de entrada y salida de cada nivel.
- Horario en que Coordinación atiende a padres de familia.
- Si el 442 218 2770 tiene WhatsApp (el botón no aparece hasta confirmarlo).
- CCT e incorporación oficial de cada nivel.
- Año de fundación.
- Mapa curricular vigente de la especialidad en Programación.
- Actividades extraescolares, deportivas y culturales regulares.

### Fotografías

El sitio se entregó **sin fotos reales**: cada hueco dibuja un marcador honesto
con la indicación de encuadre. La lista completa está en `/pendientes`.

**Menores de edad:** publicar fotos de alumnas y alumnos identificables exige
consentimiento por escrito del padre, madre o tutor. Sin él, encuadres sin
rostros reconocibles.

---

## 2. Estado verificado

Comprobado corriendo los comandos, no supuesto:

- `npm run typecheck`, `npm run lint` — limpios.
- `npm run build` — **23 rutas, todas `○ (Static)`**.
- `EXPORT_ESTATICO=1 … npm run build` — genera `out/` sin errores.
- 13 rutas públicas (`RUTAS_PUBLICAS`, de donde sale el sitemap).
- 7 archivos con `'use client'`; el resto son Server Components.

Medido antes (ver `README.md`): axe-core WCAG 2.1 AA con 0 violaciones en 7
rutas × 2 anchos, sin desbordamiento horizontal y un solo `<h1>` en las 13
rutas, funcionamiento con JavaScript desactivado, 48–51 fps de scroll con la
CPU 6× ralentizada.

**Falta por medir:** Lighthouse de rendimiento con red y CPU limitadas.

---

## 3. Decisiones que parecen raras y no lo son

Si alguien las «arregla» sin leer esto, rompe algo.

- **Dos caminos de compilación.** El mismo código se publica con servidor
  (Vercel) y como export estático (Pages). No es duplicación accidental: es
  `next.config.ts` bifurcando, con gemelo de la Server Action incluido.
- **`actions/comun.ts` no lleva `'use server'`.** Es a propósito: lo importan
  los dos gemelos y uno corre en el navegador.
- **`estatico()` en cada archivo de `public/`.** El `basePath` de Next prefija
  `next/link` y `_next`, pero no `public/`. Sin eso, 404 en Pages.
- **No hay `tailwind.config.js`.** Tailwind v4: los tokens están en el bloque
  `@theme` de `src/app/globals.css`. Crear el config sería empezar un segundo
  sistema de diseño en paralelo.
- **Validación a mano, sin zod.** Doce campos, validación de servidor, 70
  líneas. La dependencia no se paga sola.
- **Nada de `backdrop-filter`.** Obliga a Chrome a recomponer en cada fotograma
  de scroll: era la causa principal de que el sitio fuera a tirones.
- **`sitio.html` es generado.** Lo reescribe CI en cada publicación; editarlo a
  mano es trabajo que se pierde en el siguiente push.

---

## 4. Restricciones que no son técnicas

- **Cero cookies y cero scripts de terceros.** No es una preferencia: es lo que
  declara el aviso de privacidad publicado. Añadir analítica, un píxel o
  cualquier script externo contradice un documento legal del sitio. Si la
  escuela quiere métricas, primero se actualiza el aviso.
- **El mapa de Google se carga sólo si el visitante lo pide.** Misma razón.
- **No se inventan datos.** Un dato plausible pero falso en un sitio escolar lo
  lee alguien que está decidiendo dónde inscribir a su hijo.
- **El arte no representa el plantel** ni imita la obra de ningún pintor. Las
  fotos reales entran únicamente por `FotoSlot`.

---

## 5. Entorno de desarrollo

- La salida a internet pasa por un **proxy con lista blanca** que no alcanza los
  CDN de imagen: `scripts/generar-arte-ia.mjs` **no corre en local**. La
  generación vive en `.github/workflows/generar-arte.yml`, que committea el
  resultado. `scripts/generar-arte.mjs` (SVG por código) sí corre en local.
- `npm install` hace falta también para leer los docs de Next 16 empaquetados en
  `node_modules/next/dist/docs/`, que son la referencia del proyecto según
  `AGENTS.md`.
- Copiar `.env.example` a `.env.local`. Ninguna variable es obligatoria.
  `SIMULAR_ENVIO=1` prueba el envío de formularios sin tocar la red.

---

## 6. Dónde está cada cosa

| Necesito… | Voy a… |
|---|---|
| entender el sitio como producto | `README.md` |
| tocar código sin romper nada | `CLAUDE.md` |
| cambiar un texto o una foto | skill `editar-contenido` |
| cerrar un cambio | skill `verificar` |
| publicar o depurar el despliegue | skill `publicar` |
| regenerar el arte | skill `arte` |
| saber qué falta | `/pendientes` en `npm run dev` |
