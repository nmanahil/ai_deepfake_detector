"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ArtifactsDiagram } from "@/components/technology/d04-artifacts";
import { ExtractionDiagram } from "@/components/technology/d02-extraction";
import { FrequencyDiagram } from "@/components/technology/d06-frequency";
import { IngestionDiagram } from "@/components/technology/d01-ingestion";
import { InferenceDiagram } from "@/components/technology/d07-inference";
import { LocalizationDiagram } from "@/components/technology/d03-localization";
import { SynthesisDiagram } from "@/components/technology/d08-synthesis";
import { TemporalDiagram } from "@/components/technology/d05-temporal";
import { PIPELINE } from "@/lib/constants";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { Diagram: IngestionDiagram, lead: "Before any judgement is made, the file is fingerprinted, its container is read and its colour space normalised. Everything that follows is anchored to this exact byte sequence." },
  { Diagram: ExtractionDiagram, lead: "Video is a stream of near-identical frames. The system samples representative ones, always keeping scene changes, so analysis stays fast without skipping the moments that matter." },
  { Diagram: LocalizationDiagram, lead: "Manipulation concentrates around faces. A detector finds each face, landmarks describe its geometry, and an alignment step makes every crop directly comparable." },
  { Diagram: ArtifactsDiagram, lead: "Cameras leave a characteristic noise fingerprint. Synthesised or edited regions often break it — too smooth, too regular, or compressed differently from their surroundings." },
  { Diagram: TemporalDiagram, lead: "Real faces move continuously. Across frames the system tracks identity and texture stability, looking for the small discontinuities that frame-by-frame synthesis can leave." },
  { Diagram: FrequencyDiagram, lead: "In the Fourier domain, image generators can leave periodic fingerprints that are invisible to the eye but obvious in the spectrum." },
  { Diagram: InferenceDiagram, lead: "Independent branches each specialise in one kind of evidence. Their outputs are fused and calibrated so a reported confidence means what it says." },
  { Diagram: SynthesisDiagram, lead: "The final step turns many weak signals into one interpretable assessment, keeping every contributing observation attached so the result is never a black box." },
];

export default function TechnologyPage() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const els = SECTIONS.map((_, i) => document.getElementById(`s${i + 1}`)!).filter(Boolean);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(Number(e.target.id.slice(1)) - 1); });
    }, { rootMargin: "-40% 0px -55% 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <PageHeader
        index="05"
        eyebrow="How the system works"
        title={<>Eight stages from<br />pixels to <em className="not-italic text-cyan">evidence</em>.</>}
        description="Every assessment is the product of a transparent pipeline. Explore each stage — several of these diagrams run real signal processing in your browser."
      />
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-14 lg:px-8 lg:py-14">
        <nav aria-label="Pipeline stages" className="sticky top-14 z-20 -mx-4 border-b border-line bg-ink/95 px-4 backdrop-blur lg:top-10 lg:mx-0 lg:h-fit lg:self-start lg:border-0 lg:bg-transparent lg:px-0 lg:backdrop-blur-none">
          <ol className="no-scrollbar flex gap-1 overflow-x-auto py-2 lg:flex-col lg:gap-0 lg:overflow-visible lg:py-0">
            {PIPELINE.map((s, i) => (
              <li key={s.id} className="shrink-0">
                <a href={`#s${i + 1}`} aria-current={active === i ? "true" : undefined} className={cn("group relative flex items-center gap-3 px-2 py-2 font-mono text-2xs uppercase transition-colors lg:py-2.5", active === i ? "text-fg" : "text-fg-dim hover:text-fg-muted")}>
                  {active === i && <motion.span layoutId="tech-active" className="absolute inset-x-0 bottom-0 h-px bg-cyan lg:inset-y-1 lg:left-0 lg:right-auto lg:h-auto lg:w-px" />}
                  <span className={active === i ? "text-cyan" : ""}>{s.code}</span>
                  <span className="hidden lg:inline">{s.short}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="min-w-0 space-y-20 lg:space-y-28">
          {SECTIONS.map(({ Diagram, lead }, i) => {
            const st = PIPELINE[i];
            return (
              <motion.section key={st.id} id={`s${i + 1}`} className="scroll-mt-32 lg:scroll-mt-16" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
                <div className="mb-7 flex items-start gap-5 sm:gap-8">
                  <span className="font-mono text-6xl font-light leading-none text-transparent sm:text-8xl" style={{ WebkitTextStroke: "1px rgb(var(--cyan) / 0.6)" }}>{st.code}</span>
                  <div className="pt-1 sm:pt-3">
                    <h2 className="display text-[34px] sm:text-5xl">{st.label}</h2>
                    <p className="text-pretty mt-3 max-w-xl text-[15px] leading-relaxed text-fg-muted">{lead}</p>
                  </div>
                </div>
                <Diagram />
              </motion.section>
            );
          })}
        </div>
      </div>
    </>
  );
}
