import { NIVELES_LISTA } from '@/content/niveles';
import { correo, longitud, requerido, telefonoMx, unaDe, type Esquema } from './validacion';

export const NIVELES_OPCIONES = NIVELES_LISTA.map((n) => n.nombre);

export type TipoSolicitud = 'informes' | 'recorrido' | 'contacto';

const nombre = [requerido('El nombre'), longitud(2, 90, 'El nombre')] as const;
const email = [requerido('El correo'), correo, longitud(5, 120, 'El correo')] as const;
const tel = [requerido('El teléfono'), telefonoMx] as const;

export const ESQUEMAS: Record<TipoSolicitud, Esquema> = {
  informes: {
    nombre,
    email,
    telefono: tel,
    nivel: [unaDe(NIVELES_OPCIONES)],
    mensaje: [longitud(0, 2000, 'El mensaje')],
  },
  recorrido: {
    nombre,
    email,
    telefono: tel,
    aspirante: [longitud(0, 90, 'El nombre del aspirante')],
    nivel: [requerido('El nivel de interés'), unaDe(NIVELES_OPCIONES)],
    horario: [longitud(0, 120, 'El horario preferido')],
    mensaje: [longitud(0, 2000, 'El mensaje')],
  },
  contacto: {
    nombre,
    email,
    telefono: [telefonoMx],
    asunto: [requerido('El asunto'), longitud(3, 120, 'El asunto')],
    mensaje: [requerido('El mensaje'), longitud(10, 2000, 'El mensaje')],
  },
};

export const ETIQUETAS: Record<string, string> = {
  nombre: 'Nombre de contacto',
  email: 'Correo electrónico',
  telefono: 'Teléfono',
  nivel: 'Nivel de interés',
  aspirante: 'Nombre del aspirante',
  horario: 'Fecha u horario preferido',
  asunto: 'Asunto',
  mensaje: 'Mensaje',
};

export const TITULOS: Record<TipoSolicitud, string> = {
  informes: 'Solicitud de informes',
  recorrido: 'Solicitud de recorrido',
  contacto: 'Mensaje desde el sitio web',
};
