'use client';

import { FormShell } from './FormShell';
import { Field, Select, Textarea } from './Campos';
import { NIVELES_OPCIONES } from '@/lib/esquemas';

export function FormularioRecorrido() {
  return (
    <FormShell tipo="recorrido" enviar="Solicitar recorrido">
      {(e, v) => (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field name="nombre" label="Nombre de contacto" required autoComplete="name" error={e.nombre} defaultValue={v.nombre} />
          <Field name="email" label="Correo electrónico" type="email" inputMode="email" autoComplete="email" required error={e.email} defaultValue={v.email} />
          <Field name="telefono" label="Teléfono" type="tel" inputMode="tel" autoComplete="tel" required error={e.telefono} defaultValue={v.telefono} placeholder="442 000 0000" />
          <Select name="nivel" label="Nivel de interés" opciones={NIVELES_OPCIONES} required error={e.nivel} defaultValue={v.nivel} />
          <Field name="aspirante" label="Nombre del aspirante" opcional autoComplete="off" error={e.aspirante} defaultValue={v.aspirante} />
          <Field name="horario" label="Fecha u horario preferido" opcional error={e.horario} defaultValue={v.horario} placeholder="Ej. martes por la mañana" />
          <div className="sm:col-span-2">
            <Textarea name="mensaje" label="Mensaje" opcional error={e.mensaje} defaultValue={v.mensaje} rows={4} />
          </div>
        </div>
      )}
    </FormShell>
  );
}

export function FormularioInformes() {
  return (
    <FormShell tipo="informes" enviar="Solicitar informes">
      {(e, v) => (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field name="nombre" label="Nombre de contacto" required autoComplete="name" error={e.nombre} defaultValue={v.nombre} />
          <Field name="email" label="Correo electrónico" type="email" inputMode="email" autoComplete="email" required error={e.email} defaultValue={v.email} />
          <Field name="telefono" label="Teléfono" type="tel" inputMode="tel" autoComplete="tel" required error={e.telefono} defaultValue={v.telefono} placeholder="442 000 0000" />
          <Select name="nivel" label="Nivel de interés" opciones={NIVELES_OPCIONES} opcional error={e.nivel} defaultValue={v.nivel} />
          <div className="sm:col-span-2">
            <Textarea name="mensaje" label="¿Qué te gustaría saber?" opcional error={e.mensaje} defaultValue={v.mensaje} rows={4} />
          </div>
        </div>
      )}
    </FormShell>
  );
}

export function FormularioContacto() {
  return (
    <FormShell tipo="contacto" enviar="Enviar mensaje">
      {(e, v) => (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field name="nombre" label="Nombre" required autoComplete="name" error={e.nombre} defaultValue={v.nombre} />
          <Field name="email" label="Correo electrónico" type="email" inputMode="email" autoComplete="email" required error={e.email} defaultValue={v.email} />
          <Field name="telefono" label="Teléfono" type="tel" inputMode="tel" autoComplete="tel" opcional error={e.telefono} defaultValue={v.telefono} />
          <Field name="asunto" label="Asunto" required error={e.asunto} defaultValue={v.asunto} />
          <div className="sm:col-span-2">
            <Textarea name="mensaje" label="Mensaje" required error={e.mensaje} defaultValue={v.mensaje} rows={6} />
          </div>
        </div>
      )}
    </FormShell>
  );
}
