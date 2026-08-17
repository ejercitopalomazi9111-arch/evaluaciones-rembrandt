/**
 * Separador diagonal azul/rojo. Es el gesto del pie de la papelería oficial
 * convertido en el ritmo del sitio. Puramente decorativo.
 */
export function BandaDiagonal({
  invertida = false,
  fondo = 'bg-hueso',
}: {
  invertida?: boolean;
  fondo?: string;
}) {
  return (
    <div aria-hidden="true" className={`relative h-10 overflow-hidden sm:h-16 ${fondo}`}>
      <div
        className="absolute inset-0 bg-azul"
        style={{
          clipPath: invertida
            ? 'polygon(0 0, 34% 0, 8% 100%, 0 100%)'
            : 'polygon(0 100%, 26% 100%, 52% 0, 26% 0)',
        }}
      />
      <div
        className="absolute inset-0 bg-rojo"
        style={{
          clipPath: invertida
            ? 'polygon(34% 0, 46% 0, 20% 100%, 8% 100%)'
            : 'polygon(52% 0, 64% 0, 38% 100%, 26% 100%)',
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-px"
        style={{
          background: 'linear-gradient(90deg, var(--color-azul) 0 45%, var(--color-rojo) 45%)',
        }}
      />
    </div>
  );
}
