import type { PasoAdmision, PreguntaFrecuente } from './types';

/**
 * Proceso de admisión. Los pasos describen el flujo genérico que la escuela ya
 * opera (recorrido → solicitud → evaluación diagnóstica → resultados →
 * inscripción). Fechas, cuotas y requisitos documentales exactos los debe
 * confirmar Control Escolar: ver pendientes.ts.
 */

export const PASOS_ADMISION: readonly PasoAdmision[] = [
  {
    numero: '01',
    titulo: 'Conoce el plantel',
    texto:
      'Agenda un recorrido con Coordinación. Se ven las instalaciones, se conoce al equipo y se resuelven las dudas de fondo antes de llenar cualquier papel.',
    accion: { label: 'Agendar recorrido', href: '/admisiones/agendar-recorrido' },
  },
  {
    numero: '02',
    titulo: 'Solicita informes',
    texto:
      'Coordinación te comparte la información del nivel que te interesa: documentación requerida, fechas del ciclo y costos vigentes.',
    accion: { label: 'Pedir informes', href: '/contacto' },
  },
  {
    numero: '03',
    titulo: 'Evaluación diagnóstica',
    texto:
      'Una evaluación de nuevo ingreso que no aprueba ni reprueba: sirve para conocer el punto de partida de cada aspirante y acompañarlo desde el primer día.',
  },
  {
    numero: '04',
    titulo: 'Resultados y entrevista',
    texto:
      'Se comparten los resultados con la familia y se acuerda el acompañamiento que cada alumno necesita para empezar bien.',
  },
  {
    numero: '05',
    titulo: 'Inscripción',
    texto:
      'Se entrega la documentación, se formaliza la inscripción y se asigna grupo para el ciclo escolar.',
  },
];

export const FAQ = [
  {
    pregunta: '¿Qué niveles ofrece el Instituto Rembrandt?',
    respuesta:
      'Preescolar (Jardín de Niños «Las Rosas»), Primaria, Secundaria y Preparatoria. La Preparatoria es un Bachillerato Tecnológico incorporado a la DGETI con especialidad en Programación.',
  },
  {
    pregunta: '¿La evaluación diagnóstica se puede reprobar?',
    respuesta:
      'No. La evaluación de nuevo ingreso no aprueba ni reprueba a nadie: su única función es conocer el nivel académico de cada aspirante para brindarle el acompañamiento adecuado desde su llegada.',
  },
  {
    pregunta: '¿El instituto es bilingüe?',
    respuesta:
      'Sí. El instituto es particular, laico, mixto y bilingüe, con exposición continua al inglés desde preescolar.',
  },
  {
    pregunta: '¿Qué significa que la Preparatoria esté incorporada a la DGETI?',
    respuesta:
      'Significa que el bachillerato y la especialidad en Programación se cursan bajo el plan de estudios de la Dirección General de Educación Tecnológica Industrial y de Servicios, con validez oficial. El egresado obtiene su certificado de bachillerato y además una formación técnica reconocida.',
  },
  {
    pregunta: '¿La Preparatoria limita las carreras que puedo estudiar después?',
    respuesta:
      'No. Es un bachillerato completo: da acceso a cualquier licenciatura. La especialidad en Programación suma una formación técnica, no sustituye el tronco común.',
  },
  {
    pregunta: '¿Los alumnos de Secundaria pasan directo a la Preparatoria?',
    respuesta:
      'Sí, hay continuidad entre niveles dentro del mismo instituto. Coordinación te explica el proceso para tu caso concreto.',
  },
  {
    pregunta: '¿Dónde están ubicados?',
    respuesta:
      'El plantel principal está en C. de la Brisa 215, Col. Satélite, Santiago de Querétaro. El preescolar «Las Rosas» está a unos pasos, en De Fuego 306, Int. 1.',
  },
  {
    pregunta: '¿Se puede visitar el plantel antes de inscribirse?',
    respuesta:
      'Sí, y es lo que recomendamos. Puedes agendar un recorrido guiado con Coordinación desde este sitio o llamando al 442 218 2770.',
  },
] as const satisfies readonly PreguntaFrecuente[];

/** Requisitos generales. La lista definitiva la confirma Control Escolar. */
export const REQUISITOS = [
  {
    titulo: 'Documentación del aspirante',
    puntos: [
      'Acta de nacimiento (original y copia).',
      'CURP actualizada.',
      'Certificado o boletas del nivel anterior, según corresponda.',
      'Cartilla de vacunación (preescolar y primaria).',
      'Fotografías tamaño infantil.',
    ],
  },
  {
    titulo: 'Documentación de padre, madre o tutor',
    puntos: [
      'Identificación oficial vigente.',
      'Comprobante de domicilio reciente.',
    ],
  },
] as const;

export const NOTA_REQUISITOS =
  'Esta es la documentación que normalmente se solicita. La lista definitiva, las fechas del ciclo y los costos vigentes los confirma Control Escolar al momento de tu trámite.';
