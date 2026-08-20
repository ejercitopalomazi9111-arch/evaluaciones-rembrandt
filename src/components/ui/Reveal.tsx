import type { ReactNode } from 'react';

/**
 * Revelado al entrar en pantalla.
 *
 * Ya no lleva JavaScript propio: `public/lienzo.js` observa todos los
 * `.revelar` con un único IntersectionObserver compartido. Eso lo convierte en
 * Server Component —cero JS enviado al navegador por cada uso— y evita crear un
 * observer por instancia, que era el patrón caro anterior.
 */
export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={`revelar ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
