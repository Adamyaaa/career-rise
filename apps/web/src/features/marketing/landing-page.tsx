import { HeroSection } from "./components/hero-section";
import { FeaturesSection } from "./components/features-section";
import { HowItWorksSection } from "./components/how-it-works-section";
import { CtaSection } from "./components/cta-section";

export function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CtaSection />
    </>
  );
}
