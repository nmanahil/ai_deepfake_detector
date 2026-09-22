"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { SimulatedTag } from "@/components/ui/badge";
import { useCountUp } from "@/hooks/use-count-up";
import { DISCLAIMER, VERDICTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { DetectionResult } from "@/types";

const CX = 260;
const CY = 232;
const R = 190;
const START = 135; // degrees, SVG space (clockwise from +x)
const SWEEP = 270;

const rad = (d: number) => (d * Math.PI) / 180;
const pt = (t: number, r: number) => {
  const a = rad(START + t * SWEEP);
  return [CX + Math.cos(a) * r, CY + Math.sin(a) * r] as const;
};
const arc = (t0: number, t1: number, r: number) => {
  const [x0, y0] = pt(t0, r);
  const [x1, y1] = pt(t1, r);
  return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 ${(t1 - t0) * SWEEP > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
};

/** The centrepiece: a huge authenticity indicator on a manipulation-likelihood arc. */
export function VerdictDial({ result }: { result: DetectionResult }) {
  const v = VERDICTS[result.verdict];
  const conf = useCountUp(result.confidence * 100, { duration: 1.8, delay: 0.5 });
  const score = result.manipulationScore;
  const ticks = useMemo(
    () =>
      Array.from({ length: 81 }, (_, i) => {
        const t = i / 80;
        const major = i % 20 === 0;
        const mid = i % 10 === 0;
        const [x0, y0] = pt(t, R + 10);
        const [x1, y1] = pt(t, R + (major ? 26 : mid ? 20 : 15));
        return { i, t, major, d: `M${x0.toFixed(1)} ${y0.toFixed(1)}L${x1.toFixed(1)} ${y1.toFixed(1)}` };
      }),
    [],
  );
  const [nx, ny] = pt(score, R);
  const needleAngle = START + score * SWEEP;

  return (
    <div className="relative mx-auto w-full max-w-[680px] [container-type:inline-size]">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-0 opacity-70" style={{ background: `radial-gradient(closest-side, rgb(${v.rgb} / 0.14), transparent 72%)` }} />
      <svg viewBox="0 0 520 470" className="relative w-full overflow-visible" role="img" aria-label={`Manipulation likelihood gauge at ${(score * 100).toFixed(0)} percent, ${v.subtitle.toLowerCase()}`}>
        <defs>
          <filter id="dial-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ticks */}
        <g>
          {ticks.map((t) => (
            <motion.path
              key={t.i}
              d={t.d}
              stroke={t.t <= score ? `rgb(${v.rgb})` : "rgb(var(--fg-dim))"}
              strokeWidth={t.major ? 1.6 : 1}
              strokeOpacity={t.t <= score ? 0.95 : t.major ? 0.7 : 0.4}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.15 + t.t * 0.9, duration: 0.3 }}
            />
          ))}
        </g>

        {/* zones */}
        <g strokeWidth="3" fill="none" strokeLinecap="butt">
          <path d={arc(0, 0.38, R)} stroke="rgb(var(--signal))" opacity="0.35" />
          <path d={arc(0.385, 0.68, R)} stroke="rgb(var(--amber))" opacity="0.35" />
          <path d={arc(0.685, 1, R)} stroke="rgb(var(--alert))" opacity="0.35" />
        </g>

        {/* value arc */}
        <motion.path
          d={arc(0, Math.max(score, 0.004), R)}
          fill="none"
          stroke={`rgb(${v.rgb})`}
          strokeWidth="4"
          strokeLinecap="round"
          filter="url(#dial-glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.3, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* needle */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 0.5 }}>
          <circle cx={nx} cy={ny} r="7" fill="rgb(var(--ink-0))" stroke={`rgb(${v.rgb})`} strokeWidth="2" />
          <circle cx={nx} cy={ny} r="2.5" fill={`rgb(${v.rgb})`} />
          <g transform={`rotate(${needleAngle} ${CX} ${CY})`}>
            <path d={`M${CX + R - 44} ${CY}L${CX + R - 14} ${CY}`} stroke={`rgb(${v.rgb})`} strokeWidth="1" opacity="0.6" strokeDasharray="1 3" />
          </g>
        </motion.g>

        {/* scale labels */}
        <g className="font-mono" fontSize="9" fill="rgb(var(--fg-dim))" letterSpacing="1.2">
          <text x={pt(0, R + 44)[0]} y={pt(0, R + 44)[1] + 8} textAnchor="middle">LOW</text>
          <text x={pt(0.38, R + 42)[0]} y={pt(0.38, R + 42)[1]} textAnchor="middle">38</text>
          <text x={pt(0.68, R + 42)[0]} y={pt(0.68, R + 42)[1]} textAnchor="middle">68</text>
          <text x={pt(1, R + 44)[0]} y={pt(1, R + 44)[1] + 8} textAnchor="middle">HIGH</text>
        </g>

        {/* inner rings */}
        <circle cx={CX} cy={CY} r={R - 26} fill="none" stroke="rgb(var(--line))" strokeWidth="1" />
        <circle cx={CX} cy={CY} r={R - 40} fill="none" stroke="rgb(var(--line))" strokeWidth="1" strokeDasharray="1 6" />
      </svg>

      {/* centre readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center" style={{ paddingBottom: "8%" }}>
        <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="label-strong">
          Authenticity assessment
        </motion.p>
        <h2 className={cn("display mt-2 flex whitespace-nowrap text-[clamp(26px,9.4cqw,78px)] leading-[0.92]", v.text)} aria-label={v.label}>
          {v.label.split("").map((c, i) => (
            <motion.span
              key={i}
              aria-hidden
              initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.9 + i * 0.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              {c}
            </motion.span>
          ))}
        </h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="mt-3 max-w-[58%] font-mono text-[9px] uppercase leading-relaxed tracking-[0.12em] text-fg sm:text-[11px]">
          {v.subtitle}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.7 }} className="mt-5 flex items-baseline gap-3">
          <span className="label">Confidence</span>
          <span className="tabular font-mono text-xl font-medium text-fg sm:text-3xl">{conf}%</span>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="relative mt-2 flex flex-col items-center gap-3 px-4 text-center">
        {result.simulated && <SimulatedTag label="SIMULATED RESULT · DEMO ENGINE" />}
        <p className="text-pretty max-w-md text-[13px] leading-relaxed text-fg-muted">{DISCLAIMER}</p>
      </motion.div>
    </div>
  );
}
