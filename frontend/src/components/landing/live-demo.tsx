"use client";

import { useReduce } from "@/hooks/use-reduced-motion";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Corners } from "@/components/ui/corners";
import { Meter } from "@/components/ui/meter";
import { SimulatedTag, VerdictBadge } from "@/components/ui/badge";
import { PIPELINE } from "@/lib/constants";
import { SPECIMEN_LANDMARKS, specimenDataUrl } from "@/lib/specimen";
import { cn } from "@/lib/utils";
import { SectionHead } from "./reveal";

const STEP_MS = 1500;

/** Looping, clearly-simulated walkthrough of the analysis pipeline. */
export function LiveDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-120px" });
  const reduce = useReduce();
  const [step, setStep] = useState(0);
  const src = useMemo(() => specimenDataUrl(8, { t: 1.2 }), []);

  useEffect(() => {
    if (reduce) {
      setStep(8);
      return;
    }
    if (!inView) return;
    const t = window.setTimeout(
      () => setStep((s) => (s >= 8 ? 0 : s + 1)),
      step === 8 ? 5200 : STEP_MS,
    );
    return () => window.clearTimeout(t);
  }, [inView, step, reduce]);

  const done = step >= 8;
  const frame = Math.min(240, Math.round(((step + 1) / 8) * 240) - 56 + (step === 0 ? 56 : 0));
  const tel: [string, string, boolean][] = [
    ["Frame", `${String(done ? 240 : Math.max(1, frame)).padStart(3, "0")} / 240`, true],
    ["Facial region", step >= 3 ? "DETECTED" : step >= 2 ? "SCANNING" : "PENDING", step >= 3],
    ["Temporal consistency", step >= 5 ? "ANALYZING" : "PENDING", false],
    ["Frequency signature", step >= 6 ? "SCANNING" : "QUEUED", false],
    ["Model confidence", step >= 7 ? "81.3%" : "— —", step >= 7],
  ];

  return (
    <section
      id="demo"
      ref={ref}
      aria-label="Live analysis demonstration"
      className="relative border-b border-line py-24 sm:py-32"
    >
      <div className="mx-auto max-w-[1360px] px-4 sm:px-8">
        <SectionHead
          index="01"
          label="Live analysis"
          title={
            <>
              Watch a case
              <br />
              come together.
            </>
          }
          lead="A looping, simulated walkthrough of the eight-stage pipeline. Nothing here is real detection — it shows what the workspace does with your file."
        />

        <div className="mt-14 grid gap-px border border-line bg-line lg:grid-cols-[280px_minmax(0,1fr)_320px]">
          <ol className="bg-ink-1 py-1">
            {PIPELINE.map((s) => {
              const state =
                done || s.index < step ? "done" : s.index === step ? "active" : "pending";
              return (
                <li
                  key={s.id}
                  className={cn(
                    "relative flex items-center gap-3 px-4 py-3 transition-colors duration-500",
                    state === "active" && "bg-cyan/[0.05]",
                  )}
                >
                  {state === "active" && (
                    <span className="absolute inset-y-0 left-0 w-px bg-cyan shadow-[0_0_10px_rgb(var(--cyan))]" />
                  )}
                  <span
                    className={cn(
                      "tabular font-mono text-2xs",
                      state === "pending" ? "text-fg-dim/70" : "text-cyan",
                    )}
                  >
                    {s.code}
                  </span>
                  <span
                    className={cn(
                      "flex-1 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors",
                      state === "active"
                        ? "text-fg"
                        : state === "done"
                          ? "text-fg-muted"
                          : "text-fg-dim/80",
                    )}
                  >
                    {s.label}
                  </span>
                  <span
                    className={cn(
                      "size-1.5 rounded-full transition-colors",
                      state === "done"
                        ? "bg-signal"
                        : state === "active"
                          ? "animate-blink bg-cyan"
                          : "bg-line-strong",
                    )}
                  />
                </li>
              );
            })}
          </ol>

          <div className="relative grid place-items-center bg-void p-6 sm:p-10">
            <div className="relative aspect-[4/5] w-full max-w-[380px] overflow-hidden border border-line-strong bg-ink-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="absolute inset-0 size-full object-cover" />
              <div aria-hidden className="scanlines absolute inset-0 opacity-50" />
              {!done && !reduce && (
                <motion.div
                  aria-hidden
                  key={step}
                  className="absolute inset-x-0 z-10 h-px bg-cyan shadow-[0_0_16px_2px_rgb(var(--cyan)/0.9)]"
                  initial={{ top: "0%" }}
                  animate={{ top: "100%" }}
                  transition={{ duration: STEP_MS / 1000, ease: "linear" }}
                />
              )}
              <svg viewBox="0 0 400 500" className="absolute inset-0 size-full" aria-hidden>
                {step >= 3 && (
                  <motion.rect
                    x="106"
                    y="86"
                    width="188"
                    height="262"
                    fill="none"
                    stroke="rgb(56 226 255)"
                    strokeWidth="1.3"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8 }}
                  />
                )}
                {step >= 4 &&
                  Object.values(SPECIMEN_LANDMARKS).map((d, i) => (
                    <motion.path
                      key={i}
                      d={d}
                      fill="none"
                      stroke="rgb(56 226 255)"
                      strokeWidth="1"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.7, delay: i * 0.05 }}
                    />
                  ))}
                {step >= 6 && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <defs>
                      <radialGradient id="ld-heat">
                        <stop offset="0" stopColor="rgb(255 176 32)" stopOpacity="0.7" />
                        <stop offset="1" stopColor="rgb(255 176 32)" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <circle cx="252" cy="286" r="58" fill="url(#ld-heat)" />
                    <rect
                      x="214"
                      y="250"
                      width="78"
                      height="66"
                      fill="none"
                      stroke="rgb(255 176 32)"
                      strokeDasharray="3 3"
                    />
                  </motion.g>
                )}
              </svg>
              <Corners tone={done ? "amber" : "cyan"} size={16} />
            </div>
          </div>

          <div className="flex flex-col justify-between gap-6 bg-ink-1 p-5 sm:p-6">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="label-strong">Live telemetry</p>
                <SimulatedTag />
              </div>
              <dl>
                {tel.map(([k, v, hot]) => (
                  <div
                    key={k}
                    className="flex items-baseline justify-between gap-4 border-b border-line/70 py-2.5 last:border-0"
                  >
                    <dt className="label">{k}</dt>
                    <motion.dd
                      key={v}
                      initial={{ opacity: 0.3 }}
                      animate={{ opacity: 1 }}
                      className={cn(
                        "tabular font-mono text-xs uppercase",
                        hot ? "text-cyan" : "text-fg",
                      )}
                    >
                      {v}
                    </motion.dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="min-h-[148px] border border-line bg-ink p-4">
              <AnimatePresence mode="wait">
                {done ? (
                  <motion.div
                    key="res"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    <VerdictBadge verdict="suspicious" />
                    <p className="display text-4xl text-amber">SUSPICIOUS</p>
                    <Meter value={0.813} tone="amber" segments={20} />
                    <p className="label">Confidence 81.3% · not a guarantee</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="wait"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid h-full min-h-[116px] place-items-center text-center"
                  >
                    <p className="label animate-blink">
                      Assessment pending
                      <br />
                      Stage {PIPELINE[Math.min(step, 7)].code}/08
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
