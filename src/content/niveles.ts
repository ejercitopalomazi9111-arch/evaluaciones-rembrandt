import type { Nivel, NivelId } from './types';

/**
 * Los cuatro niveles. Las edades son las del sistema educativo nacional para
 * cada nivel; los datos específicos del plantel que la escuela aún no confirma
 * (cupos, horarios, colegiaturas, CCT) NO aparecen aquí — ver pendientes.ts.
 */

export const NIVELES = {
  preescolar: {
    id: 'preescolar',
    slug: 'preescolar',
    indice: '01',
    nombre: 'Preescolar',
    nombreLargo: 'Jardín de Niños «Las Rosas»',
    edades: '3 a 5 años',
    claim: 'Primero la confianza. Después, todo lo demás.',
    descripcion:
      'El primer día de escuela decide muchas cosas. En «Las Rosas» el trabajo es que cada niña y cada niño descubra que este es un lugar seguro donde preguntar está bien y equivocarse no cuesta nada. Sobre esa confianza se construye el lenguaje, el pensamiento matemático y las ganas de explorar el mundo.',
    datosClave: [
      { etiqueta: 'Edades', valor: '3 a 5 años' },
      { etiqueta: 'Grados', valor: '1.º, 2.º y 3.º' },
      { etiqueta: 'Sede', valor: 'Jardín de Niños «Las Rosas»' },
      { etiqueta: 'Modelo', valor: 'Bilingüe' },
    ],
    destacados: [
      {
        titulo: 'Lenguaje y comunicación',
        texto:
          'Hablar, escuchar, narrar. Antes de leer, se aprende a tener algo que decir y a que alguien lo escuche con atención.',
        icono: 'libro',
      },
      {
        titulo: 'Pensamiento matemático',
        texto:
          'Contar, comparar, ordenar y descubrir patrones con las manos antes que con el cuaderno.',
        icono: 'chispa',
      },
      {
        titulo: 'Exploración del mundo',
        texto:
          'La curiosidad se toma en serio: preguntar por qué es el comienzo del método científico.',
        icono: 'brujula',
      },
      {
        titulo: 'Segundo idioma desde el inicio',
        texto:
          'El inglés entra por el juego y la rutina diaria, en la edad en la que el oído todavía lo absorbe todo.',
        icono: 'idioma',
      },
    ],
    sedeId: 'preescolar',
    acento: 'ambar',
    hero: {
      id: 'preescolar-hero',
      alt: 'Alumnas y alumnos de preescolar en actividad en el Jardín de Niños Las Rosas',
      ratio: '4/3',
      nota: 'Foto horizontal luminosa de un salón o patio de preescolar en actividad. Recomendado: sin rostros identificables o con consentimiento firmado de padres y tutores.',
      prioridad: true,
    },
    galeria: [
      {
        id: 'preescolar-juego',
        alt: 'Área de juego del preescolar',
        ratio: '4/3',
        nota: 'Área de juego o patio del preescolar, sin niños en primer plano.',
      },
      {
        id: 'preescolar-salon',
        alt: 'Salón de preescolar',
        ratio: '4/3',
        nota: 'Salón de clases vacío y ordenado, con buena luz natural.',
      },
    ],
  },

  primaria: {
    id: 'primaria',
    slug: 'primaria',
    indice: '02',
    nombre: 'Primaria',
    edades: '6 a 12 años',
    claim: 'Seis años para volverse una persona que estudia.',
    descripcion:
      'La primaria es donde se forman los hábitos que después nadie vuelve a enseñar: leer con atención, sostener un problema difícil sin rendirse, escribir para que otro entienda. Nuestro trabajo es que esos hábitos se instalen mientras el niño todavía disfruta aprendiendo.',
    datosClave: [
      { etiqueta: 'Edades', valor: '6 a 12 años' },
      { etiqueta: 'Grados', valor: '1.º a 6.º' },
      { etiqueta: 'Sede', valor: 'C. de la Brisa 215, Col. Satélite' },
      { etiqueta: 'Modelo', valor: 'Bilingüe' },
    ],
    destacados: [
      {
        titulo: 'Español que se usa',
        texto:
          'Comprensión lectora y redacción trabajadas como herramientas, no como materia que se aprueba y se olvida.',
        icono: 'libro',
      },
      {
        titulo: 'Matemáticas con sentido',
        texto:
          'Entender por qué funciona un procedimiento antes de automatizarlo. Es lo que sostiene la secundaria.',
        icono: 'chispa',
      },
      {
        titulo: 'Ciencias naturales',
        texto:
          'Observar, registrar y explicar. La primera práctica formal del pensamiento crítico que pide nuestra misión.',
        icono: 'laboratorio',
      },
      {
        titulo: 'Inglés continuo',
        texto:
          'Seis años seguidos de exposición al idioma, sin cortes entre niveles.',
        icono: 'idioma',
      },
    ],
    sedeId: 'principal',
    acento: 'azul',
    hero: {
      id: 'primaria-hero',
      alt: 'Alumnas y alumnos de primaria del Instituto Rembrandt en clase',
      ratio: '16/9',
      nota: 'Foto horizontal de un salón de primaria en actividad o del patio en hora de clase.',
      prioridad: true,
    },
    galeria: [
      {
        id: 'primaria-biblioteca',
        alt: 'Espacio de lectura de primaria',
        ratio: '4/3',
        nota: 'Biblioteca, rincón de lectura o estantería de libros del plantel.',
      },
      {
        id: 'primaria-patio',
        alt: 'Patio del plantel principal',
        ratio: '4/3',
        nota: 'Patio o área común del plantel de la Brisa 215.',
      },
    ],
  },

  secundaria: {
    id: 'secundaria',
    slug: 'secundaria',
    indice: '03',
    nombre: 'Secundaria',
    edades: '12 a 15 años',
    claim: 'La edad en la que se decide qué tan lejos se quiere llegar.',
    descripcion:
      'En secundaria el contenido se vuelve exigente y el alumno se vuelve otra persona al mismo tiempo. Aquí acompañamos las dos cosas: el rigor académico que prepara para el bachillerato y el criterio propio que la adolescencia empieza a pedir.',
    datosClave: [
      { etiqueta: 'Edades', valor: '12 a 15 años' },
      { etiqueta: 'Grados', valor: '1.º, 2.º y 3.º' },
      { etiqueta: 'Sede', valor: 'C. de la Brisa 215, Col. Satélite' },
      { etiqueta: 'Continuidad', valor: 'Pase directo a la Preparatoria' },
    ],
    destacados: [
      {
        titulo: 'Base científica sólida',
        texto:
          'Matemáticas, Física, Química y Biología trabajadas con la seriedad que exige el bachillerato tecnológico que sigue.',
        icono: 'laboratorio',
      },
      {
        titulo: 'Lectura y redacción',
        texto:
          'Argumentar por escrito y defender una idea con evidencia. La competencia que más pesa en toda la vida académica.',
        icono: 'libro',
      },
      {
        titulo: 'Puente hacia la especialidad',
        texto:
          'Un primer contacto con el pensamiento lógico y computacional antes de entrar a la Preparatoria en Programación.',
        icono: 'codigo',
      },
      {
        titulo: 'Acompañamiento personal',
        texto:
          'Respetar los procesos individuales, como dice nuestra misión, se nota sobre todo en estos tres años.',
        icono: 'grupo',
      },
    ],
    materias: ['Matemáticas', 'Física', 'Química', 'Biología', 'Lectura y Redacción'],
    sedeId: 'principal',
    acento: 'azul',
    hero: {
      id: 'secundaria-hero',
      alt: 'Alumnas y alumnos de secundaria del Instituto Rembrandt',
      ratio: '16/9',
      nota: 'Foto horizontal de un grupo de secundaria en clase, laboratorio o actividad.',
      prioridad: true,
    },
    galeria: [
      {
        id: 'secundaria-laboratorio',
        alt: 'Laboratorio de ciencias',
        ratio: '4/3',
        nota: 'Laboratorio de ciencias del plantel, con equipo visible.',
      },
      {
        id: 'secundaria-aula',
        alt: 'Aula de secundaria',
        ratio: '4/3',
        nota: 'Aula de secundaria ordenada, con pizarrón y mobiliario.',
      },
    ],
  },

  preparatoria: {
    id: 'preparatoria',
    slug: 'preparatoria',
    indice: '04',
    nombre: 'Preparatoria',
    nombreLargo: 'Bachillerato Tecnológico con especialidad en Programación',
    edades: '15 a 18 años',
    claim: 'Sales con bachillerato. Y sabiendo programar.',
    descripcion:
      'Nuestra preparatoria es un Bachillerato Tecnológico incorporado a la DGETI con especialidad en Programación. Eso significa dos cosas al mismo tiempo: el bachillerato completo que abre la puerta a cualquier licenciatura, y una especialidad técnica real con la que se puede trabajar desde el primer día.',
    datosClave: [
      { etiqueta: 'Edades', valor: '15 a 18 años' },
      { etiqueta: 'Especialidad', valor: 'Programación' },
      { etiqueta: 'Incorporación', valor: 'DGETI' },
      { etiqueta: 'Sede', valor: 'C. de la Brisa 215, Col. Satélite' },
    ],
    destacados: [
      {
        titulo: 'Bachillerato completo',
        texto:
          'El tronco común que da acceso a cualquier licenciatura. La especialidad suma, no sustituye.',
        icono: 'documento',
      },
      {
        titulo: 'Especialidad en Programación',
        texto:
          'Formación técnica bajo el plan de la Dirección General de Educación Tecnológica Industrial y de Servicios.',
        icono: 'codigo',
      },
      {
        titulo: 'Ciencias exactas con peso',
        texto:
          'Matemáticas y Física trabajadas al nivel que exige una carrera de ingeniería.',
        icono: 'laboratorio',
      },
      {
        titulo: 'Salida laboral real',
        texto:
          'Una especialidad técnica reconocida oficialmente es una ventaja concreta, no una línea decorativa en el currículum.',
        icono: 'red',
      },
    ],
    materias: ['Matemáticas', 'Física', 'Química', 'Biología', 'Lectura y Redacción'],
    sedeId: 'principal',
    acento: 'rojo',
    hero: {
      id: 'preparatoria-hero',
      alt: 'Estudiantes de la preparatoria del Instituto Rembrandt en el laboratorio de cómputo',
      ratio: '16/9',
      nota: 'Foto horizontal del laboratorio de cómputo con estudiantes trabajando. Es la imagen más importante del sitio.',
      prioridad: true,
    },
    galeria: [
      {
        id: 'preparatoria-computo',
        alt: 'Laboratorio de cómputo',
        ratio: '4/3',
        nota: 'Laboratorio de cómputo completo, equipos encendidos.',
      },
      {
        id: 'preparatoria-proyecto',
        alt: 'Estudiantes presentando un proyecto',
        ratio: '4/3',
        nota: 'Alumnos presentando un proyecto o trabajando en equipo frente a una pantalla.',
      },
    ],
  },
} as const satisfies Record<NivelId, Nivel>;

export const NIVELES_LISTA: readonly Nivel[] = [
  NIVELES.preescolar,
  NIVELES.primaria,
  NIVELES.secundaria,
  NIVELES.preparatoria,
];
