import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Instituto Rembrandt · Examen de Admisión a Bachillerato",
  description:
    "Examen de admisión a Bachillerato del Instituto Rembrandt de Querétaro. Los aspirantes presentan su examen y la Coordinación revisa los resultados.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
