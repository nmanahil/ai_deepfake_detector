"use client";

import { StatusDot } from "@/components/ui/telemetry";
import { PIPELINE } from "@/lib/constants";
import { cn, formatBytes, formatClock } from "@/lib/utils";
import type { AnalysisStatus, Media } from "@/types";
import type { Phase } from "@/hooks/use-analysis-session";

const STATUS = {
  idle: { label: "Awaiting evidence", tone: "dim" as const, text: "text-fg-muted" },
  running: { label: "Analysis in progress", tone: "cyan" as const, text: "text-cyan" },
  completed: { label: "Analysis complete", tone: "signal" as const, text: "text-signal" },
  failed: { label: "Analysis interrupted", tone: "alert" as const, text: "text-alert" },
};

/** TOP band of the workspace: status, processing stage, and media metadata. */
export function AnalysisTopBar({ phase, status, media, id, actions }: { phase: Phase; status?: AnalysisStatus | null; media?: Media | null; id?: string; actions?: React.ReactNode }) {
  const s = STATUS[phase];
  const stage = status ? PIPELINE[status.stageIndex] : null;
  const meta: [string, string][] = media
    ? [
        ["FILE", media.filename],
        ["TYPE", media.kind.toUpperCase()],
        ["RES", media.width ? `${media.width}×${media.height}` : "—"],
        ...(media.kind === "video" ? ([["DUR", formatClock(media.durationSec ?? 0, true)], ["FRAMES", media.frameCount ? `≈${media.frameCount}` : "—"]] as [string, string][]) : []),
        ["SIZE", formatBytes(media.sizeBytes)],
      ]
    : [["FILE", "—"], ["TYPE", "—"], ["RES", "—"], ["SIZE", "—"]];

  return (
    <div className="border-b border-line bg-ink-1/60">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-8 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-3" role="status" aria-live="polite">
            <StatusDot tone={s.tone} pulse={phase === "running"} />
            <span className={cn("font-mono text-xs font-medium uppercase tracking-[0.12em]", s.text)}>{s.label}</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-2xs uppercase">
            <span className="text-fg-dim">Stage</span>
            <span className="tabular text-fg">{phase === "running" && stage ? `${stage.code}/08` : phase === "completed" ? "08/08" : "—/08"}</span>
            <span className="text-fg-muted">{phase === "running" && stage ? stage.label : phase === "completed" ? "Evidence Synthesis" : phase === "failed" && stage ? stage.label : "Standby"}</span>
          </div>
          {id && (
            <div className="flex items-center gap-2 font-mono text-2xs uppercase">
              <span className="text-fg-dim">ID</span>
              <span className="text-cyan">{id}</span>
            </div>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <dl className="no-scrollbar flex gap-x-8 gap-y-2 overflow-x-auto border-t border-line px-4 py-2.5 sm:px-8">
        {meta.map(([k, v]) => (
          <div key={k} className="flex shrink-0 items-baseline gap-2 font-mono text-2xs uppercase">
            <dt className="text-fg-dim">{k}</dt>
            <dd className={cn("max-w-[260px] truncate", media ? "text-fg" : "text-fg-dim")} title={v}>
              {v}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
