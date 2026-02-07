import { Container } from '@ui';
import { FooterSection, PageContentSection } from '@sections';

export interface PageScreenProps {
  title: string;
  body: string;
}

export function PageScreen({ title, body }: PageScreenProps) {
  return (
    <Container>
      <PageContentSection title={title} body={body} />
      <FooterSection />
    </Container>
  );
}
