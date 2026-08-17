import type { Pendiente } from './types';
import { NIVELES_LISTA } from './niveles';
import { GALERIA_VIDA } from './vida-escolar';
import type { MediaSlot } from './types';

/**
 * Lo que la escuela debe confirmar. Nada de esta lista se inventó en el sitio:
 * mientras el dato no exista, la sección correspondiente no se renderiza.
 * Consultable en /pendientes durante el desarrollo.
 */
export const PENDIENTES = [
  {
    campo: 'admisiones.costos',
    pregunta: '¿Cuáles son la inscripción y la colegiatura vigentes por nivel?',
    bloquea: 'sección',
  },
  {
    campo: 'admisiones.fechas',
    pregunta: '¿Cuáles son las fechas de inscripción y de inicio del ciclo escolar?',
    bloquea: 'sección',
  },
  {
    campo: 'niveles.horarios',
    pregunta: '¿Cuál es el horario de entrada y salida de cada nivel?',
    bloquea: 'sección',
  },
  {
    campo: 'contacto.horarioAtencion',
    pregunta: '¿En qué horario atiende Coordinación a padres de familia?',
    bloquea: 'sección',
  },
  {
    campo: 'contacto.whatsapp',
    pregunta:
      '¿El 442 218 2770 tiene WhatsApp? Si hay otro número, ¿cuál es? (El botón de WhatsApp no se muestra hasta confirmarlo.)',
    bloquea: 'sección',
  },
  {
    campo: 'institucion.cct',
    pregunta:
      '¿Cuál es la clave de centro de trabajo (CCT) y la incorporación oficial de cada nivel? (Preescolar, Primaria, Secundaria y Preparatoria.)',
    bloquea: 'sección',
  },
  {
    campo: 'institucion.fundacion',
    pregunta: '¿En qué año se fundó el instituto? Es un dato de confianza muy potente.',
    bloquea: 'sección',
  },
  {
    campo: 'especialidad.mapaCurricular',
    pregunta:
      '¿Cuál es el mapa curricular vigente de la especialidad en Programación (módulos, submódulos y horas)?',
    bloquea: 'sección',
  },
  {
    campo: 'vida-escolar.actividades',
    pregunta:
      '¿Qué actividades extraescolares, deportivas y culturales se ofrecen de forma regular?',
    bloquea: 'sección',
  },
  {
    campo: 'marca.escudoVectorial',
    pregunta:
      'El escudo se recortó del membrete y sólo existe a baja resolución. ¿Tienen el original en vector (.ai, .svg, .eps) o en al menos 1000 px?',
    bloquea: 'publicación',
  },
  {
    campo: 'seo.dominio',
    pregunta:
      '¿El sitio vivirá en irembrandt.com.mx? Hay que fijar NEXT_PUBLIC_SITE_URL antes de publicar.',
    bloquea: 'publicación',
  },
  {
    campo: 'formularios.correo',
    pregunta:
      '¿A qué buzón deben llegar las solicitudes del sitio y quién configurará la clave de Resend?',
    bloquea: 'publicación',
  },
] as const satisfies readonly Pendiente[];

/** Todos los huecos de fotografía del sitio, en un solo lugar. */
export const FOTOS_PENDIENTES: readonly MediaSlot[] = [
  ...NIVELES_LISTA.flatMap((n) => [n.hero, ...n.galeria]),
  ...GALERIA_VIDA,
];
