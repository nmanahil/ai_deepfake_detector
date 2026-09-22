"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { SPECIMEN_LANDMARKS, SPECIMEN_POINTS, specimenDataUrl } from "@/lib/specimen";
import { cn } from "@/lib/utils";
import { DiagramFrame } from "./diagram-frame";

type Mode = "box" | "landmarks" | "mesh";
const MODES: { id: Mode; label: string; note: string }[] = [
  { id: "box", label: "Detection", note: "A detector proposes a bounding box and a confidence score." },
  { id: "landmarks", label: "Landmarks", note: "Facial landmarks describe jaw, brow, eye, nose and lip geometry." },
  { id: "mesh", label: "Alignment mesh", note: "Landmarks are used to warp the face to a canonical pose, so boundary comparisons are like-for-like." },
];

export function LocalizationDiagram() {
  const [mode, setMode] = useState<Mode>("landmarks");
  const src = useMemo(() => specimenDataUrl(11), []);
  const lm = Object.values(SPECIMEN_LANDMARKS);
  return (
    <DiagramFrame label="Face localization" caption={MODES.find((m) => m.id === mode)!.note} meta={<span>Illustrative specimen</span>}>
      <div className="grid gap-px bg-line md:grid-cols-[minmax(0,320px)_1fr]">
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[320px] bg-ink">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="Abstract portrait specimen" className="absolute inset-0 size-full object-cover" />
          <svg viewBox="0 0 400 500" className="absolute inset-0 size-full" aria-hidden>
            {mode !== "mesh" && null}
            <motion.rect key={`b${mode}`} x="112" y="92" width="176" height="248" fill="none" stroke="rgb(56 226 255)" strokeWidth="1.5" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.9 }} />
            <text x="112" y="84" fill="rgb(56 226 255)" fontSize="11" fontFamily="var(--font-mono)">FACE · 99.2%</text>
            {mode !== "box" && lm.map((d, i) => (
              <motion.path key={`${mode}${i}`} d={d} fill="none" stroke="rgb(56 226 255)" strokeWidth="1.2" strokeOpacity="0.9" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: i * 0.08 }} />
            ))}
            {mode !== "box" && SPECIMEN_POINTS.map(([x, y], i) => (
              <motion.circle key={`p${mode}${i}`} cx={x} cy={y} r="2.2" fill="rgb(56 226 255)" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.015 }} />
            ))}
            {mode === "mesh" && SPECIMEN_POINTS.flatMap(([x, y], i) => SPECIMEN_POINTS.slice(i + 1).filter(([x2, y2]) => Math.hypot(x - x2, y - y2) < 62).map(([x2, y2], j) => (
              <line key={`m${i}-${j}`} x1={x} y1={y} x2={x2} y2={y2} stroke="rgb(56 226 255)" strokeOpacity="0.28" strokeWidth="0.7" />
            )))}
          </svg>
          <div aria-hidden className="scanlines pointer-events-none absolute inset-0 opacity-40" />
        </div>
        <div className="flex flex-col justify-between gap-6 bg-ink p-5 sm:p-8">
          <div role="radiogroup" aria-label="Localization stage" className="flex flex-wrap gap-1.5">
            {MODES.map((m) => (
              <button key={m.id} role="radio" aria-checked={mode === m.id} onClick={() => setMode(m.id)} className={cn("h-8 border px-3 font-mono text-2xs uppercase transition-colors", mode === m.id ? "border-cyan/60 bg-cyan/10 text-cyan" : "border-line-strong text-fg-muted hover:text-fg")}>{m.label}</button>
            ))}
          </div>
          <dl className="grid grid-cols-2 gap-px border border-line bg-line font-mono">
            {[["Landmarks", String(SPECIMEN_POINTS.length)], ["Detector conf.", "99.2%"], ["Pose (yaw)", "−3.1°"], ["Crop", "224 × 224"]].map(([k, v]) => (
              <div key={k} className="bg-ink p-3"><dt className="label">{k}</dt><dd className="tabular mt-1 text-sm text-fg">{v}</dd></div>
            ))}
          </dl>
        </div>
      </div>
    </DiagramFrame>
  );
}
