"use client";

import { useReduce } from "@/hooks/use-reduced-motion";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Corners } from "@/components/ui/corners";
import { SPECIMEN_LANDMARKS, SPECIMEN_POINTS, specimenDataUrl } from "@/lib/specimen";
import { cn } from "@/lib/utils";

const READOUTS = [
  ["FRAME HASH", "VERIFIED"],
  ["FACIAL REGION", "DETECTED"],
  ["LANDMARKS", "34 / 34"],
  ["FREQUENCY SIGNATURE", "SCANNING"],
  ["TEXTURE Δ", "0.82"],
  ["MODEL CONFIDENCE", "91.4%"],
];

function Tag({
  className,
  k,
  v,
  tone = "cyan",
}: {
  className?: string;
  k: string;
  v: string;
  tone?: "cyan" | "amber";
}) {
  return (
    <div
      className={cn(
        "absolute z-20 flex items-center gap-2 border bg-ink/80 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] backdrop-blur-sm",
        tone === "cyan" ? "border-cyan/30" : "border-amber/40",
        className,
      )}
    >
      <span className="text-fg-dim">{k}</span>
      <span className={tone === "cyan" ? "text-cyan" : "text-amber"}>{v}</span>
    </div>
  );
}

/** The hero centrepiece: an abstract portrait under continuous forensic scan. */
export function HeroFrame() {
  const reduce = useReduce();
  const [tick, setTick] = useState(0);
  const src = useMemo(() => specimenDataUrl(3), []);
  useEffect(() => {
    // Reduced motion: hold a single, fully-annotated frame instead of cycling.
    if (reduce) {
      setTick(7);
      return;
    }
    const t = window.setInterval(() => setTick((n) => (n + 1) % 12), 1000);
    return () => window.clearInterval(t);
  }, [reduce]);
  const lm = Object.values(SPECIMEN_LANDMARKS);
  const readout = READOUTS[tick % READOUTS.length];

  return (
    <div className="relative mx-auto w-full max-w-[440px] lg:max-w-none">
      {/* outer coordinate rails */}
      <div aria-hidden className="absolute -inset-6 hidden sm:block">
        <div className="absolute inset-x-0 top-0 flex justify-between font-mono text-[8px] text-fg-dim">
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i}>{String(i * 50).padStart(3, "0")}</span>
          ))}
        </div>
        <div className="absolute inset-y-0 left-0 flex flex-col justify-between font-mono text-[8px] text-fg-dim">
          {Array.from({ length: 11 }, (_, i) => (
            <span key={i}>{String(i * 50).padStart(3, "0")}</span>
          ))}
        </div>
      </div>

      <div className="relative aspect-[4/5] overflow-hidden border border-line-strong bg-ink-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Abstract portrait under forensic analysis"
          className="absolute inset-0 size-full object-cover"
        />
        <div aria-hidden className="scanlines absolute inset-0 opacity-60" />
        <div aria-hidden className="bg-grid-fine absolute inset-0 opacity-25" />

        <svg viewBox="0 0 400 500" className="absolute inset-0 size-full" aria-hidden>
          <AnimatePresence>
            {tick >= 2 && tick < 11 && (
              <motion.g
                key="box"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.rect
                  x="106"
                  y="86"
                  width="188"
                  height="262"
                  fill="none"
                  stroke="rgb(56 226 255)"
                  strokeWidth="1.2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                />
                {[
                  [106, 86],
                  [294, 86],
                  [106, 348],
                  [294, 348],
                ].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r="3" fill="rgb(56 226 255)" />
                ))}
                <text
                  x="106"
                  y="78"
                  fontSize="10"
                  fill="rgb(56 226 255)"
                  fontFamily="var(--font-mono)"
                  letterSpacing="1"
                >
                  SUBJECT 01 · 99.2%
                </text>
              </motion.g>
            )}
            {tick >= 3 && tick < 11 && (
              <motion.g
                key="lm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {lm.map((d, i) => (
                  <motion.path
                    key={i}
                    d={d}
                    fill="none"
                    stroke="rgb(56 226 255)"
                    strokeWidth="1"
                    strokeOpacity="0.85"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.9, delay: i * 0.09 }}
                  />
                ))}
                {SPECIMEN_POINTS.map(([x, y], i) => (
                  <motion.circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="1.8"
                    fill="rgb(56 226 255)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.02 }}
                  />
                ))}
              </motion.g>
            )}
            {tick >= 6 && tick < 10 && (
              <motion.g
                key="heat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
              >
                <defs>
                  <radialGradient id="hero-heat">
                    <stop offset="0" stopColor="rgb(255 77 94)" stopOpacity="0.75" />
                    <stop offset="0.55" stopColor="rgb(255 176 32)" stopOpacity="0.35" />
                    <stop offset="1" stopColor="rgb(255 176 32)" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle cx="250" cy="284" r="62" fill="url(#hero-heat)" />
                <circle cx="150" cy="290" r="40" fill="url(#hero-heat)" opacity="0.7" />
                <rect
                  x="212"
                  y="248"
                  width="80"
                  height="70"
                  fill="none"
                  stroke="rgb(255 77 94)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x="212"
                  y="242"
                  fontSize="9"
                  fill="rgb(255 77 94)"
                  fontFamily="var(--font-mono)"
                >
                  BOUNDARY ARTIFACT
                </text>
              </motion.g>
            )}
          </AnimatePresence>
        </svg>

        {!reduce && (
          <div aria-hidden className="absolute inset-x-0 top-0 z-10 h-full animate-scan-y">
            <div className="absolute inset-x-0 bottom-full h-28 bg-gradient-to-b from-transparent to-cyan/25" />
            <div className="absolute inset-x-0 top-0 h-px bg-cyan shadow-[0_0_20px_3px_rgb(var(--cyan)/0.85)]" />
          </div>
        )}

        <Corners tone="cyan" size={20} />
        <Tag className="left-3 top-3" k="SIGNAL" v={String((tick % 8) + 1).padStart(2, "0")} />
        <Tag className="bottom-3 left-3" k="MODEL" v="V0.4.2" />
        <Tag className="bottom-3 right-3" k="NODE" v="EU-CENTRAL" />
      </div>

      <div
        className="mt-4 flex items-center justify-between border border-line bg-ink-1/70 px-3 py-2.5 font-mono text-2xs uppercase"
        role="status"
        aria-label="Simulated telemetry"
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={readout[0]}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="flex gap-3"
          >
            <span className="text-fg-dim">{readout[0]}</span>
            <span className="text-cyan">{readout[1]}</span>
          </motion.span>
        </AnimatePresence>
        <span className="flex items-center gap-1.5 text-amber">
          <span className="size-1 rounded-full bg-amber" />
          SIMULATED
        </span>
      </div>
    </div>
  );
}
