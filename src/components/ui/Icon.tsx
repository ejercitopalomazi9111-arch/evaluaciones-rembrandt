import type { IconName } from '@/content/types';

const PATHS: Record<IconName, React.ReactNode> = {
  escudo: <path d="M12 3 4 6v6c0 4.4 3.4 7.9 8 9 4.6-1.1 8-4.6 8-9V6l-8-3Z" />,
  idioma: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9S14.5 18.3 12 21c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z" />
    </>
  ),
  codigo: <path d="m8 6-5 6 5 6M16 6l5 6-5 6M14 4l-4 16" />,
  laboratorio: (
    <>
      <path d="M9 3v6.5L4 19a1.6 1.6 0 0 0 1.4 2.4h13.2A1.6 1.6 0 0 0 20 19l-5-9.5V3" />
      <path d="M8 3h8M7.2 14h9.6" />
    </>
  ),
  deporte: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18M3 12h18M6 6c3 1.5 9 1.5 12 0M6 18c3-1.5 9-1.5 12 0" />
    </>
  ),
  arte: (
    <>
      <path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.8 1.8-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.8-1.6 1.7-1.6H16a5 5 0 0 0 5-5c0-3.9-4-7.3-9-7.3Z" />
      <circle cx="7.5" cy="11.5" r="1.1" />
      <circle cx="11" cy="7.5" r="1.1" />
      <circle cx="16" cy="9.5" r="1.1" />
    </>
  ),
  reloj: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.2l3.4 2" />
    </>
  ),
  ubicacion: (
    <>
      <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  telefono: (
    <path d="M6.2 3.5h3l1.5 4-2 1.4a12.5 12.5 0 0 0 6.4 6.4l1.4-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.2 5.7a2 2 0 0 1 2-2.2Z" />
  ),
  correo: (
    <>
      <rect x="3" y="5" width="18" height="14" />
      <path d="m3 6.5 9 6.2 9-6.2" />
    </>
  ),
  calendario: (
    <>
      <rect x="3" y="5" width="18" height="16" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  documento: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4M9 12h6M9 16h6" />
    </>
  ),
  libro: (
    <>
      <path d="M4 4.5A2 2 0 0 1 6 3h13v15H6a2 2 0 0 0-2 2z" />
      <path d="M4 18.5A2 2 0 0 1 6 17h13v4H6a2 2 0 0 1-2-2z" />
    </>
  ),
  grupo: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 5.2a3 3 0 0 1 0 5.6M17.5 20a5.5 5.5 0 0 0-2.2-4.4" />
    </>
  ),
  chispa: <path d="M13 2 4 14h6l-1 8 9-12h-6z" />,
  brujula: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
    </>
  ),
  red: (
    <>
      <circle cx="12" cy="5" r="2.4" />
      <circle cx="5" cy="18" r="2.4" />
      <circle cx="19" cy="18" r="2.4" />
      <path d="M12 7.4v4.2M10.2 13.2 6.6 16M13.8 13.2 17.4 16" />
    </>
  ),
  flecha: <path d="M4 12h15m0 0-6-6m6 6-6 6" />,
};

export function Icon({
  name,
  className = 'size-6',
  strokeWidth = 1.7,
}: {
  name: IconName;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
