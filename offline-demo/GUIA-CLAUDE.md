# GUÍA PARA CLAUDE — Edición COMPLETA (Premium)
**Archivo:** `offline-demo/index.html` · **Proyecto:** Sistema de Evaluaciones del Instituto Rembrandt de Querétaro.

> Lee esto completo antes de tocar nada. Es una app de **un solo archivo HTML** (HTML+CSS+JS inline) que corre **sin servidor**: se abre con doble clic (`file://`) o se sube a un hosting estático. Usa `localStorage` como base de datos. No hay build step.

---

## 1. Qué es y cómo se usa
Plataforma escolar offline para:
- **Examen Diagnóstico** de nuevo ingreso (5 materias × 20 preguntas de opción múltiple, calificación automática + constancia PDF).
- **Exámenes parciales** tipo Google Forms (opción múltiple, casillas, V/F, respuesta corta, párrafo) con PIN, ventana de disponibilidad, calificación automática y **revisión manual** de respuestas abiertas.
- Gestión de **alumnos** (códigos únicos), **profesores** (permisos granulares), **guías**, **recorridos**, **reportes**, **constancias** y **configuración** institucional.

Existe una **Edición Lite** (`offline-lite/index.html`) que comparte las MISMAS claves de `localStorage` (ver §9). NO rompas esa compatibilidad.

## 2. Cómo abrir / probar manualmente
- Doble clic en `index.html` (Chrome/Edge). Requiere en la misma carpeta: `anime.min.js`, `xlsx.full.min.js`, opcional `mascota.png` y `logo.png`.
- **Accesos demo** (pantalla "Personal"):
  - Coordinación: `coordinacion` / `coord2026` (acceso total)
  - Dirección: `direccion` / `direccion2026` (solo Calificaciones + Reportes)
  - Profesor: `profe` / `profe123`
  - Debug (es de Carlos, NO compartir): `debug` / `debug2026`
- El alumno entra desde "Presentar evaluación" con un **código** (diagnóstico) o un **PIN** (parcial).

## 3. Estructura del archivo (un solo `index.html`)
1. `<head><style>` — **todo el CSS**. Hay una sección "REFINAMIENTO DE DISEÑO v2" (contraste WCAG AA, foco visible, numerales tabulares, fondo calmado) y estilos de la pantalla de bloqueo `.lock-ov`. Paleta institucional en `:root`: azul `#27338f`, rojo `#d11f2d`, oro `#f4b50a`.
2. `<body>` — `bgfx` (fondo), `#splash`, `#constancia` (plantilla de constancia imprimible), y `.wrap#app` con el `header.top` y todas las **vistas** (`<section id="vX">`).
3. 3 `<script>`: `anime.min.js` (animaciones), `xlsx.full.min.js` (Excel), y el **script inline** con toda la lógica.

### Vistas (constante `VIEWS`, se muestran con `show(id)`)
`vHub` (inicio) · `vCode` (entrada por código/PIN) · `vLevel`/`vStudent`/`vSubjects` (flujo directo, casi sin uso) · `vGuides`/`vInfo`/`vTour` (alumno) · `vLogin` · `vQuiz` (examen diagnóstico) · `vExam` (examen parcial) · `vThanks` · `vAdmin` (panel del personal).

### Paneles del admin (`#vAdmin`, se alternan con `adminTab(t)`)
`tabCal` Calificaciones · `tabPreg` editor del banco diagnóstico · `tabExamenes` constructor de exámenes · `tabRevision` revisión manual · `tabGuia` · `tabAlumnos` · `tabProfes` · `tabTours` · `tabReportes` · `tabCfg` (acordeones) · `tabDebug`.

