"use client";

import { useState } from "react";
import { VerdictBadge } from "@/components/ui/badge";
import { SIGNALS, VERDICTS } from "@/lib/constants";
import { verdictFromScore } from "@/lib/verdict";
import { cn, pct } from "@/lib/utils";
import type { SignalKey } from "@/types";
import { DiagramFrame } from "./diagram-frame";

const KEYS: SignalKey[] = ["facial", "temporal", "texture", "frequency", "compression"];
const W: Record<SignalKey, number> = { facial: 0.28, temporal: 0.2, texture: 0.22, frequency: 0.18, compression: 0.12 };

export function SynthesisDiagram() {
  const [v, setV] = useState<Record<SignalKey, number>>({ facial: 0.82, temporal: 0.71, texture: 0.91, frequency: 0.84, compression: 0.4 });
  const fused = KEYS.reduce((s, k) => s + v[k] * W[k], 0);
  const verdict = verdictFromScore(fused);
  const c = VERDICTS[verdict];
  return (
    <DiagramFrame label="Fusion playground" caption="Signals are weighted and fused into one manipulation score, then mapped to a verdict band. Drag the sliders to see how agreement between independent signals moves the outcome — and how a single strong signal alone usually does not.">
      <div className="grid gap-px bg-line lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5 bg-ink-1 p-5 sm:p-6">
          {KEYS.map((k) => (
            <label key={k} className="block">
              <span className="mb-2 flex items-baseline justify-between font-mono text-2xs uppercase">
                <span className="text-fg-muted">{SIGNALS[k].label} <span className="text-fg-dim">· w {pct(W[k], 0)}</span></span>
                <span className="tabular text-fg">{pct(v[k], 0)}</span>
              </span>
              <input type="range" min={0} max={1} step={0.01} value={v[k]} onChange={(e) => setV((s) => ({ ...s, [k]: Number(e.target.value) }))} className="w-full accent-cyan" aria-label={SIGNALS[k].label} />
            </label>
          ))}
        </div>
        <div className="flex flex-col justify-between gap-6 bg-ink p-5 sm:p-6" aria-live="polite">
          <div>
            <p className="label">Fused manipulation score</p>
            <p className={cn("tabular mt-2 font-mono text-5xl font-medium transition-colors", c.text)}>{fused.toFixed(3)}</p>
          </div>
          <div>
            <div className="relative h-2 bg-line-strong">
              <div className="absolute inset-y-0 left-0 w-[38%] bg-signal/40" /><div className="absolute inset-y-0 left-[38%] w-[30%] bg-amber/40" /><div className="absolute inset-y-0 left-[68%] right-0 bg-alert/40" />
              <span className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 border-2 border-ink bg-white transition-[left] duration-300" style={{ left: `${fused * 100}%` }} />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[9px] uppercase text-fg-dim"><span>Low evidence</span><span>Suspicious</span><span>Likely manipulated</span></div>
          </div>
          <VerdictBadge verdict={verdict} className="self-start" />
        </div>
      </div>
    </DiagramFrame>
  );
}
