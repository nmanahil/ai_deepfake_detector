"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "./reveal";

export function CTA() {
  return (
    <section id="cta" aria-labelledby="cta-t" className="relative isolate overflow-hidden py-28 sm:py-44">
      <div aria-hidden className="bg-grid mask-fade-radial absolute inset-0 -z-10 opacity-60" />
      <div aria-hidden className="absolute left-1/2 top-1/2 -z-10 h-[50vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan/[0.07] blur-[110px]" />
      <div className="mx-auto max-w-[1100px] px-4 text-center sm:px-8">
        <Reveal><p className="label-strong">Begin an analysis</p></Reveal>
        <Reveal delay={0.08}><h2 id="cta-t" className="display mt-6 text-[clamp(48px,9vw,132px)] tracking-[-0.035em]">Can you trust<br />what you’re <em className="text-cyan">seeing</em>?</h2></Reveal>
        <Reveal delay={0.18} className="mt-12 flex flex-wrap justify-center gap-3">
          <Button variant="primary" size="lg" asChild><Link href="/analyze">Analyze media <ArrowRight className="transition-transform group-hover/btn:translate-x-1" /></Link></Button>
          <Button variant="secondary" size="lg" asChild><Link href="/technology">Explore the technology</Link></Button>
        </Reveal>
      </div>
    </section>
  );
}
