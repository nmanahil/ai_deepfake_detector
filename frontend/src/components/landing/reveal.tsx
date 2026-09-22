"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Scroll-triggered entrance used across landing sections. */
export function Reveal({ children, delay = 0, y = 28, className, as = "div" }: { children: React.ReactNode; delay?: number; y?: number; className?: string; as?: "div" | "li" | "p" }) {
  const M = motion[as];
  return (
    <M className={cn(className)} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-70px" }} transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </M>
  );
}

export function SectionHead({ index, label, title, lead, align = "left" }: { index: string; label: string; title: React.ReactNode; lead?: React.ReactNode; align?: "left" | "center" }) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      <Reveal>
        <div className={cn("flex items-center gap-3 font-mono text-2xs uppercase tracking-[0.16em] text-fg-dim", align === "center" && "justify-center")}>
          <span className="text-cyan">{index}</span><span aria-hidden className="h-px w-8 bg-line-strong" /><span>{label}</span>
        </div>
      </Reveal>
      <Reveal delay={0.08}><h2 className="display mt-5 text-[clamp(40px,6.4vw,88px)] tracking-[-0.03em]">{title}</h2></Reveal>
      {lead && <Reveal delay={0.16}><p className="text-pretty mt-6 max-w-xl text-[16px] leading-relaxed text-fg-muted sm:text-[17px]">{lead}</p></Reveal>}
    </div>
  );
}
