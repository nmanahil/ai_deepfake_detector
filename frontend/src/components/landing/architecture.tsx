"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Segmented } from "@/components/ui/segmented";
import { cn } from "@/lib/utils";
import { SectionHead } from "./reveal";

type Mode = "today" | "target";

const CLIENT = { t: "Next.js client", d: "TypeScript · Tailwind · Framer Motion" };
const TODAY = [
  { t: "DetectionProvider", d: "analyzeMedia · getAnalysisStatus · getAnalysisResult", seam: true },
  { t: "Mock engine", d: "In-browser · simulated verdicts · real pixel layers" },
];
const TARGET = [
  { t: "DetectionProvider", d: "Same interface — swapped by one env var", seam: true },
  { t: "FastAPI gateway", d: "Auth · validation · job orchestration" },
  { t: "Job queue", d: "Async analysis · status polling" },
  { t: "Workers", d: "FFmpeg · OpenCV · PyTorch", multi: ["FFmpeg", "OpenCV", "PyTorch"] },
  { t: "Model registry", d: "ViT · Xception · FFT-CNN · temporal transformer" },
];

const CODE = `interface DetectionProvider {
  analyzeMedia(file: File): Promise<{ id: string }>;
  getAnalysisStatus(id: string): Promise<AnalysisStatus>;
  getAnalysisResult(id: string): Promise<Analysis>;
  cancelAnalysis(id: string): Promise<void>;
}`;

function Node({ t, d, seam, multi, active }: { t: string; d: string; seam?: boolean; multi?: string[]; active?: boolean }) {
  return (
    <div className={cn("relative border bg-ink p-4 transition-colors", seam ? "border-cyan/50" : "border-line-strong", active && "shadow-[0_0_30px_-10px_rgb(var(--cyan))]")}>
      <p className={cn("font-mono text-[11px] uppercase tracking-[0.1em]", seam ? "text-cyan" : "text-fg")}>{t}</p>
      <p className="mt-1.5 text-[12.5px] leading-snug text-fg-muted">{d}</p>
      {multi && <div className="mt-3 flex flex-wrap gap-1.5">{multi.map((m) => <span key={m} className="border border-line-strong px-1.5 py-0.5 font-mono text-[9px] uppercase text-fg-muted">{m}</span>)}</div>}
    </div>
  );
}

function Link() {
  return (
    <div aria-hidden className="relative mx-auto h-8 w-px bg-line-strong">
      <motion.span className="absolute left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-cyan" animate={{ top: ["0%", "100%"], opacity: [0, 1, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }} />
    </div>
  );
}

export function Architecture() {
  const [mode, setMode] = useState<Mode>("target");
  const nodes = mode === "today" ? TODAY : TARGET;
  return (
    <section id="architecture" aria-labelledby="arch-t" className="relative border-b border-line py-24 sm:py-32">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-8">
        <SectionHead index="05" label="Technology architecture" title={<span id="arch-t">Built to plug<br />a real model in.</span>} lead="The interface talks to one contract. Today it is satisfied by an in-browser demo engine; the production target is a Python service, with no UI changes." />
        <div className="mt-14 grid grid-cols-[minmax(0,1fr)] gap-px border border-line bg-line lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="bg-ink-1 p-6 sm:p-10">
            <Segmented label="Architecture mode" value={mode} onChange={setMode} options={[{ value: "today", label: "Today" }, { value: "target", label: "Production target" }]} />
            <div className="mt-8 max-w-md">
              <Node {...CLIENT} />
              <AnimatePresence mode="popLayout" initial={false}>
                {nodes.map((n, i) => (
                  <motion.div key={`${mode}-${n.t}`} layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.4, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}>
                    <Link />
                    <Node {...n} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
          <div className="flex flex-col gap-10 bg-ink p-6 sm:p-10">
            <div>
              <p className="label mb-4">The contract</p>
              <pre className="overflow-x-auto border border-line bg-ink-1 p-5 font-mono text-[12px] leading-[1.75] text-fg-muted"><code>{CODE}</code></pre>
            </div>
            <ul className="space-y-3 text-[14px] leading-relaxed text-fg-muted">
              {["Typed models for Media, Analysis, DetectionResult, Evidence, FrameAnalysis, Heatmap and ModelMetadata.", "Results are always labelled simulated while the mock engine is active.", "Swap engines with NEXT_PUBLIC_DETECTION_PROVIDER=http."].map((t) => (
                <li key={t} className="flex gap-3"><span aria-hidden className="mt-2 size-1 shrink-0 rotate-45 bg-cyan" />{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
