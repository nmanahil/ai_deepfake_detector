"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { HeroFrame } from "./hero-frame";

const ease = [0.16, 1, 0.3, 1] as const;

function Line({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <span className="block overflow-hidden pb-[0.08em]">
      <motion.span className="block" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 1.1, delay, ease }}>
        {children}
      </motion.span>
    </span>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const frameY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} id="hero" aria-labelledby="hero-title" className="relative isolate overflow-hidden pt-[68px]">
      <div aria-hidden className="bg-grid mask-fade-radial pointer-events-none absolute inset-0 -z-10 opacity-60" />
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[-20%] -z-10 h-[70vh] w-[90vw] -translate-x-1/2 rounded-full bg-cyan/[0.06] blur-[120px]" />

      <div className="mx-auto grid min-h-[calc(100dvh-68px)] max-w-[1360px] items-center gap-14 px-4 pb-16 pt-12 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10 lg:pt-8">
        <motion.div style={{ y: textY, opacity: fade }} className="relative">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.8, ease }} className="mb-8 flex flex-wrap items-center gap-3 font-mono text-2xs uppercase tracking-[0.16em] text-fg-muted">
            <span className="flex items-center gap-2 border border-cyan/30 px-2.5 py-1 text-cyan"><span className="size-1.5 animate-blink rounded-full bg-cyan" />Media forensics</span>
            <span className="text-fg-dim">Can you trust what you’re seeing?</span>
          </motion.div>

          <h1 id="hero-title" className="display text-[clamp(56px,11.5vw,168px)] leading-[0.9] tracking-[-0.035em]">
            <Line delay={0.15}>See through</Line>
            <Line delay={0.28}>
              the <em className="relative italic text-cyan">synthetic</em>.
            </Line>
          </h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.9, ease }} className="text-pretty mt-9 max-w-[560px] text-[17px] leading-relaxed text-fg-muted sm:text-lg">
            AI-powered media forensics that analyzes visual inconsistencies, manipulation artifacts, and synthetic patterns to assess whether digital content can be trusted.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85, duration: 0.9, ease }} className="mt-10 flex flex-wrap items-center gap-3">
            <Button variant="primary" size="lg" asChild>
              <Link href="/analyze">Analyze media <ArrowRight className="transition-transform group-hover/btn:translate-x-1" /></Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <a href="#how-it-works">Explore the technology <ArrowDown /></a>
            </Button>
          </motion.div>

          <motion.dl initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 1 }} className="mt-14 grid max-w-[560px] grid-cols-3 gap-px border border-line bg-line">
            {[["8", "Stage pipeline"], ["5", "Signal classes"], ["3", "Verdict bands"]].map(([v, k]) => (
              <div key={k} className="bg-ink p-4"><dt className="label">{k}</dt><dd className="tabular mt-2 font-mono text-2xl text-fg">{v}</dd></div>
            ))}
          </motion.dl>
        </motion.div>

        <motion.div style={{ y: frameY }} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 1.2, ease }}>
          <HeroFrame />
        </motion.div>
      </div>

      <motion.a href="#demo" aria-label="Scroll to demonstration" style={{ opacity: fade }} className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-fg-dim md:flex">
        Scroll
        <span className="relative h-8 w-px overflow-hidden bg-line-strong"><span className="absolute inset-x-0 top-0 h-3 animate-scan-y bg-cyan" /></span>
      </motion.a>
    </section>
  );
}
