import type { SeccionLegal } from './types';
import { CONTACTO, INSTITUCION, SEDES } from './institucion';

const domicilio = `${SEDES[0].calle}, ${SEDES[0].colonia}, C.P. ${SEDES[0].cp}, ${SEDES[0].ciudad}, ${SEDES[0].estado}`;

export const FECHA_ACTUALIZACION_LEGAL = '17 de agosto de 2026';

/**
 * Aviso de privacidad INTEGRAL conforme a la Ley Federal de Protección de
 * Datos Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento.
 * El aviso SIMPLIFICADO va junto a cada formulario (componente AvisoSimplificado).
 */
export const AVISO_PRIVACIDAD = [
  {
    id: 'responsable',
    titulo: 'Identidad y domicilio del responsable',
    parrafos: [
      `${INSTITUCION.nombreLegal}, con domicilio en ${domicilio}, es el responsable del tratamiento de los datos personales que nos proporcione a través de este sitio web, y los protegerá conforme a lo dispuesto por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares y su Reglamento.`,
      `Para cualquier asunto relacionado con este aviso puede escribirnos a ${CONTACTO.email} o llamar al ${CONTACTO.telefonoDisplay}.`,
    ],
  },
  {
    id: 'datos',
    titulo: 'Datos personales que recabamos',
    parrafos: [
      'A través de los formularios de este sitio recabamos únicamente los datos que usted decide proporcionarnos:',
    ],
    lista: [
      'Nombre de la persona que hace el contacto.',
      'Correo electrónico y teléfono de contacto.',
      'Nombre del aspirante y nivel educativo de interés, cuando usted lo proporciona.',
      'El mensaje o los comentarios que usted redacte.',
    ],
  },
  {
    id: 'menores',
    titulo: 'Datos personales de menores de edad',
    parrafos: [
      'Cuando el formulario incluye el nombre de un aspirante menor de edad, dicho dato debe ser proporcionado exclusivamente por su padre, madre o tutor, quien al enviarlo manifiesta contar con la representación legal necesaria y otorga su consentimiento para el tratamiento descrito en este aviso.',
      'Este sitio no está dirigido a menores de edad y no solicita que un menor proporcione directamente sus datos personales.',
      'Cualquier fotografía de alumnas o alumnos publicada en este sitio se utiliza únicamente con el consentimiento previo de su padre, madre o tutor.',
    ],
  },
  {
    id: 'finalidades',
    titulo: 'Finalidades del tratamiento',
    parrafos: ['Finalidades primarias, necesarias para atender su solicitud:'],
    lista: [
      'Responder solicitudes de informes sobre nuestra oferta educativa.',
      'Agendar y confirmar recorridos guiados por el plantel.',
      'Dar seguimiento al proceso de admisión del aspirante.',
      'Atender dudas, comentarios o quejas que usted nos haga llegar.',
    ],
  },
  {
    id: 'secundarias',
    titulo: 'Finalidades secundarias',
    parrafos: [
      'De manera adicional, y sólo si usted no manifiesta su oposición, podríamos utilizar sus datos de contacto para informarle sobre fechas de inscripción, eventos abiertos y avisos del instituto.',
      `Puede oponerse a estas finalidades secundarias en cualquier momento escribiendo a ${CONTACTO.email}. Su negativa no será motivo para negarle los servicios que solicita.`,
    ],
  },
  {
    id: 'transferencias',
    titulo: 'Transferencias de datos',
    parrafos: [
      'No transferimos sus datos personales a terceros para fines comerciales, de mercadotecnia o publicitarios.',
      'Únicamente podremos comunicarlos cuando exista un requerimiento fundado y motivado de autoridad competente, o cuando la transferencia sea legalmente exigible para atender el proceso de incorporación ante las autoridades educativas correspondientes.',
    ],
  },
  {
    id: 'arco',
    titulo: 'Ejercicio de los derechos ARCO',
    parrafos: [
      'Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección de su información personal en caso de que esté desactualizada, sea inexacta o incompleta (Rectificación); que la eliminemos de nuestros registros cuando considere que no está siendo utilizada conforme a los principios y deberes que marca la normativa (Cancelación); así como oponerse al uso de sus datos personales para fines específicos (Oposición).',
      `Para ejercer cualquiera de estos derechos envíe una solicitud a ${CONTACTO.email} indicando su nombre, un medio para comunicarle la respuesta, los documentos que acrediten su identidad o representación legal, la descripción clara de los datos respecto de los que busca ejercer el derecho, y cualquier elemento que facilite su localización.`,
      'Daremos respuesta a su solicitud en un plazo máximo de veinte días hábiles contados desde su recepción.',
    ],
  },
  {
    id: 'revocacion',
    titulo: 'Revocación del consentimiento',
    parrafos: [
      `Puede revocar en cualquier momento el consentimiento que nos ha otorgado para el tratamiento de sus datos personales, mediante solicitud enviada a ${CONTACTO.email}. Tenga en cuenta que, por ciertos fines, la revocación puede implicar que no podamos seguir atendiendo su solicitud de informes o admisión.`,
    ],
  },
  {
    id: 'cookies',
    titulo: 'Cookies y tecnologías de rastreo',
    parrafos: [
      'Este sitio web no utiliza cookies de rastreo, no incorpora herramientas de analítica de terceros y no carga scripts publicitarios.',
      'Las tipografías del sitio se sirven desde nuestro propio dominio, por lo que su navegador no realiza peticiones a servidores externos al visitarnos.',
      'El mapa de ubicación de Google Maps sólo se carga si usted pulsa expresamente el botón para mostrarlo. Mientras no lo haga, no se establece ninguna conexión con Google.',
    ],
  },
  {
    id: 'seguridad',
    titulo: 'Medidas de seguridad',
    parrafos: [
      'Mantenemos medidas de seguridad administrativas, técnicas y físicas razonables para proteger sus datos personales contra daño, pérdida, alteración, destrucción o uso, acceso o tratamiento no autorizado.',
    ],
  },
  {
    id: 'cambios',
    titulo: 'Cambios al aviso de privacidad',
    parrafos: [
      'Este aviso puede sufrir modificaciones derivadas de nuevos requerimientos legales, de nuestras propias necesidades o de cambios en nuestro modelo de operación. Cualquier modificación se publicará en esta misma página, indicando la fecha de la última actualización.',
      `Última actualización: ${FECHA_ACTUALIZACION_LEGAL}.`,
    ],
  },
] as const satisfies readonly SeccionLegal[];

