import { Container, Eyebrow, Section, Tag } from '@/components/ui/primitivas';
import { FOTOS_PENDIENTES, PENDIENTES } from '@/content/pendientes';

export const metadata = { title: 'Pendientes', robots: { index: false } };

export default function PendientesPage() {
  return (
    <Section>
      <Container>
        <Eyebrow>Uso interno</Eyebrow>
        <h1 className="mt-5 text-4xl">Lo que falta confirmar</h1>
        <p className="mt-5 max-w-2xl text-lg text-white/70">
          Nada de esta lista se inventó en el sitio. Mientras el dato no exista, la sección
          correspondiente no se renderiza.
        </p>

        <h2 className="mt-14 text-2xl">Datos ({PENDIENTES.length})</h2>
        <ul className="mt-6 list-none divide-y divide-white/12 border-y border-white/12">
          {PENDIENTES.map((p) => (
            <li key={p.campo} className="py-5">
              <div className="flex flex-wrap items-center gap-3">
                <code className="font-mono text-xs text-azul-vivo">{p.campo}</code>
                <Tag tono={p.bloquea === 'publicación' ? 'rojo' : 'linea'}>
                  bloquea {p.bloquea}
                </Tag>
              </div>
              <p className="mt-2">{p.pregunta}</p>
            </li>
          ))}
        </ul>

        <h2 className="mt-14 text-2xl">Fotografías ({FOTOS_PENDIENTES.length})</h2>
        <p className="mt-3 max-w-2xl text-white/70">
          Para publicar una foto: colócala en <code className="font-mono text-sm">public/fotos/</code>{' '}
          con el nombre indicado y añade <code className="font-mono text-sm">src</code> en el slot.
        </p>
        <ul className="mt-6 list-none divide-y divide-white/12 border-y border-white/12">
          {FOTOS_PENDIENTES.map((f) => (
            <li key={f.id} className="grid gap-2 py-5 sm:grid-cols-[16rem_minmax(0,1fr)]">
              <div>
                <code className="font-mono text-xs font-bold text-rojo-claro">{f.id}.jpg</code>
                <p className="mt-1 font-mono text-[0.65rem] text-white/70">{f.ratio}</p>
              </div>
              <p className="text-sm text-white/70">{f.nota}</p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
