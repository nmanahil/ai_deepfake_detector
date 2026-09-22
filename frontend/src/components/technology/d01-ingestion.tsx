"use client";

import { motion } from "framer-motion";
import { FileDigit, Fingerprint, ScanSearch, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DiagramFrame } from "./diagram-frame";

const STEPS = [
  { id: "file", label: "File", Icon: FileDigit, out: ["> receive  interview_clip.mov", "  bytes      48,213,507", "  mime       video/quicktime", "  status     accepted"] },
  { id: "hash", label: "SHA-256", Icon: Fingerprint, out: ["> digest    sha-256", "  74210aa48c572176e0b3…72ec02", "  chain      unbroken", "  status     frame hash verified"] },
  { id: "probe", label: "Probe", Icon: ScanSearch, out: ["> probe     container", "  codec      h264 / aac", "  size       1920 × 1080", "  duration   00:24.6  ·  fps 30 (est.)"] },
  { id: "norm", label: "Normalise", Icon: SlidersHorizontal, out: ["> normalise colour", "  space      bt.709 → sRGB", "  range      limited → full", "  status     ready for extraction"] },
];

export function IngestionDiagram() {
  const [i, setI] = useState(0);
  return (
    <DiagramFrame label="Ingestion chain" caption="Every file is fingerprinted and probed before anything else happens, so later evidence can always be tied back to exactly these bytes.">
      <div className="grid gap-px bg-line lg:grid-cols-[1.2fr_1fr]">
        <div className="bg-ink-1 p-5 sm:p-8">
          <div className="relative flex items-start justify-between">
            <div aria-hidden className="absolute left-[8%] right-[8%] top-6 h-px bg-line-strong" />
            <motion.span aria-hidden className="absolute top-[22px] size-1.5 rounded-full bg-cyan shadow-[0_0_12px_rgb(var(--cyan))]" animate={{ left: ["8%", "92%"] }} transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }} />
            {STEPS.map((s, idx) => (
              <button key={s.id} onClick={() => setI(idx)} aria-pressed={i === idx} className="group relative z-10 flex w-1/4 flex-col items-center gap-3">
                <span className={cn("grid size-12 place-items-center border bg-ink transition-all duration-300", i === idx ? "border-cyan text-cyan shadow-[0_0_24px_-6px_rgb(var(--cyan))]" : "border-line-strong text-fg-muted group-hover:border-fg-dim")}>
                  <s.Icon className="size-5" strokeWidth={1.4} />
                </span>
                <span className={cn("font-mono text-2xs uppercase", i === idx ? "text-cyan" : "text-fg-dim")}>{s.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="bg-ink p-5 font-mono text-[12px] leading-relaxed" aria-live="polite">
          <p className="label mb-3">Stage output</p>
          {STEPS[i].out.map((l, n) => (
            <motion.p key={`${i}-${n}`} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: n * 0.08 }} className={cn("whitespace-pre-wrap break-all", l.startsWith(">") ? "text-cyan" : "text-fg-muted")}>{l}</motion.p>
          ))}
        </div>
      </div>
    </DiagramFrame>
  );
}
