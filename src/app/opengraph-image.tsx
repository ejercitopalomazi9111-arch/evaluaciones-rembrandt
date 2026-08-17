import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { INSTITUCION } from '@/content/institucion';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = `${INSTITUCION.nombreLegal} — Preescolar, Primaria, Secundaria y Preparatoria`;

/**
 * Imagen para redes sociales.
 *
 * Dos límites de satori que condicionan el diseño: no soporta `clip-path` ni
 * `transform: rotate` de forma fiable, así que la geometría se construye sólo
 * con bloques sólidos; y no puede usar next/font/google, por lo que la
 * tipografía va versionada en el repo y se lee del disco.
 */
export default async function OpenGraphImage() {
  const archivo = await readFile(join(process.cwd(), 'src/app/_og/Archivo-ExtraBold.ttf'));

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#0b0e1a',
          fontFamily: 'Archivo',
        }}
      >
        {/* Columna de contenido */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flexGrow: 1,
            minWidth: 0,
          }}
        >
          <div style={{ display: 'flex', height: 14, width: '100%' }}>
            <div style={{ display: 'flex', width: '45%', background: '#1b2a8f' }} />
            <div style={{ display: 'flex', width: '55%', background: '#d0202e' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', padding: '0 64px' }}>
            <div
              style={{
                display: 'flex',
                fontSize: 21,
                letterSpacing: 6,
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              QUERÉTARO · COL. SATÉLITE
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                fontSize: 88,
                color: '#ffffff',
                lineHeight: 1.02,
                marginTop: 20,
              }}
            >
              <span>Respeto, cultura</span>
              <span>y honor.</span>
            </div>
            <div style={{ display: 'flex', fontSize: 38, color: '#ff4d5a', marginTop: 22 }}>
              Y una preparatoria que enseña a programar.
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              borderTop: '1px solid rgba(255,255,255,0.12)',
              paddingTop: 26,
              paddingBottom: 48,
              marginLeft: 64,
              marginRight: 64,
            }}
          >
            <div style={{ display: 'flex', fontSize: 26, color: '#ffffff' }}>
              {INSTITUCION.nombreLegal}
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 16,
                letterSpacing: 3,
                color: 'rgba(255,255,255,0.45)',
                marginTop: 8,
              }}
            >
              PREESCOLAR · PRIMARIA · SECUNDARIA · PREPARATORIA · DGETI
            </div>
          </div>
        </div>

        {/* Banda institucional derecha: azul con filo rojo */}
        <div style={{ display: 'flex', width: 96, height: '100%', flexShrink: 0 }}>
          <div style={{ display: 'flex', width: 26, height: '100%', background: '#d0202e' }} />
          <div style={{ display: 'flex', width: 70, height: '100%', background: '#1b2a8f' }} />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'Archivo', data: archivo, weight: 800, style: 'normal' }],
    },
  );
}
