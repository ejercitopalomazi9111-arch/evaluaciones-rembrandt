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

## 2. Raíz — App web real (Next.js + Supabase)
La versión multiusuario en línea (varios profesores a la vez, tiempo real, datos seguros). Reusa el diseño del demo.

**Stack:** Next.js 16 · React 19 · Tailwind v4 · Supabase (Free) · Vercel (Free). Todo en planes gratis.

**Estado actual:** scaffold + esquema de base de datos completo.
- `supabase/migrations/0001_init.sql` → pegar en Supabase → SQL Editor → Run. Crea tablas (materias, perfiles, preguntas, resultados, alumnos, config), seguridad RLS por rol, y los RPC `start_exam(code)` / `submit_exam(code, answers)` que **califican en el servidor** (las respuestas correctas nunca salen al cliente).

**Para correr la web (cuando haya proyecto Supabase):**
```bash
npm install
# crear .env.local con NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev   # http://localhost:3000
```

⚠️ **Next.js 16 tiene breaking changes** respecto a versiones anteriores; leer `node_modules/next/dist/docs/` antes de codear (ver `AGENTS.md`).

## Reglas del proyecto
- Sin pagos · sin pérdida de datos · datos seguros y accesibles.
- Diseño: paleta Instituto Rembrandt (azul `#27338f`, rojo `#d11f2d`, oro `#f4b50a`).
- Nada de `alert/confirm/prompt` nativos → modales/toasts propios.
