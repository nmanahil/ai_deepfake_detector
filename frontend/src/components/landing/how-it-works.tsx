"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { PIPELINE } from "@/lib/constants";
import { SectionHead } from "./reveal";

const COPY = [
  "The file is hashed, probed and colour-normalised so every later observation ties back to exact bytes.",
  "Representative frames are sampled across the timeline, always keeping scene changes.",
  "Faces are detected, landmarked and aligned so boundary comparisons are like-for-like.",
  "Texture, blending and compression residue are inspected for regions that break the camera’s fingerprint.",
  "Identity and texture stability are tracked frame to frame for discontinuities.",
  "The Fourier spectrum is searched for periodic fingerprints left by image generators.",
  "Independent model branches score the evidence; outputs are fused and calibrated.",
  "Signals are weighed into one assessment, with every contributing observation kept attached.",
];

export function HowItWorks() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const h = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return (
    <section id="how-it-works" aria-labelledby="hiw" className="relative border-b border-line py-24 sm:py-32">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-8">
        <SectionHead index="02" label="How it works" title={<span id="hiw">From pixels<br />to evidence.</span>} lead="Eight stages, each one visible in the workspace. Nothing is hidden behind a single score." />
        <ol ref={ref} className="relative mt-16 border-t border-line">
          <motion.span aria-hidden style={{ scaleY: h }} className="absolute bottom-0 left-0 top-0 hidden w-px origin-top bg-cyan shadow-[0_0_10px_rgb(var(--cyan))] sm:block" />
          {PIPELINE.map((s, i) => (
            <motion.li key={s.id} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.8 }} className="group relative border-b border-line">
              <Link href={`/technology#s${i + 1}`} className="grid items-baseline gap-x-8 gap-y-2 px-0 py-7 transition-colors hover:bg-ink-1/70 sm:grid-cols-[120px_minmax(0,1fr)_minmax(0,1.1fr)_28px] sm:px-6 sm:py-9">
                <span className="font-mono text-sm text-cyan sm:text-base">{s.code}</span>
                <span className="display text-[clamp(28px,3.6vw,48px)] uppercase transition-transform duration-500 ease-expo group-hover:translate-x-2">{s.label}</span>
                <span className="text-pretty text-[14.5px] leading-relaxed text-fg-muted">{COPY[i]}</span>
                <ArrowUpRight className="hidden size-5 text-fg-dim transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan sm:block" strokeWidth={1.4} />
              </Link>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
