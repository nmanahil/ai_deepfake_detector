"use client";

import { useMemo, useState } from "react";
import { specimenDataUrl } from "@/lib/specimen";
import { cn } from "@/lib/utils";
import { DiagramFrame } from "./diagram-frame";

const CELLS = 24;
const RATES = [
  { label: "1 / 8", step: 8 },
  { label: "1 / 4", step: 4 },
  { label: "1 / 2", step: 2 },
  { label: "ALL", step: 1 },
];

export function ExtractionDiagram() {
  const [rate, setRate] = useState(1);
  const frames = useMemo(() => Array.from({ length: CELLS }, (_, i) => specimenDataUrl(31, { t: i * 0.4, zoom: 1.25 })), []);
  const step = RATES[rate].step;
  const picked = Array.from({ length: CELLS }, (_, i) => i % step === 0).filter(Boolean).length;
  return (
    <DiagramFrame label="Temporal sampling" caption="Analysing every frame is rarely necessary. The sampler picks frames at a chosen density, always including scene changes, so cost stays predictable.">
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8 lg:grid-cols-12">
          {frames.map((src, i) => {
            const on = i % step === 0;
            return (
              <div key={i} className={cn("relative aspect-[4/5] overflow-hidden border transition-all duration-500", on ? "border-cyan" : "border-line opacity-30 grayscale")}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="size-full object-cover" loading="lazy" />
                <span className="absolute bottom-0.5 left-1 font-mono text-[8px] text-white/80">{String(i * 10).padStart(3, "0")}</span>
                {on && <span className="absolute right-1 top-1 size-1 bg-cyan" />}
              </div>
            );
          })}
        </div>
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div role="radiogroup" aria-label="Sampling density" className="flex gap-1.5">
            {RATES.map((r, i) => (
              <button key={r.label} role="radio" aria-checked={rate === i} onClick={() => setRate(i)} className={cn("h-8 border px-3 font-mono text-2xs uppercase transition-colors", rate === i ? "border-cyan/60 bg-cyan/10 text-cyan" : "border-line-strong text-fg-muted hover:text-fg")}>{r.label}</button>
            ))}
          </div>
          <p className="font-mono text-xs uppercase text-fg-muted"><span className="tabular text-cyan">{picked}</span> of {CELLS} frames sampled · ≈ {Math.round((picked / CELLS) * 100)}% of compute</p>
        </div>
      </div>
    </DiagramFrame>
  );
}
