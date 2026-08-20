import type { Contacto, Institucion, Sede } from './types';

/**
 * Datos institucionales. Todo lo de este archivo está verificado contra la
 * papelería oficial del instituto (docs-marca/) y la configuración del sistema
 * escolar previo. NO agregar aquí nada que la escuela no haya confirmado.
 */

export const INSTITUCION = {
  nombreCorto: 'Instituto Rembrandt',
  nombreLegal: 'Instituto Rembrandt de Querétaro',
  lema: 'Formando jóvenes con respeto, cultura y honor.',
  valores: [
    {
      nombre: 'Respeto',
      texto:
        'Reconocer el proceso de cada persona. Se enseña con el trato diario, no con discursos: cada alumna y cada alumno avanza a su ritmo y ese ritmo se respeta.',
    },
    {
      nombre: 'Cultura',
      texto:
        'Un instituto que lleva el nombre de un maestro de la pintura entiende que formarse es también mirar, leer y crear. La cultura no es una materia extra: es el ambiente.',
    },
    {
      nombre: 'Honor',
      texto:
        'Sostener la palabra dada. Es el valor que convierte a un buen estudiante en alguien en quien su comunidad puede confiar.',
    },
  ],
  caracteristicas: ['Particular', 'Laica', 'Mixta', 'Bilingüe'],
  mision:
    'Desarrollar una comunidad escolar que sustente el desarrollo de sus niñas y niños, fortaleciendo sus competencias para la vida, creando de esta manera, seres humanos críticos y reflexivos de su entorno, para transformarlos en seres competitivos como ciudadanos respetando sus procesos individuales.',
  vision:
    'Ser una institución educativa donde se imparta una educación de calidad, con equidad, con personal capacitado y comprometido para la construcción y transformación de una práctica docente pertinente y de alto nivel.',
  direccionAcademica: {
    nombre: 'Dra. Blanca Ortiz Morales',
    cargo: 'Dirección Académica',
  },
} as const satisfies Institucion;

export const SEDES = [
  {
    id: 'principal',
    nombre: 'Plantel principal',
    calle: 'C. de la Brisa 215',
    colonia: 'Col. Satélite',
    ciudad: 'Santiago de Querétaro',
    estado: 'Querétaro',
    cp: '76110',
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=C.+de+la+Brisa+215%2C+Sat%C3%A9lite%2C+76110+Santiago+de+Quer%C3%A9taro%2C+Qro.',
    niveles: ['primaria', 'secundaria', 'preparatoria'],
  },
  {
    id: 'preescolar',
    nombre: 'Jardín de Niños «Las Rosas»',
    calle: 'De Fuego 306, Int. 1',
    ciudad: 'Santiago de Querétaro',
    estado: 'Querétaro',
    cp: '76110',
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=De+Fuego+306%2C+76110+Santiago+de+Quer%C3%A9taro%2C+Qro.',
    niveles: ['preescolar'],
  },
] as const satisfies readonly Sede[];

export const CONTACTO = {
  telefonoDisplay: '442 218 2770',
  telefonoE164: '+524422182770',
  email: 'contacto@irembrandt.com.mx',
  instagram: {
    handle: '@institutorembrandt',
    url: 'https://www.instagram.com/institutorembrandt/',
  },
  facebook: {
    nombre: 'Instituto Rembrandt de Querétaro',
    url: 'https://www.facebook.com/instituto.rembrandt/',
  },
} as const satisfies Contacto;

export function sedePorId(id: Sede['id']): Sede {
  const s = SEDES.find((x) => x.id === id);
  if (!s) throw new Error(`Sede desconocida: ${id}`);
  return s;
}

export function direccionCompleta(s: Sede): string {
  return [s.calle, s.colonia, `${s.cp} ${s.ciudad}`, s.estado].filter(Boolean).join(', ');
}
