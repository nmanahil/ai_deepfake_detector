import { Architecture } from "@/components/landing/architecture";
import { Capabilities } from "@/components/landing/capabilities";
import { CTA } from "@/components/landing/cta";
import { ForensicLab } from "@/components/landing/forensic-lab";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LandingNav } from "@/components/landing/landing-nav";
import { LiveDemo } from "@/components/landing/live-demo";
import { SectionHud } from "@/components/landing/section-hud";
import { Ticker } from "@/components/landing/ticker";
import { Trust } from "@/components/landing/trust";

export default function Landing() {
  return (
    <>
      <LandingNav />
      <SectionHud />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <Ticker />
        <LiveDemo />
        <HowItWorks />
        <Capabilities />
        <ForensicLab />
        <Architecture />
        <Trust />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
