"use client";

import { motion } from "framer-motion";
import { SectionHead } from "./reveal";

const G = { stroke: "currentColor", fill: "none", strokeWidth: 1.2 } as const;
const glyphs: Record<string, React.ReactNode> = {
  face: <g {...G}><ellipse cx="24" cy="24" rx="12" ry="16" /><path d="M16 21h5M27 21h5M24 22v7M19 34q5 3 10 0" /><path d="M6 8v-2h2M40 6h2v2M42 40v2h-2M8 42H6v-2" /></g>,
  texture: <g {...G}>{Array.from({ length: 6 }, (_, i) => <path key={i} d={`M6 ${10 + i * 6}q6 -4 12 0t12 0t12 0`} opacity={1 - i * 0.14} />)}</g>,
  temporal: <g {...G}>{[0, 1, 2, 3].map((i) => <rect key={i} x={6 + i * 10} y={14 + (i % 2) * 4} width="8" height="18" />)}<path d="M6 40h36" strokeDasharray="2 3" /></g>,
  freq: <g {...G}><path d="M6 40V8M6 40h36" />{[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${12 + i * 5.6} 40V${34 - Math.abs(Math.sin(i * 1.3)) * 22}`} />)}</g>,
  compress: <g {...G}>{Array.from({ length: 4 }, (_, r) => Array.from({ length: 4 }, (_, c) => <rect key={`${r}${c}`} x={8 + c * 8.5} y={8 + r * 8.5} width="7" height="7" opacity={(r * 4 + c) % 5 === 0 ? 1 : 0.35} />))}</g>,
  explain: <g {...G}><path d="M6 14h36M6 24h26M6 34h32" /><circle cx="40" cy="24" r="3" /><circle cx="36" cy="34" r="3" /></g>,
};

const CAPS = [
  { g: "face", t: "Face manipulation", d: "Detects blending seams, boundary discontinuities and lighting mismatches around swapped or re-rendered faces." },
  { g: "texture", t: "Synthetic texture", d: "Compares skin and surface micro-texture against the statistics of natural camera capture." },
  { g: "temporal", t: "Temporal coherence", d: "Follows identity and motion across frames to surface instability that single images cannot show." },
  { g: "freq", t: "Frequency fingerprints", d: "Searches the Fourier spectrum for periodic patterns characteristic of generative upsampling." },
  { g: "compress", t: "Compression forensics", d: "Maps error levels to find regions with a different processing history from their surroundings." },
  { g: "explain", t: "Explainable evidence", d: "Every assessment ships with the signals, regions and frames that produced it, in plain language." },
];

export function Capabilities() {
  return (
    <section id="capabilities" aria-labelledby="cap" className="relative border-b border-line py-24 sm:py-32">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-8">
        <SectionHead index="03" label="Detection capabilities" title={<span id="cap">Six ways of<br />looking closer.</span>} />
        <ul className="mt-16 grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-3">
          {CAPS.map((c, i) => (
            <motion.li key={c.t} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.8, delay: (i % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }} className="group relative border-b border-r border-line p-7 transition-colors duration-500 hover:bg-ink-1 sm:p-9">
              <span aria-hidden className="absolute left-0 top-0 h-px w-0 bg-cyan transition-all duration-700 ease-expo group-hover:w-full" />
              <div className="flex items-start justify-between">
                <svg viewBox="0 0 48 48" className="size-14 text-fg-muted transition-colors duration-500 group-hover:text-cyan" aria-hidden>{glyphs[c.g]}</svg>
                <span className="font-mono text-2xs text-fg-dim">0{i + 1}</span>
              </div>
              <h3 className="display mt-10 text-[34px]">{c.t}</h3>
              <p className="text-pretty mt-3 text-[14.5px] leading-relaxed text-fg-muted">{c.d}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
