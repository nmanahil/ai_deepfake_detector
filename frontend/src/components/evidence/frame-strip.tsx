"use client";

import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn, formatClock } from "@/lib/utils";
import type { Analysis } from "@/types";

/** Filmstrip of analysed frames with per-frame score bars. Arrow keys step, space plays. */
export function FrameStrip({ analysis, frame, onFrame }: { analysis: Analysis; frame: number; onFrame: (i: number) => void }) {
  const [playing, setPlaying] = useState(false);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const n = analysis.frames.length;

  useEffect(() => {
    if (!playing) return;
    const t = window.setTimeout(() => onFrame((frame + 1) % n), 900);
    return () => window.clearTimeout(t);
  }, [playing, frame, n, onFrame]);

  useEffect(() => {
    refs.current[frame]?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [frame]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); onFrame(Math.min(n - 1, frame + 1)); refs.current[Math.min(n - 1, frame + 1)]?.focus(); }
    if (e.key === "ArrowLeft") { e.preventDefault(); onFrame(Math.max(0, frame - 1)); refs.current[Math.max(0, frame - 1)]?.focus(); }
  };

  return (
    <div className="flex items-stretch gap-3 border-t border-line bg-ink-1/60 p-3">
      <div className="flex shrink-0 flex-col justify-between gap-1">
        <button aria-label={playing ? "Pause frame playback" : "Play through frames"} onClick={() => setPlaying((p) => !p)} className="grid size-8 place-items-center border border-line-strong text-fg-muted transition-colors hover:border-cyan hover:text-cyan">
          {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
        </button>
        <div className="flex gap-1">
          <button aria-label="Previous frame" disabled={frame === 0} onClick={() => onFrame(frame - 1)} className="grid size-6 place-items-center text-fg-dim hover:text-fg disabled:opacity-30"><SkipBack className="size-3" /></button>
          <button aria-label="Next frame" disabled={frame === n - 1} onClick={() => onFrame(frame + 1)} className="grid size-6 place-items-center text-fg-dim hover:text-fg disabled:opacity-30"><SkipForward className="size-3" /></button>
        </div>
      </div>
      <div role="listbox" aria-label="Analysed frames" onKeyDown={onKey} className="no-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1">
        {analysis.frames.map((f) => {
          const active = f.index === frame;
          const tone = f.flagged ? (f.manipulationScore >= 0.68 ? "bg-alert" : "bg-amber") : "bg-fg-dim/60";
          return (
            <button
              key={f.index}
              ref={(el) => { refs.current[f.index] = el; }}
              role="option"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onFrame(f.index)}
              className={cn("group relative w-[84px] shrink-0 text-left transition-opacity", active ? "opacity-100" : "opacity-70 hover:opacity-100")}
            >
              <span className={cn("relative block aspect-[4/3] overflow-hidden border transition-colors", active ? "border-cyan" : f.flagged ? "border-amber/50" : "border-line")}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.thumbnail} alt="" className="size-full object-cover" />
                {f.flagged && <span className={cn("absolute right-1 top-1 size-1.5 rounded-full", f.manipulationScore >= 0.68 ? "bg-alert" : "bg-amber")} />}
              </span>
              <span className="mt-1.5 flex items-center justify-between font-mono text-[9px] uppercase text-fg-dim">
                <span className={active ? "text-cyan" : ""}>F{String(f.index + 1).padStart(2, "0")}</span>
                <span className="tabular">{formatClock(f.timestampSec)}</span>
              </span>
              <span className="mt-1 block h-[2px] w-full bg-line-strong"><span className={cn("block h-full", tone)} style={{ width: `${f.manipulationScore * 100}%` }} /></span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
