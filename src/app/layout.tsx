import type { Metadata, Viewport } from 'next';
import { Archivo, JetBrains_Mono } from 'next/font/google';
import './globals.css';

import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { BarraAccionMovil } from '@/components/layout/BarraAccionMovil';
import { JsonLd } from '@/components/ui/primitivas';
import { CONTACTO, INSTITUCION, SEDES } from '@/content/institucion';
import { SITE_URL } from '@/content/seo';

/**
 * Archivo: grotesca variable con eje de ancho. Los títulos van en 112–115% de
 * ancho, que es lo que da la voz condensada-ancha de la papelería institucional.
 * JetBrains Mono: etiquetas técnicas — el eje "Programación" del instituto.
 * Ambas se auto-hospedan, así que el navegador nunca llama a Google.
 */
const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  display: 'swap',
  variable: '--fuente-archivo',
  preload: true,
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--fuente-mono',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${INSTITUCION.nombreLegal} — Preescolar, Primaria, Secundaria y Preparatoria`,
    template: `%s · ${INSTITUCION.nombreCorto}`,
  },
  description:
    'Instituto particular, laico, mixto y bilingüe en Col. Satélite, Querétaro. De preescolar a preparatoria, con Bachillerato Tecnológico DGETI especialidad en Programación.',
  applicationName: INSTITUCION.nombreLegal,
  authors: [{ name: INSTITUCION.nombreLegal }],
  creator: INSTITUCION.nombreLegal,
  formatDetection: { telephone: true, address: true, email: true },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0b0e1a',
  colorScheme: 'light',
  viewportFit: 'cover',
  width: 'device-width',
  initialScale: 1,
};

const ORGANIZACION = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: INSTITUCION.nombreLegal,
  alternateName: INSTITUCION.nombreCorto,
  slogan: INSTITUCION.lema,
  url: SITE_URL,
  logo: `${SITE_URL}/marca/escudo.png`,
  telephone: CONTACTO.telefonoE164,
  email: CONTACTO.email,
  sameAs: [CONTACTO.instagram.url, CONTACTO.facebook.url],
  address: SEDES.map((s) => ({
    '@type': 'PostalAddress',
    streetAddress: s.calle,
    addressLocality: s.ciudad,
    addressRegion: s.estado,
    postalCode: s.cp,
    addressCountry: 'MX',
  })),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX" className={`${archivo.variable} ${mono.variable}`}>
      <body className="flex min-h-[100dvh] flex-col pb-14 lg:pb-0">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-200 focus:bg-tinta focus:px-5 focus:py-3 focus:font-mono focus:text-xs focus:tracking-widest focus:text-white focus:uppercase"
        >
          Saltar al contenido
        </a>
        <div id="raiz-sitio" className="flex min-h-[100dvh] flex-col">
          <SiteHeader />
          <main id="contenido" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </div>
        <BarraAccionMovil />
        <JsonLd data={ORGANIZACION} />
      </body>
    </html>
  );
}
