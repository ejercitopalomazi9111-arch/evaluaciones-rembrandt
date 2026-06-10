# Sistema de Diseño — Evaluaciones Diagnósticas (Instituto Rembrandt)

Rediseño v3 (2026-06-09). Aplicado vía capa CSS dominante al final del `<style>` del
premium (`offline-demo/index.html`); la Lite lo hereda al regenerarse con
`tests/build-lite.mjs`. Basado en tendencias profesionales 2025/26: **base neutra +
acentos de confianza, calma, tipografía consistente, sensación "crafted, no templated".**

## 1. Color
| Token | Hex | Uso |
|------|------|-----|
| `--azul` | `#1e3a8a` | Navy de marca, títulos de sección |
| `--azul2` | `#3b5bd6` | **Acción primaria**, estados activos, datos clave |
| `--tinta` | `#0f1830` | Texto principal (≈16:1 sobre blanco) |
| `--gris` | `#586074` | Texto secundario (AA) |
| `--acento` | `#e3a008` | Oro institucional (usar con moderación) |
| `--rojo` | `#d6263b` | Rojo institucional / alertas |
| `--verde` | `#15a34a` | Éxito / suficiente |
| `--linea` | `#e7eaf3` | Bordes hairline |
| `--fondo` | `#eef2fa` | Base de la app |

Principio: **neutro de fondo + azul para lo importante**; rojo/oro solo como acentos.
Fondo calmado (formas `bgfx` a opacidad ~.15, sin malla ruidosa).

## 2. Tipografía
- **UI:** `Inter` (Google Fonts, con fallback de sistema) — pesos 400/500/600/700/800/900.
- **Reporte/constancia:** serif `Georgia` para los títulos (formalidad institucional).
- **Datos numéricos:** `font-variant-numeric: tabular-nums` en stats, calificaciones,
  contadores, celdas de tabla (alineación tipo "reporte").
- Títulos con `letter-spacing:-.025em`, peso 800–900; cuerpo 1.55 de interlínea.

## 3. Espaciado, radios y sombras
- Radios: tarjetas `18px`, hero `24–26px`, botones/campos `11–13px`, píldoras `99px`.
- Sombras en capas: `0 1px 2px rgba(15,24,48,.05), 0 14px 34px rgba(15,24,48,.09)`.
- Tarjetas con `padding:28px`; mucho aire entre bloques.

## 4. Componentes
- **Botones:** primario degradado azul con sombra de color; secundario blanco con borde;
  estados hover (elevación) y active (scale .99).
- **Campos:** borde hairline, fondo `#fbfcfe`, foco con anillo `rgba(59,91,214,.13)`.
- **Hero:** degradado navy radial + brillo diagonal sutil + mascota (bisonte) con sombra.
- **Opciones de examen:** grandes, borde 2px, key A/B/C/D, estado seleccionado con anillo.
- **Tablas:** encabezado tenue en mayúsculas, hover por fila, numerales tabulares.
- **Panel:** barra lateral fija (marca + navegación agrupada Resultados/Personas/Sistema +
  cerrar sesión) + barra superior + contenido. Responsive: colapsa a fila en ≤860px.
- **Constancia:** encabezado/pie del **formato institucional** (DGETI + Rembrandt),
  firmantes Dirección Académica (Dra. Blanca Ortiz Morales) y Control Escolar.

## 5. Micro-interacciones (SATISFYING)
- Entradas con anime.js (fade + translate, 320–480ms, ease-out, stagger).
- Hover/active 150–200ms con `cubic-bezier(.22,1,.36,1)`.
- Respeta `prefers-reduced-motion` (desactiva animaciones).

## 6. Accesibilidad (RIGHT)
- Contraste AA en texto y acentos; `*:focus-visible` con outline visible.
- Objetivos táctiles ≥40px; numerales tabulares para lecturas rápidas.

## 7. Verificación
- Capturas revisadas: hub, examen, panel — look profesional y calmado.
- Suites Playwright en verde: **premium 47/47, lite 9/9**.
