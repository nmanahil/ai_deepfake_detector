"use client";

import { motion } from "framer-motion";

const ticks = (r: number, n: number, len: number) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const long = i % 5 === 0;
    const l = long ? len * 1.9 : len;
    return `M${(200 + Math.cos(a) * r).toFixed(2)} ${(200 + Math.sin(a) * r).toFixed(2)}L${(200 + Math.cos(a) * (r - l)).toFixed(2)} ${(200 + Math.sin(a) * (r - l)).toFixed(2)}`;
  }).join("");

/** Concentric instrument rings — the "lens" of the evidence intake chamber. */
export function ChamberRings({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 400 400" className="size-full" aria-hidden>
      <defs>
        <radialGradient id="ch-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="rgb(56 226 255)" stopOpacity={active ? 0.16 : 0.05} />
          <stop offset="1" stopColor="rgb(56 226 255)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ch-sweep" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="rgb(56 226 255)" stopOpacity="0" />
          <stop offset="1" stopColor="rgb(56 226 255)" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <circle cx="200" cy="200" r="200" fill="url(#ch-glow)" />
      <motion.g style={{ originX: "200px", originY: "200px" }} animate={{ rotate: 360 }} transition={{ duration: active ? 14 : 60, ease: "linear", repeat: Infinity }}>
        <path d={ticks(186, 120, 4)} stroke="rgb(var(--fg-dim))" strokeWidth="0.8" />
      </motion.g>
      <motion.g style={{ originX: "200px", originY: "200px" }} animate={{ rotate: -360 }} transition={{ duration: active ? 22 : 90, ease: "linear", repeat: Infinity }}>
        <circle cx="200" cy="200" r="158" fill="none" stroke="rgb(var(--line-strong))" strokeWidth="1" strokeDasharray="2 7" />
        <circle cx="200" cy="200" r="158" fill="none" stroke="rgb(var(--cyan))" strokeWidth="1.4" strokeDasharray="30 966" strokeLinecap="round" opacity={active ? 1 : 0.5} />
      </motion.g>
      <circle cx="200" cy="200" r="128" fill="none" stroke="rgb(var(--line-strong))" strokeWidth="1" />
      <motion.g style={{ originX: "200px", originY: "200px" }} animate={{ rotate: 360 }} transition={{ duration: active ? 4 : 11, ease: "linear", repeat: Infinity }}>
        <path d="M200 200 L200 72 A128 128 0 0 1 328 200 Z" fill="url(#ch-sweep)" opacity={active ? 0.32 : 0.14} style={{ transformOrigin: "200px 200px" }} transform="rotate(-90 200 200)" />
        <line x1="200" y1="200" x2="200" y2="72" stroke="rgb(var(--cyan))" strokeWidth="1" opacity={active ? 0.9 : 0.5} transform="rotate(-90 200 200)" />
      </motion.g>
      <circle cx="200" cy="200" r="86" fill="none" stroke="rgb(var(--line-strong))" strokeWidth="1" strokeDasharray="1 5" />
      <path d="M200 96v16M200 288v16M96 200h16M288 200h16" stroke="rgb(var(--fg-muted))" strokeWidth="1" />
      <path d="M186 200h28M200 186v28" stroke="rgb(var(--cyan))" strokeWidth="1" opacity="0.7" />
    </svg>
  );
}
