import type { Destacado, MediaSlot } from './types';

/**
 * Ejes de la vida escolar. Descritos desde los valores institucionales
 * verificados (Respeto, Cultura, Honor) y la identidad del instituto.
 * No se afirman instalaciones, torneos ni programas específicos que la
 * escuela no haya confirmado.
 */
export const EJES = [
  {
    titulo: 'Cultura como ambiente',
    texto:
      'Llevamos el nombre de un maestro de la pintura. Mirar, leer y crear no son actividades extraescolares: son parte de cómo se aprende aquí.',
    icono: 'arte',
  },
  {
    titulo: 'Deporte y convivencia',
    texto:
      'El patio enseña cosas que el aula no: perder bien, coordinarse, sostener al equipo. Nuestro bisonte no está ahí de adorno.',
    icono: 'deporte',
  },
  {
    titulo: 'Comunidad escolar',
    texto:
      'Nuestra misión habla de sustentar el desarrollo de niñas y niños como comunidad. Familias, docentes y alumnos trabajando sobre lo mismo.',
    icono: 'grupo',
  },
  {
    titulo: 'Pensamiento crítico',
    texto:
      'Formar seres humanos críticos y reflexivos de su entorno. Se entrena preguntando, no repitiendo.',
    icono: 'brujula',
  },
] as const satisfies readonly Destacado[];

export const GALERIA_VIDA = [
  {
    id: 'vida-patio',
    alt: 'Patio del Instituto Rembrandt durante el receso',
    ratio: '16/9',
    nota: 'Foto horizontal del patio con actividad. Recomendado: sin rostros identificables o con consentimiento firmado.',
  },
  {
    id: 'vida-deporte',
    alt: 'Actividad deportiva en el Instituto Rembrandt',
    ratio: '4/3',
    nota: 'Actividad deportiva: cancha, equipo o entrenamiento.',
  },
  {
    id: 'vida-cultura',
    alt: 'Actividad cultural o artística',
    ratio: '4/3',
    nota: 'Festival, exposición, mural o actividad artística del instituto.',
  },
  {
    id: 'vida-ceremonia',
    alt: 'Ceremonia cívica del instituto',
    ratio: '4/3',
    nota: 'Honores a la bandera, ceremonia o evento formal.',
  },
  {
    id: 'vida-equipo',
    alt: 'Equipo docente del Instituto Rembrandt',
    ratio: '4/3',
    nota: 'Foto del equipo docente o del personal, con su consentimiento.',
  },
  {
    id: 'vida-instalaciones',
    alt: 'Instalaciones del plantel',
    ratio: '16/9',
    nota: 'Fachada o vista general del plantel de la Brisa 215.',
  },
] as const satisfies readonly MediaSlot[];
