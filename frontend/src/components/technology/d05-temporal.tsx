"use client";

import { useMemo, useState } from "react";
import { mulberry32 } from "@/lib/rng";
import { Segmented } from "@/components/ui/segmented";
import { cn } from "@/lib/utils";
import { DiagramFrame } from "./diagram-frame";

const N = 64;
type Kind = "steady" | "unstable";

function series(kind: Kind) {
  const r = mulberry32(kind === "steady" ? 5 : 9);
  return Array.from({ length: N }, (_, i) => {
    const base = 0.16 + Math.sin(i / 5) * 0.03 + r() * 0.05;
    const spike = kind === "unstable" && ([14, 15, 37, 38, 39, 52].includes(i) ? 0.35 + r() * 0.3 : 0);
    return Math.min(1, base + (spike || 0));
  });
}

export function TemporalDiagram() {
  const [kind, setKind] = useState<Kind>("unstable");
  const [cur, setCur] = useState(38);
  const data = useMemo(() => series(kind), [kind]);
  const W = 640, H = 200, P = 8;
  const x = (i: number) => P + (i / (N - 1)) * (W - 2 * P);
  const y = (v: number) => H - P - v * (H - 2 * P);
  const line = data.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join("");
  const thr = 0.45;
  const over = data.map((v, i) => (v > thr ? i : -1)).filter((i) => i >= 0);
  return (
    <DiagramFrame label="Frame-to-frame coherence" meta={<Segmented label="Clip type" value={kind} onChange={setKind} options={[{ value: "steady", label: "Steady clip" }, { value: "unstable", label: "Unstable clip" }]} />} caption="Each point is how far the face representation moves between adjacent frames. Natural motion changes smoothly; frame-by-frame synthesis can introduce jumps. Jumps alone are not proof — fast motion and re-encoding cause them too.">
      <div className="p-4 sm:p-6">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Frame distance chart. ${over.length} frames exceed the review threshold.`}>
          <line x1={P} x2={W - P} y1={y(thr)} y2={y(thr)} stroke="rgb(var(--amber))" strokeDasharray="4 5" strokeOpacity="0.6" />
          <text x={W - P} y={y(thr) - 6} textAnchor="end" fontSize="9" fill="rgb(var(--amber))" fontFamily="var(--font-mono)">REVIEW THRESHOLD</text>
          <path d={`${line}L${x(N - 1)} ${H - P}L${x(0)} ${H - P}Z`} fill="rgb(var(--cyan) / 0.08)" />
          <path d={line} fill="none" stroke="rgb(var(--cyan))" strokeWidth="1.5" strokeLinejoin="round" />
          {data.map((v, i) => v > thr && <circle key={i} cx={x(i)} cy={y(v)} r="3.5" fill="rgb(var(--alert))" stroke="rgb(var(--ink-1))" strokeWidth="2" />)}
          <line x1={x(cur)} x2={x(cur)} y1={P} y2={H - P} stroke="#fff" strokeOpacity="0.5" />
          <circle cx={x(cur)} cy={y(data[cur])} r="4" fill="#fff" />
        </svg>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex flex-1 items-center gap-3 font-mono text-2xs uppercase text-fg-dim">
            Frame
            <input type="range" min={0} max={N - 1} value={cur} onChange={(e) => setCur(Number(e.target.value))} className="flex-1 accent-cyan" aria-label="Scrub frame" />
          </label>
          <p className="font-mono text-xs uppercase text-fg-muted tabular">F{String(cur + 1).padStart(2, "0")} · Δ <span className={cn(data[cur] > thr ? "text-alert" : "text-cyan")}>{data[cur].toFixed(2)}</span></p>
        </div>
      </div>
    </DiagramFrame>
  );
}