## 4. Modelo de datos (claves de `localStorage`)
| Clave | Variable | Contenido |
|---|---|---|
| `ev_cfg` | `CFG` | institución, escala, pass, grupos[], ciclos[], activeCiclo, semestres[], coordPass, **features{granularPerms,examenes,openQuestions}** |
| `ev_bank` | `BANK` | `BANK[nivel][materia] = [{q,opts[4],correct,img}]` (banco del DIAGNÓSTICO) |
| `ev_guide` | `GUIDES` | guías por nivel/materia |
| `ev_res` | `RES` | resultados (diagnóstico Y parciales). Ver shape abajo |
| `ev_tour` | `TOURS` | solicitudes de recorrido |
| `ev_users` | `USERS` | usuarios del personal |
| `ev_students` | `STUDENTS` | roster + códigos de alumno |
| `ev_exams` | `EXAMS` | exámenes parciales |
| `ev_session` | — | sesión persistente {user,tab} para recordar dónde estabas al recargar |

**Resultado (`RES[i]`):** `{id,folio,date,ts,name,group,ciclo,level,mode,subject,hits,total,pct,grade,level_perf,printed,emailed,...}`
- Diagnóstico: `mode:'__all__'`, `per:{materia:{hits,total}}`.
- Parcial: `mode:'parcial'`, `type:'parcial'`, `examId, examTitle, parcial, semestre, subjectId, items:[{type,q,points,earned,correct,manual,given,expected}], pendingCount`.
- `interruptions:[{ts,justification}]` ← anti-trampa (ver §7).
- `_test:true` ← dato de prueba generado por Debug.

**Usuario (`USERS[i]`):** `{user,pass,name,role,assign:[{level,subject}],caps:{preguntas,calif,alumnos,guias}}`. Roles: `coordinator|direccion|teacher|debug`.

**Alumno (`STUDENTS[i]`):** `{code,name,group,level,mode,origin,originGroup,tEmail,sEmail,status:'pending'|'completed',resultId,ciclo}`. `code` es de 1 solo uso.

**Examen (`EXAMS[i]`):** `{id,pin,title,level,subject,owner,group,parcial,semestre,ciclo,from,to,timeMin,shuffle,showGrade,desc,active,questions:[],created}`. Pregunta: `{type:'mc'|'check'|'tf'|'short'|'para', q, required, points, opts?, correct?, answer?, precision?, manual?}`.

## 5. Roles y permisos
- **Coordinación / Debug** (`isCoordLevel()`): acceso total. Debug además: pestaña 🐞 con datos de prueba, respaldo total JSON, vaciar para producción, y botón ✏️ para **editar calificaciones** a mano.
- **Dirección**: solo Calificaciones + Reportes (lectura).
- **Profesor** (`teacher`): por defecto **solo sus exámenes (Exámenes) + Revisión** de las respuestas abiertas de SUS exámenes. Permisos extra opcionales (cap, se dan al crear el perfil o con toggles en vivo en Profesores): `calif` (ver calificaciones), `alumnos` (base de datos), `guias`, `preguntas` (editar el banco del diagnóstico). `enterPanel()` arma las pestañas según rol + caps + features.

## 6. Funciones clave (mapa rápido)
- **Navegación/sesión:** `show`, `goHub`, `enterPanel`, `adminTab`, `renderTabs`, `saveSession`/`restoreSession`, `setupTabWheel` (scroll con rueda).
- **Helpers:** `toast`, `uiModal`/`uiAlert`/`uiConfirm` (modales propios, NUNCA usar alert/confirm nativos), `esc` (escapa HTML), `jss` (escapa para `onclick="f('...')"`, OBLIGATORIO con datos de usuario), `nivel(pct)`, `feat(k)` (¿función activa?).
- **Alumno diagnóstico:** `validateCode` (detecta si es código de alumno o PIN de examen), `launchExam`, `renderQ`, `nextQ`, `finishQuiz`, timers.
- **Exámenes parciales:** `renderExamsTab` (incluye la tarjeta del Diagnóstico + el botón "Revisión manual"), constructor (`nuevoExamen`,`addExQ`,`renderBuilderQs`,`exChangeType`,`guardarExamen`), alumno (`startExamPrompt`→`launchParcial`→`renderExamQ`→`finishExam`), **calificación de abiertas** `gradeOpen(expected,given,precision)` (usa `levenshtein` + normalización por nivel de precisión), revisión (`renderRevision`,`reviewAns`,`recalcRec`).
- **Constancia:** `abrirConstancia`→`renderCert`→`imprimirConstancia`/`enviarCorreo` (mailto).
- **Config:** `saveConfig`, `renderCats`/`renderSem`/`renderFeatToggles`, `toggleFeature`, `resetTodo` (pide contraseña + cuenta regresiva de 5s).
- **Debug:** `dbgGenerate`/`dbgClearTest`/`dbgBackup`/`dbgRestore`/`dbgWipeAll`.

