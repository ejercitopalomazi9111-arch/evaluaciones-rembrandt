---
name: verificar
description: Verificación obligatoria antes de dar por terminado cualquier cambio en este repo — typecheck, lint, build y el conteo de páginas (23/23) y de filas estáticas (21), más el build del export estático cuando se tocan rutas, public/ o configuración. Úsala siempre que vayas a cerrar una tarea, commitear, abrir un PR, o cuando alguien diga «ya quedó», «revisa que no rompí nada», «está listo» o «súbelo»; este proyecto NO tiene tests, así que esta es la única red de seguridad que existe.
---

# Verificar antes de cerrar

Aquí no hay framework de tests. La verificación son cuatro comandos y **un
número**: el build tiene que reportar **23/23 páginas generadas**, con **21
filas** en la tabla y **todas `○ (Static)`**. Ese número es el detector de humo
del proyecto —si baja o alguna ruta deja de ser estática, algo se volvió
dinámico sin querer y el export a GitHub Pages va a fallar en CI, no aquí—.

⚠ **Son dos números distintos y por eso se dicen los dos.** `Generating static
pages (23/23)` cuenta páginas generadas; la tabla `Route (app)` lista 21 filas.
Y ninguno de los dos es el 13 de las rutas **públicas**, que es lo que hay en
`content/seo.ts`. Confundirlos es lo que hace que alguien registre una ruta de
`(dev)` en el sitemap. El desglose está en §2 del `CLAUDE.md`.

## Secuencia

```bash
npm install        # sólo si falta node_modules (también deja los docs de Next a mano)
npm run typecheck  # tsc --noEmit
npm run lint       # eslint (flat config)
npm run build      # 23/23 páginas · 21 filas ○ (Static)
```

Corre los tres siempre, aunque el cambio parezca tonto. `typecheck` y `lint`
tardan segundos; el build, menos de un minuto.

## El segundo camino de compilación

`npm run build` **no** ejercita el modo con el que se publica en GitHub Pages.
Si tocaste rutas, `next.config.ts`, algo de `public/`, los formularios o
`lib/ruta.ts`, compila también el export:

```bash
EXPORT_ESTATICO=1 RUTA_BASE=/evaluaciones-rembrandt \
  NEXT_PUBLIC_RUTA_BASE=/evaluaciones-rembrandt npm run build   # genera out/
```

Es un camino de código distinto —Server Action sustituida por su gemelo,
imágenes sin optimizar, `trailingSlash`— y rompe por su cuenta. Un cambio que
compila en modo servidor puede reventar aquí.

## Si el conteo de rutas cambió

No lo normalices: averigua qué pasó.

- ¿Bajó de 23/23, o de 21 filas? Alguna ruta dejó de generarse. Suele ser un
  `export const dynamic` mal puesto o un archivo de metadatos (`robots.ts`,
  `sitemap.ts`, `manifest.ts`) al que se le quitó `dynamic = 'force-static'`.
- ¿Subió? Añadiste una ruta, y **lo que toca depende de dónde cayó**:
  - **Ruta pública** → hay que registrarla en `content/seo.ts`, en
    `content/navegacion.ts` y en el array `RUTAS` de
    `scripts/empaquetar-una-pagina.mjs` (ver la skill `editar-contenido`).
  - **Ruta de `(dev)`** —como `/estilo` o `/pendientes`, que son 404 en
    producción— → **no se registra en ninguno de los tres**. Meterla en
    `seo.ts` la publicaría en el sitemap, que es justo lo contrario de para lo
    que existe `(dev)`.
- ¿Alguna dejó de ser `○ (Static)`? El export estático va a abortar en CI.
  Arréglalo antes de subir.

## Cambios visuales

Los comandos no ven. Si tocaste diseño, movimiento o componentes, levanta
`npm run dev` y mira:

- **`/estilo`** — la guía viva del sistema de diseño (sólo en desarrollo).
- Las rutas afectadas, y al menos una en móvil (390 px).

Y comprueba las dos cosas que están medidas y no se negocian: que **no se anime
`opacity` sobre texto** y que **con JavaScript desactivado** el contenido se vea
completo, no a medias.

## Al reportar

Di qué corriste y qué salió, con los dos números. Si algo falló, pega la salida
en vez de resumirla: «lint pasó, build en 23/23 páginas y 21 filas estáticas»
es un reporte; «todo bien» no lo es.
