"use client";

import { motion } from "framer-motion";
import { Panel } from "@/components/ui/panel";
import { EVIDENCE_KINDS, PIPELINE } from "@/lib/constants";
import { cn, formatClock } from "@/lib/utils";
import type { Analysis, Evidence, EvidenceKind, StageId } from "@/types";

const sevColor = (s: number) => (s >= 0.68 ? "rgb(var(--alert))" : s >= 0.4 ? "rgb(var(--amber))" : "rgb(var(--fg-muted))");

const STAGE_OF: Record<EvidenceKind, StageId> = {
  facial_boundary_artifact: "localization",
  unnatural_texture: "artifacts",
  compression_anomaly: "artifacts",
  temporal_inconsistency: "temporal",
  synthetic_frequency_signature: "frequency",
};

function niceStep(duration: number) {
  const steps = [1, 2, 5, 10, 15, 30, 60, 120, 300];
  return steps.find((s) => duration / s <= 8) ?? 600;
}

/** BOTTOM band: forensic timeline. Video → frame timeline with markers; image → pipeline timeline. */
export function EvidenceTimeline({ analysis, frame, selectedId, onSelect, onFrame }: { analysis: Analysis; frame: number; selectedId: string | null; onSelect: (id: string) => void; onFrame: (i: number) => void }) {
  return analysis.media.kind === "video" ? (
    <FrameTimeline analysis={analysis} frame={frame} selectedId={selectedId} onSelect={onSelect} onFrame={onFrame} />
  ) : (
    <PipelineTimeline analysis={analysis} selectedId={selectedId} onSelect={onSelect} />
  );
}