## 7. Anti-trampa (importante)
`setupExamGuard()` escucha `visibilitychange`+`blur`. Si el alumno cambia de pestaña/ventana durante `vQuiz` o `vExam`, `lockExam()` muestra una pantalla roja a pantalla completa (`.lock-ov`) que el alumno NO puede cerrar. `releaseExam()` exige **código de personal** (`isStaffPass`: contraseña de Coordinación o de cualquier usuario) **+ justificación**, registra el evento en `interruptions[]` y reanuda (el cronómetro se pausa/reanuda, no se reinicia). En Calificaciones aparece un aviso **⚠️ N** junto al alumno.

## 8. Convenciones y reglas (NO romper)
- **Un solo archivo.** Funciones densas en una línea (estilo del proyecto). Mantén el estilo.
- **Nunca** `alert/confirm/prompt` nativos → usa `uiModal/uiAlert/uiConfirm`.
- **Escapa** SIEMPRE datos de usuario: `esc()` en HTML, `jss()` dentro de `onclick`.
- **anime.js obligatorio** para microinteracciones (es regla del cliente).
- Toda función nueva añadida recientemente debe poder **apagarse con un toggle** en Configuración (`CFG.features`) — patrón `feat('x')`.
- **No borres datos directo** sin confirmación; respeta `_test` para no tocar datos reales.
- Mantén compatibilidad de claves con la **Lite** (§9).

## 9. Relación con la Edición Lite
Lite y Completa usan **las MISMAS claves** (`ev_cfg, ev_bank, ev_res, ev_students`...). Bajo `file://` el origin es `file://` (compartido) → los datos enlazan solos; en web, mismo dominio. Por eso: lo que un alumno contesta en la Lite se ve en la Completa, y el modo Debug de la Completa puede ver/editar esos datos. **No cambies los nombres de clave ni las formas de registro** sin actualizar ambas.

## 10. Cómo probar con la suite (carpeta `tests/`)
Hay un arnés Playwright (Node) en `tests/`. En la compu donde lo corras:
1. `cd tests && npm i playwright && npx playwright install chromium`
2. **Edita la constante de ruta** al inicio de cada `.mjs` (`FILE = '.../offline-demo/index.html'`) para que apunte a TU ruta local.
3. `node run.mjs` (premium, 47 casos) · `node run-exam.mjs` (exámenes/anti-trampa, 8) · `node run-lite.mjs` (lite, 9).
Si tocas el código, corre las 3 y deja todo en verde antes de hacer commit.

## 11. Git
Repo: `github.com/ejercitopalomazi9111-arch/evaluaciones-rembrandt`. Commits semánticos (`feat:`/`fix:`...), autor `Palomazi <cegg.caoz@gmail.com>`. Al terminar un cambio: probar → commit → push a `master`.

## 12. Pendiente / futuro
- Migración a **web Supabase** (multiusuario en la nube, tiempo real) = el producto "serio" a vender.
- Ideas: asistente de primer arranque (quitar datos demo, subir logo), vista previa del examen, fuente de marca.
