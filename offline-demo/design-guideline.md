# Guía de diseño — Evaluaciones Diagnósticas Instituto Rembrandt

## Estilo
Institucional moderno + acentos geométricos (formas/líneas estilo hackathon) sobre la paleta Rembrandt. Tarjetas blancas limpias sobre un fondo con color y profundidad.

## Color
- Azul rey `#27338f` (primario) · Azul vivo `#3a51c0` (acción)
- Rojo `#d11f2d` · Oro `#f4b50a` (acentos)
- Tinta `#172046` (texto) · Gris `#6b7280` (secundario) · Línea `#e3e7ef`
- Niveles de desempeño: Sobresaliente=verde, Satisfactorio=azul, Básico=naranja, Insuficiente=rojo.

## Tipografía
Stack del sistema (Segoe UI/Roboto) por ser 100% offline. Títulos `letter-spacing:-.02/-.03em`, peso 700–800. Cuerpo 15px, secundario 13px.

## Layout y espaciado
Radios 10–18px. Contenedor máx 1000px. Sombras en capas (1px sutil + 14px difusa) para profundidad. Hero con degradado azul + blobs oro/rojo.

## Micro-interacciones (framework /aesthetic)
- Entradas: `ease-out` / `cubic-bezier(.22,1,.36,1)` 180–260ms.
- Iconos con leve "spring" `cubic-bezier(.34,1.56,.64,1)` al hover.
- Botones: lift en hover, `scale(.985)` al presionar.
- anime.js: cascada de tarjetas, entrada de preguntas, conteo de calificación, palomita elástica.
- Respeta `prefers-reduced-motion`.

## Accesibilidad
- `:focus-visible` con anillo azul.
- Contraste alto en badges/niveles.
- Sin diálogos nativos del navegador (modales/toasts propios).

## Iconografía
Iconos SVG de línea (stroke=currentColor) coloreados por contexto, en lugar de emojis, en hub/niveles/header.
