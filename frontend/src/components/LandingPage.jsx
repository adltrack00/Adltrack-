import React from "react";
import GlobeScrollDemo, { CaregiversSection } from "./ui/landing-page";
import { CoreFeaturesSection }  from "./CoreFeaturesSection";
import { ServicesSection }      from "./ServicesSection";
import { DualFeatureSection }   from "./DualFeatureSection";
import { APIFeaturesSection }   from "./APIFeaturesSection";
import { StickyFeaturesSection} from "./StickyFeaturesSection";
import AboutSection2            from "./ui/about-section-2";
import { CTAFAQFooterSection }  from "./CTAFAQFooterSection";
import Navbar                   from "./Navbar";

export function LandingPage({ onNavigateToAuth }) {
  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", position: "relative" }}>
      {/* Top navigation bar */}
      <Navbar onNavigateToAuth={onNavigateToAuth} />
      {/* Hero — fills remaining viewport below navbar */}
      <GlobeScrollDemo onNavigateToAuth={onNavigateToAuth} />

      {/* White background + dark text resets the hero's body theme for all sections below */}
      <div style={{ background: "#ffffff", color: "#0f172a" }}>
        <CoreFeaturesSection onNavigateToAuth={onNavigateToAuth} />
        <CaregiversSection />
        <AboutSection2 />
        <ServicesSection />
        <DualFeatureSection />
        <APIFeaturesSection />
        <StickyFeaturesSection />
        <CTAFAQFooterSection onNavigateToAuth={onNavigateToAuth} />
      </div>
    </div>
  );
}

export default LandingPage;
