import { Accordion, Button, Card, Container, Eyebrow, ReglaInstitucional, Section, Tag } from '@/components/ui/primitivas';
import { Icon } from '@/components/ui/Icon';
import { BandaDiagonal } from '@/components/secciones/BandaDiagonal';
import { FotoSlot } from '@/components/media/FotoSlot';
import { Escudo, Lockup, Mascota, SelloDGETI } from '@/components/marca/Marca';
import type { IconName } from '@/content/types';

export const metadata = { title: 'Guía de estilo', robots: { index: false } };

const COLORES = [
  ['tinta', '#0b0e1a'], ['tinta-2', '#141a30'], ['tinta-suave', '#474d63'],
  ['azul', '#1b2a8f'], ['azul-hondo', '#0d1450'], ['azul-vivo', '#2e42c8'], ['azul-tenue', '#e5e8f6'],
  ['rojo', '#d0202e'], ['rojo-texto', '#a3141f'], ['rojo-claro', '#ff4d5a'], ['rojo-tenue', '#fbe9ea'],
  ['hueso', '#f4f3ef'], ['hueso-2', '#eceae3'], ['linea', '#d9d6cd'], ['ambar', '#e8a317'],
];

const ICONOS: IconName[] = ['escudo','idioma','codigo','laboratorio','deporte','arte','reloj','ubicacion','telefono','correo','calendario','documento','libro','grupo','chispa','brujula','red','flecha'];

export default function EstiloPage() {
  return (
    <Section>
      <Container>
        <Eyebrow>Uso interno</Eyebrow>
        <h1 className="mt-5 text-4xl">Sistema de diseño</h1>
        <p className="mt-5 max-w-2xl text-lg text-tinta-suave">
          Geometría tecnológica: esquinas vivas, retícula de plano, sombras duras. Derivado de la
          papelería institucional.
        </p>

        <h2 className="mt-14 text-2xl">Color</h2>
        <ul className="mt-6 grid list-none grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {COLORES.map(([n, hex]) => (
            <li key={n} className="border border-linea">
              <div className="h-16" style={{ background: hex }} />
              <div className="p-3">
                <p className="font-mono text-[0.62rem] font-bold">{n}</p>
                <p className="font-mono text-[0.6rem] text-tinta-suave uppercase">{hex}</p>
              </div>
            </li>
          ))}
        </ul>

        <h2 className="mt-14 text-2xl">Tipografía</h2>
        <div className="mt-6 space-y-4 border-y border-linea py-8">
          <p className="text-hero font-black">Hero 6.75rem</p>
          <p className="text-4xl">Título 4xl</p>
          <p className="text-3xl">Título 3xl</p>
          <p className="text-2xl">Título 2xl</p>
          <p className="text-lg">Cuerpo lg — Archivo variable, ancho 112%</p>
          <p>Cuerpo base — la escala completa es fluida con clamp()</p>
          <Eyebrow>Eyebrow en JetBrains Mono</Eyebrow>
        </div>

        <h2 className="mt-14 text-2xl">Regla institucional</h2>
        <ReglaInstitucional className="mt-6" />
        <div className="mt-6"><BandaDiagonal /></div>

        <h2 className="mt-14 text-2xl">Botones</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variante="rojo">Acción primaria</Button>
          <Button variante="azul">Acción azul</Button>
          <Button variante="linea">Secundaria</Button>
        </div>

        <h2 className="mt-14 text-2xl">Etiquetas</h2>
        <div className="mt-6 flex flex-wrap gap-2">
          <Tag>Azul</Tag><Tag tono="rojo">Rojo</Tag><Tag tono="linea">Línea</Tag>
        </div>

        <h2 className="mt-14 text-2xl">Marca</h2>
        <div className="mt-6 flex flex-wrap items-end gap-8">
          <Lockup />
          <Escudo size={80} />
          <SelloDGETI />
          <Mascota width={120} className="h-auto w-24" />
        </div>

        <h2 className="mt-14 text-2xl">Iconos</h2>
        <ul className="mt-6 grid list-none grid-cols-4 gap-4 sm:grid-cols-9">
          {ICONOS.map((i) => (
            <li key={i} className="flex flex-col items-center gap-2 border border-linea p-3">
              <Icon name={i} className="size-6 text-azul" />
              <span className="font-mono text-[0.55rem] text-tinta-suave">{i}</span>
            </li>
          ))}
        </ul>

        <h2 className="mt-14 text-2xl">Hueco de fotografía</h2>
        <div className="mt-6 max-w-md">
          <FotoSlot slot={{ id: 'ejemplo-slot', alt: 'Ejemplo', ratio: '4/3', nota: 'Ejemplo' }} />
        </div>

        <h2 className="mt-14 text-2xl">Tarjeta y acordeón</h2>
        <Card className="mt-6 max-w-md p-7"><p>Tarjeta con esquina cortada.</p></Card>
        <div className="mt-8 max-w-2xl">
          <Accordion items={[{ pregunta: '¿Cómo se ve un acordeón?', respuesta: 'Así. Usa <details> nativo, así que el teclado funciona sin JavaScript.' }]} />
        </div>
      </Container>
    </Section>
  );
}