function FrameTimeline({ analysis, frame, selectedId, onSelect, onFrame }: { analysis: Analysis; frame: number; selectedId: string | null; onSelect: (id: string) => void; onFrame: (i: number) => void }) {
  const dur = analysis.media.durationSec || analysis.frames[analysis.frames.length - 1].timestampSec || 1;
  const x = (t: number) => `${(t / dur) * 100}%`;
  const step = niceStep(dur);
  const ticks = Array.from({ length: Math.floor(dur / step) + 1 }, (_, i) => i * step);
  const W = 1000;
  const H = 64;
  const pts = analysis.frames.map((f) => [(f.timestampSec / dur) * W, H - f.manipulationScore * (H - 8) - 2] as const);
  const line = pts.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)} ${py.toFixed(1)}`).join("");
  const area = `${line}L${pts[pts.length - 1][0]} ${H}L${pts[0][0]} ${H}Z`;
  const cur = analysis.frames[frame];

  const markers = analysis.evidence.filter((e) => e.timestampSec != null);
  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const btns = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("button[data-marker]"));
    const i = btns.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    e.preventDefault();
    btns[(i + (e.key === "ArrowRight" ? 1 : -1) + btns.length) % btns.length]?.focus();
  };

  return (
    <Panel title="Forensic timeline" meta={<span className="hidden sm:inline">Click a marker to jump to the frame</span>} className="min-w-0">
      <div className="overflow-x-auto pb-1">
        <div className="relative min-w-[560px] px-6 pb-2 pt-1" onKeyDown={onKey}>
          {/* sparkline: per-frame manipulation score */}
          <div className="relative h-16">
            <p className="label absolute left-0 top-0 z-10">Frame score</p>
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" aria-hidden>
              <defs>
                <linearGradient id="tl-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="rgb(var(--cyan))" stopOpacity="0.28" />
                  <stop offset="1" stopColor="rgb(var(--cyan))" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0.38, 0.68].map((t) => (
                <line key={t} x1="0" x2={W} y1={H - t * (H - 8) - 2} y2={H - t * (H - 8) - 2} stroke="rgb(var(--line-strong))" strokeDasharray="3 5" vectorEffect="non-scaling-stroke" />
              ))}
              <motion.path d={area} fill="url(#tl-area)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />
              <motion.path d={line} fill="none" stroke="rgb(var(--cyan))" strokeWidth="1.5" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} />
            </svg>
          </div>

          {/* track + markers */}
          <div className="relative mt-1 h-14">
            <div className="absolute inset-x-0 top-[26px] h-px bg-line-strong" />
            {ticks.map((t) => (
              <div key={t} className="absolute top-[22px] flex -translate-x-1/2 flex-col items-center" style={{ left: x(t) }}>
                <span className="h-2 w-px bg-line-strong" />
              </div>
            ))}
            {/* frame ticks */}
            {analysis.frames.map((f) => (
              <button key={f.index} aria-label={`Frame ${f.index + 1} at ${formatClock(f.timestampSec)}`} onClick={() => onFrame(f.index)} className="group absolute top-[14px] h-6 w-3 -translate-x-1/2" style={{ left: x(f.timestampSec) }} tabIndex={-1}>
                <span className={cn("absolute left-1/2 top-[10px] h-1 w-px -translate-x-1/2 transition-colors", f.index === frame ? "bg-cyan" : "bg-fg-dim group-hover:bg-fg")} />
              </button>
            ))}
            {/* playhead */}
            <motion.div aria-hidden className="pointer-events-none absolute inset-y-0 z-10 w-px bg-cyan shadow-[0_0_10px_rgb(var(--cyan))]" animate={{ left: x(cur.timestampSec) }} transition={{ type: "spring", stiffness: 300, damping: 34 }}>
              <span className="absolute -left-[3px] top-0 size-[7px] rotate-45 bg-cyan" />
            </motion.div>
            {markers.map((e, i) => {
              const active = e.id === selectedId;
              return (
                <button
                  key={e.id}
                  data-marker
                  onClick={() => onSelect(e.id)}
                  aria-label={`${EVIDENCE_KINDS[e.kind].label} at ${formatClock(e.timestampSec ?? 0, true)}, frame ${(e.frameIndex ?? 0) + 1}, severity ${Math.round(e.severity * 100)} percent`}
                  aria-pressed={active}
                  className="group absolute top-[16px] z-20 grid size-5 -translate-x-1/2 place-items-center"
                  style={{ left: x(e.timestampSec ?? 0), marginTop: (i % 2) * 0 }}
                >
                  <motion.span initial={{ scale: 0 }} animate={{ scale: active ? 1.35 : 1 }} transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.5 + i * 0.08 }} className="block size-2.5 rotate-45 border transition-shadow group-hover:shadow-[0_0_0_4px_rgb(255_255_255/0.08)]" style={{ backgroundColor: sevColor(e.severity), borderColor: active ? "#fff" : "transparent", boxShadow: active ? `0 0 14px ${sevColor(e.severity)}` : undefined }} />
                  <span className="pointer-events-none absolute bottom-full mb-1.5 hidden whitespace-nowrap border border-line-strong bg-ink-2 px-2 py-1 font-mono text-[10px] uppercase text-fg group-hover:block group-focus-visible:block">
                    {EVIDENCE_KINDS[e.kind].label} · {formatClock(e.timestampSec ?? 0, true)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* axis labels */}
          <div className="relative h-5">
            {ticks.map((t) => (
              <span key={t} className="tabular absolute -translate-x-1/2 font-mono text-[10px] text-fg-dim" style={{ left: x(t) }}>{formatClock(t)}</span>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3 border-t border-line pt-3 font-mono text-2xs uppercase text-fg-dim">
        {analysis.frames.length} frames sampled · {markers.length} marker{markers.length === 1 ? "" : "s"} · viewing F{String(frame + 1).padStart(2, "0")} @ {formatClock(cur.timestampSec, true)}
      </p>
    </Panel>
  );
}

function PipelineTimeline({ analysis, selectedId, onSelect }: { analysis: Analysis; selectedId: string | null; onSelect: (id: string) => void }) {
  const byStage = new Map<StageId, Evidence[]>();
  analysis.evidence.forEach((e) => byStage.set(STAGE_OF[e.kind], [...(byStage.get(STAGE_OF[e.kind]) ?? []), e]));
  const stageTime = (id: StageId) => {
    const l = [...analysis.log].reverse().find((x) => x.stage === id);
    return l ? `T+${(l.t / 1000).toFixed(1)}s` : "—";
  };
  return (
    <Panel title="Forensic timeline" meta={<span className="hidden sm:inline">Evidence by pipeline stage</span>} className="min-w-0">
      <div className="overflow-x-auto pb-1">
        <ol className="relative grid min-w-[720px] grid-cols-8">
          <div aria-hidden className="absolute left-[6.25%] right-[6.25%] top-[11px] h-px bg-line-strong" />
          {PIPELINE.map((s, i) => {
            const ev = byStage.get(s.id) ?? [];
            return (
              <li key={s.id} className="relative flex flex-col items-center px-1 text-center">
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.06, type: "spring", stiffness: 500, damping: 22 }} className={cn("relative z-10 grid size-[23px] place-items-center border bg-ink-1 font-mono text-[9px]", ev.length ? "border-amber text-amber" : "border-line-strong text-fg-dim")}>
                  {s.code}
                </motion.span>
                <span className="mt-2 font-mono text-[9px] uppercase leading-tight tracking-wider text-fg-muted">{s.short}</span>
                <span className="tabular mt-0.5 font-mono text-[9px] text-fg-dim">{stageTime(s.id)}</span>
                <div className="mt-3 flex min-h-[56px] w-full flex-col items-stretch gap-1.5">
                  {ev.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => onSelect(e.id)}
                      aria-pressed={e.id === selectedId}
                      className={cn("border px-1 py-1 font-mono text-[9px] uppercase leading-tight transition-colors", e.id === selectedId ? "border-cyan bg-cyan/10 text-cyan" : "border-line-strong text-fg-muted hover:border-fg-dim hover:text-fg")}
                      style={{ borderLeftColor: sevColor(e.severity), borderLeftWidth: 2 }}
                    >
                      {EVIDENCE_KINDS[e.kind].label.split(" ").slice(0, 2).join(" ")}
                    </button>
                  ))}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
      <p className="mt-3 border-t border-line pt-3 font-mono text-2xs uppercase text-fg-dim">Still image · single frame · {analysis.evidence.length} finding{analysis.evidence.length === 1 ? "" : "s"} recorded</p>
    </Panel>
  );
}
