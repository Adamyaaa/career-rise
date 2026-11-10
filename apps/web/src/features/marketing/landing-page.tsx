import { HeroSection } from "./components/hero-section";
import { RoadmapSection } from "./components/roadmap-section";
import { FeaturesSection } from "./components/features-section";
import { MentorReviewSection } from "./components/mentor-review-section";
import { HowItWorksSection } from "./components/how-it-works-section";
import { CtaSection } from "./components/cta-section";

export function LandingPage() {
  return (
    <>
      <HeroSection />
      <RoadmapSection />
      <FeaturesSection />
      <MentorReviewSection />
      <HowItWorksSection />
      <CtaSection />
    </>
  );
}