export const TERMINOS = [
  {
    id: 'objeto',
    titulo: 'Objeto',
    parrafos: [
      `Este sitio web es propiedad de ${INSTITUCION.nombreLegal} y tiene como finalidad informar sobre su oferta educativa y facilitar el contacto con la institución. El uso del sitio implica la aceptación de estos términos.`,
    ],
  },
  {
    id: 'informacion',
    titulo: 'Exactitud de la información',
    parrafos: [
      'La información publicada tiene carácter informativo. Fechas del ciclo escolar, requisitos de admisión, costos y planes de estudio pueden cambiar; la información vigente y vinculante es la que proporciona directamente Control Escolar del instituto.',
      'La descripción de la especialidad de la Preparatoria se rige por el plan de estudios vigente de la Dirección General de Educación Tecnológica Industrial y de Servicios (DGETI).',
    ],
  },
  {
    id: 'propiedad',
    titulo: 'Propiedad intelectual',
    parrafos: [
      `El escudo institucional, el nombre «${INSTITUCION.nombreCorto}», la mascota y los demás signos distintivos que aparecen en este sitio son propiedad de ${INSTITUCION.nombreLegal}. Queda prohibida su reproducción o uso sin autorización expresa por escrito.`,
      'Los textos, la estructura y el diseño de este sitio se encuentran protegidos por la legislación aplicable en materia de derechos de autor.',
    ],
  },
  {
    id: 'enlaces',
    titulo: 'Enlaces a sitios de terceros',
    parrafos: [
      'Este sitio contiene enlaces a redes sociales y servicios de mapas operados por terceros. El instituto no controla ni se hace responsable del contenido ni de las políticas de privacidad de dichos sitios.',
    ],
  },
  {
    id: 'responsabilidad',
    titulo: 'Limitación de responsabilidad',
    parrafos: [
      'El instituto procura la disponibilidad continua del sitio, pero no garantiza que esté libre de interrupciones o errores. No será responsable por daños derivados del uso o la imposibilidad de uso del sitio.',
    ],
  },
  {
    id: 'ley',
    titulo: 'Ley aplicable y jurisdicción',
    parrafos: [
      'Estos términos se rigen por la legislación mexicana. Para la interpretación y cumplimiento de los mismos, las partes se someten a la jurisdicción de los tribunales competentes de Santiago de Querétaro, Querétaro.',
      `Última actualización: ${FECHA_ACTUALIZACION_LEGAL}.`,
    ],
  },
] as const satisfies readonly SeccionLegal[];
