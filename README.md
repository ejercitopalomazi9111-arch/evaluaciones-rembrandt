# Sistema de Evaluaciones Diagnósticas — Instituto Rembrandt de Querétaro

Sistema para aplicar **exámenes diagnósticos de nuevo ingreso** (opción múltiple), calificar automáticamente y generar constancias. Pensado para que la **Coordinación** lo administre por completo.

Este repo contiene **dos partes**:

## 1. `offline-demo/` — Examen de Admisión a Bachillerato (sin instalar nada)
Un solo archivo `index.html` que corre en el navegador, **sin servidor, sin cuenta, sin pagos**. Hace **exactamente dos cosas**: que el aspirante presente su examen de admisión y que la Coordinación lo revise. Guarda datos en `localStorage`.

**Cómo abrirlo:** doble clic en `offline-demo/index.html`.

**Flujo del aspirante:**
1. Coordinación le entrega un **código de un solo uso**.
2. Entra en "Presentar mi examen", escribe el código y contesta el **examen de admisión completo** (5 materias: Matemáticas, Lectura y Redacción, Física, Química y Biología) con **preguntas reales de nivel ingreso a bachillerato**.
3. Al terminar ve una pantalla de agradecimiento. El código deja de funcionar (no se repite el examen).

**Panel de Coordinación** (`coordinacion / coord2026`):
- **Resultados**: estadísticas (presentados, promedio, % suficientes, códigos sin usar), filtros, **constancia imprimible/PDF** por aspirante, envío por correo y **reporte general** (incluye promedio de aciertos por materia). Marca si un aspirante salió de la ventana durante el examen.
- **Aspirantes y códigos**: registra aspirantes (manual o importando Excel/CSV), genera y copia sus códigos, exporta la lista.
- **Banco de preguntas**: edita, agrega o elimina preguntas por materia, marca la respuesta correcta, importa/exporta en JSON.
- **Configuración**: nombre/logo del instituto, calificación mínima, escala, tiempo límite, barajar, **bloqueo anti-trampa** al cambiar de ventana, firmante de la constancia, contacto y contraseña de acceso. Incluye "borrar datos" para iniciar un nuevo periodo.

Paleta Rembrandt, iconos SVG, micro-interacciones (anime.js), accesibilidad (foco visible, contraste AA).

> Para que el logo real salga en la animación de apertura: súbelo en Coordinación → Configuración → Subir logo.

## 2. Raíz — App web con base de datos (Next.js + Supabase)
La versión **multi-dispositivo en línea**: los aspirantes presentan el examen desde cualquier equipo y la Coordinación ve **todos** los resultados en un mismo lugar (no dependen del navegador donde se contestó). Mismo enfoque que el demo: examen de admisión a Bachillerato (5 materias, 50 preguntas reales) + panel de Coordinación.

**Stack:** Next.js 16 · React 19 · Supabase (Free) · Vercel (Free). Todo en planes gratis.

**Cómo funciona (seguro):**
- `supabase/migrations/0001_init.sql` → pégalo en Supabase → SQL Editor → Run. Crea las tablas (`subjects`, `questions`, `results`, `students`, `config`, `profiles`), la seguridad **RLS** (solo Coordinación lee resultados/aspirantes; las preguntas con su respuesta correcta nunca son visibles al público), siembra **5 materias + 50 preguntas reales** y crea los RPC `start_exam(code)` / `submit_exam(code, answers)` que **califican en el servidor** — la respuesta correcta nunca sale al cliente.
- Rutas de la app: `/` (inicio) · `/examen` (aspirante: código → examen → enviado) · `/coordinacion` (login + Resultados/constancia, Aspirantes y códigos, Banco de preguntas, Configuración).

**Puesta en marcha:**
1. Crea un proyecto gratis en [supabase.com](https://supabase.com) y corre el SQL de `supabase/migrations/0001_init.sql`.
2. Crea el usuario de Coordinación en Supabase → **Authentication → Users → Add user** (correo + contraseña). El trigger lo deja como `coordinator`.
3. Copia `.env.example` a `.env.local` y pon tu `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase → Project Settings → API).
4. Local: `npm install && npm run dev` → http://localhost:3000. Producción: importa el repo en **Vercel** y define ahí las mismas 2 variables.

⚠️ **Next.js 16 tiene breaking changes** respecto a versiones anteriores; leer `node_modules/next/dist/docs/` antes de codear (ver `AGENTS.md`).

## Reglas del proyecto
- Sin pagos · sin pérdida de datos · datos seguros y accesibles.
- Diseño: paleta Instituto Rembrandt (azul `#27338f`, rojo `#d11f2d`, oro `#f4b50a`).
- Nada de `alert/confirm/prompt` nativos → modales/toasts propios.
