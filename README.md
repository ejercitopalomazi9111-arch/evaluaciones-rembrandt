# Sistema de Evaluaciones Diagnósticas — Instituto Rembrandt de Querétaro

Sistema para aplicar **exámenes diagnósticos de nuevo ingreso** (opción múltiple), calificar automáticamente y generar constancias. Pensado para que la **Coordinación** lo administre por completo.

Este repo contiene **dos partes**:

## 1. `offline-demo/` — Demo funcional (sin instalar nada)
Un solo archivo `index.html` que corre en el navegador, **sin servidor, sin cuenta, sin pagos**. Sirve para presentar el sistema a la dirección y validar el flujo completo. Guarda datos en `localStorage`.

**Cómo abrirlo:** doble clic en `offline-demo/index.html`.

**Incluye:**
- Hub de bienvenida + animación de apertura (logo + líneas Rembrandt).
- Alumno entra con **código único de un solo uso** (no se repite el examen).
- Niveles educativos (Preescolar → Preparatoria); banco de preguntas por nivel·materia (con imágenes, importar/exportar).
- **Login del personal**: Coordinación (acceso total) y profesores (solo sus materias/grados, que asigna Coordinación).
- Panel: Calificaciones (estadísticas, filtros, constancia imprimible/PDF, envío por correo, tracking impreso/enviado), Preguntas, Guías de estudio (con archivos), Alumnos (roster + códigos), Profesores, Recorridos, Configuración.
- Guías de estudio, Información general y Agendar recorrido para aspirantes.
- Paleta Rembrandt, iconos SVG, micro-interacciones (anime.js), scroll-reveal.

**Accesos demo:** Coordinación `coordinacion / coord2026` · Profesor `profe / profe123`.

> Para que el logo real salga en la animación: coloca el escudo como `offline-demo/logo.png`, o súbelo en Coordinación → Configuración → Logo.

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
