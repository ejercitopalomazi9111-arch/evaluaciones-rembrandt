import type { ReactNode } from 'react';
import { Container, Section } from '@/components/ui/primitivas';

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <Section>
      <Container ancho="estrecho">{children}</Container>
    </Section>
  );
}
