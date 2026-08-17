import type { Especialidad } from './types';

/**
 * La especialidad de la Preparatoria. Verificado en la papelería oficial:
 * "BACHILLERATO TECNOLÓGICO EN PROGRAMACIÓN" con el sello DGETI, y en el pie:
 * "BACHILLERATO REMBRANDT CON ESPECIALIDAD EN PROGRAMACIÓN".
 *
 * El detalle del mapa curricular (módulos, submódulos y horas) lo define la
 * DGETI y la escuela aún no lo ha proporcionado: por eso aquí se describe la
 * especialidad sin afirmar un plan de estudios concreto. Ver pendientes.ts.
 */
export const ESPECIALIDAD = {
  organismo: 'DGETI',
  nombre: 'Bachillerato Tecnológico con especialidad en Programación',
  resumen:
    'La mayoría de las preparatorias te preparan para elegir una carrera. Esta además te enseña un oficio que hoy se paga y se ejerce desde cualquier lugar del mundo. Al terminar tienes el bachillerato que necesitas para entrar a la universidad y una especialidad técnica reconocida oficialmente.',
  competencias: [
    {
      titulo: 'Lógica y algoritmos',
      texto:
        'Descomponer un problema hasta volverlo resoluble. Es la habilidad de fondo: sirve igual para programar que para cualquier ingeniería.',
      icono: 'chispa',
    },
    {
      titulo: 'Programación',
      texto:
        'Escribir, leer y corregir código. Pasar de "funciona en mi máquina" a algo que otra persona puede usar y mantener.',
      icono: 'codigo',
    },
    {
      titulo: 'Datos y bases de datos',
      texto:
        'Modelar información y consultarla. Detrás de casi todo sistema que existe hay una base de datos bien o mal diseñada.',
      icono: 'red',
    },
    {
      titulo: 'Desarrollo de proyectos',
      texto:
        'Trabajar en equipo con entregas, plazos y un usuario real al otro lado. La parte que la escuela sí puede enseñar antes del primer empleo.',
      icono: 'grupo',
    },
  ],
  perfilEgreso: [
    'Certificado de bachillerato con validez oficial para continuar cualquier licenciatura.',
    'Formación técnica en programación bajo el plan de la DGETI.',
    'Capacidad para analizar un problema y proponer una solución informática.',
    'Práctica de trabajo en equipo, documentación y entrega de proyectos.',
  ],
  nota: 'El mapa curricular detallado corresponde al plan vigente de la Dirección General de Educación Tecnológica Industrial y de Servicios (DGETI). Solicítalo a Control Escolar para conocer módulos, submódulos y carga horaria del ciclo en curso.',
} as const satisfies Especialidad;
