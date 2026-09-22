"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DiagramFrame } from "./diagram-frame";
import { SimulatedTag } from "@/components/ui/badge";

const NODES = [
  { id: "in", x: 8, y: 50, w: 14, label: "Face crop", note: "Aligned 224 × 224 crops plus the raw frame." },
  { id: "spatial", x: 34, y: 18, w: 22, label: "Spatial · ViT-B/16", note: "A vision transformer looks for blending, texture and lighting inconsistencies." },
  { id: "freq", x: 34, y: 50, w: 22, label: "Frequency · FFT-CNN", note: "A small CNN reads the Fourier spectrum for generator fingerprints." },
  { id: "temporal", x: 34, y: 82, w: 22, label: "Temporal · Transformer", note: "Attends across sampled frames to track identity and texture stability." },
  { id: "fuse", x: 66, y: 50, w: 14, label: "Fusion", note: "Branch embeddings are concatenated and mixed by a gated layer." },
  { id: "cal", x: 88, y: 50, w: 14, label: "Calibrate", note: "Temperature scaling turns raw scores into calibrated probabilities." },
];
const EDGES: [string, string][] = [["in", "spatial"], ["in", "freq"], ["in", "temporal"], ["spatial", "fuse"], ["freq", "fuse"], ["temporal", "fuse"], ["fuse", "cal"]];

export function InferenceDiagram() {
  const [sel, setSel] = useState("spatial");
  const n = (id: string) => NODES.find((x) => x.id === id)!;
  const cur = n(sel);
  return (
    <DiagramFrame label="Reference architecture" meta={<SimulatedTag label="PLANNED · NOT YET TRAINED" />} caption={cur.note}>
      <div className="relative aspect-[16/10] w-full p-2 sm:aspect-[16/8]">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden>
          {EDGES.map(([a, b], i) => {
            const A = n(a), B = n(b);
            const d = `M${A.x + A.w / 2} ${A.y} C${(A.x + B.x) / 2 + 6} ${A.y}, ${(A.x + B.x) / 2 - 6} ${B.y}, ${B.x - B.w / 2} ${B.y}`;
            const on = sel === a || sel === b;
            return (
              <g key={i}>
                <path d={d} fill="none" stroke={on ? "rgb(56 226 255)" : "rgb(46 56 69)"} strokeWidth="0.35" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 1 }} />
                <motion.circle r="0.7" fill="rgb(56 226 255)" style={{ offsetPath: `path("${d}")` } as React.CSSProperties} initial={{ offsetDistance: "0%", opacity: 0 }} animate={{ offsetDistance: "100%", opacity: [0, 1, 1, 0] }} transition={{ duration: 2.6, repeat: Infinity, delay: i * 0.3, ease: "linear" }} />
              </g>
            );
          })}
        </svg>
        {NODES.map((nd) => (
          <button key={nd.id} onClick={() => setSel(nd.id)} aria-pressed={sel === nd.id} className={cn("absolute -translate-x-1/2 -translate-y-1/2 border bg-ink px-2 py-2 text-center font-mono text-[9px] uppercase leading-tight transition-all duration-300 sm:px-3 sm:text-2xs", sel === nd.id ? "border-cyan text-cyan shadow-[0_0_28px_-8px_rgb(var(--cyan))]" : "border-line-strong text-fg-muted hover:border-fg-dim hover:text-fg")} style={{ left: `${nd.x}%`, top: `${nd.y}%`, width: `${nd.w}%`, minWidth: 64 }}>
            {nd.label}
          </button>
        ))}
      </div>
    </DiagramFrame>
  );
}
