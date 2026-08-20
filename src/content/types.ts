/**
 * Tipos de la capa de contenido.
 *
 * Regla del proyecto: lo que la escuela no ha confirmado NO se inventa.
 * Por eso casi todo lo no verificado es opcional — si el dato falta, la
 * sección simplemente no se renderiza. La lista de huecos vive en
 * `pendientes.ts` y se puede consultar en /pendientes durante el desarrollo.
 */

export type NivelId = 'preescolar' | 'primaria' | 'secundaria' | 'preparatoria';
export type Acento = 'azul' | 'rojo' | 'ambar';
export type Ratio = '16/9' | '4/3' | '1/1' | '3/4';

export type IconName =
  | 'escudo' | 'idioma' | 'codigo' | 'laboratorio' | 'deporte' | 'arte'
  | 'reloj' | 'ubicacion' | 'telefono' | 'correo' | 'calendario' | 'documento'
  | 'libro' | 'grupo' | 'chispa' | 'brujula' | 'red' | 'flecha';

/**
 * Hueco explícito para una fotografía real del plantel.
 * Sin `src` el sitio dibuja un marcador honesto; nunca una foto inventada.
 */
export interface MediaSlot {
  readonly id: string;
  readonly alt: string;
  readonly ratio: Ratio;
  /** Indicación de encuadre para quien tome la foto. */
  readonly nota: string;
  /** '/fotos/<id>.jpg' cuando la escuela la entregue. */
  readonly src?: string;
  /** Sólo en la imagen LCP de la página. En Next 16 se mapea a `preload`. */
  readonly prioridad?: boolean;
}

export interface Destacado {
  readonly titulo: string;
  readonly texto: string;
  readonly icono: IconName;
}

export interface DatoClave {
  readonly etiqueta: string;
  readonly valor: string;
}

export interface Sede {
  readonly id: 'principal' | 'preescolar';
  readonly nombre: string;
  readonly calle: string;
  readonly colonia?: string;
  readonly ciudad: string;
  readonly estado: string;
  readonly cp: string;
  readonly mapsUrl: string;
  readonly niveles: readonly NivelId[];
}

export interface Nivel {
  readonly id: NivelId;
  readonly slug: string;
  readonly indice: '01' | '02' | '03' | '04';
  readonly nombre: string;
  readonly nombreLargo?: string;
  readonly edades: string;
  readonly claim: string;
  readonly descripcion: string;
  readonly datosClave: readonly DatoClave[];
  readonly destacados: readonly Destacado[];
  readonly materias?: readonly string[];
  readonly sedeId: Sede['id'];
  readonly acento: Acento;
  readonly hero: MediaSlot;
  readonly galeria: readonly MediaSlot[];
}

export interface Contacto {
  readonly telefonoDisplay: string;
  readonly telefonoE164: string;
  readonly email: string;
  readonly instagram: { readonly handle: string; readonly url: string };
  readonly facebook: { readonly nombre: string; readonly url: string };
}

export interface Institucion {
  readonly nombreCorto: string;
  readonly nombreLegal: string;
  readonly lema: string;
  readonly valores: readonly { readonly nombre: string; readonly texto: string }[];
  readonly caracteristicas: readonly string[];
  readonly mision: string;
  readonly vision: string;
  readonly direccionAcademica: { readonly nombre: string; readonly cargo: string };
}

export interface Especialidad {
  readonly organismo: string;
  readonly nombre: string;
  readonly resumen: string;
  readonly competencias: readonly Destacado[];
  readonly perfilEgreso: readonly string[];
  readonly nota: string;
}

export interface PasoAdmision {
  readonly numero: '01' | '02' | '03' | '04' | '05';
  readonly titulo: string;
  readonly texto: string;
  readonly accion?: { readonly label: string; readonly href: string };
}

export interface PreguntaFrecuente {
  readonly pregunta: string;
  readonly respuesta: string;
}

export interface SeccionLegal {
  readonly id: string;
  readonly titulo: string;
  readonly parrafos: readonly string[];
  readonly lista?: readonly string[];
}

export interface EnlaceNav {
  readonly label: string;
  readonly href: string;
  readonly descripcion?: string;
  readonly hijos?: readonly EnlaceNav[];
}

export interface Pendiente {
  readonly campo: string;
  readonly pregunta: string;
  readonly bloquea: 'publicación' | 'sección';
}
