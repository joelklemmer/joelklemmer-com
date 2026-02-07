import { Container } from '@ui';
import { FooterSection, WelcomeSection } from '@sections';

export function HomeScreen() {
  return (
    <div>
      <Container>
        <WelcomeSection />
        <FooterSection />
      </Container>
    </div>
  );
}
