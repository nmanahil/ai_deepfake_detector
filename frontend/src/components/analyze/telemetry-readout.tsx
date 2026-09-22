"use client";

import { motion } from "framer-motion";
import { Panel } from "@/components/ui/panel";
import { PIPELINE } from "@/lib/constants";
import { cn, pct } from "@/lib/utils";
import type { AnalysisStatus } from "@/types";

function Line({ k, v, tone }: { k: string; v: string; tone?: "cyan" | "signal" }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line/60 py-2 last:border-0">
      <span className="label shrink-0">{k}</span>
      <motion.span key={v} initial={{ opacity: 0.35 }} animate={{ opacity: 1 }} className={cn("tabular min-w-0 truncate text-right font-mono text-[12px] uppercase", tone === "cyan" ? "text-cyan" : tone === "signal" ? "text-signal" : "text-fg")}>
        {v}
      </motion.span>
    </div>
  );
}

/** Live readout beneath the scan frame. */
export function TelemetryReadout({ status }: { status: AnalysisStatus | null }) {
  const t = status?.telemetry;
  const stage = status ? PIPELINE[status.stageIndex] : null;
  const total = t?.frameTotal ?? 1;
  return (
    <Panel
      title={
        <>
          <span className="size-1.5 animate-blink rounded-full bg-cyan" /> Live telemetry
        </>
      }
      meta={<span>{stage ? `STAGE ${stage.code} · ${stage.short}` : "STANDBY"}</span>}
    >
      <div className="flex flex-col">
        <Line k="Frame" v={`${String(t?.frameCursor ?? 0).padStart(String(total).length, "0")} / ${total}`} tone="cyan" />
        <Line k="Facial region" v={t?.faceState ?? "PENDING"} tone={t?.faceState?.includes("DETECTED") ? "signal" : undefined} />
        <Line k="Temporal consistency" v={t?.temporalState ?? "PENDING"} />
        <Line k="Frequency signature" v={t?.frequencyState ?? "PENDING"} />
        <Line k="Model confidence" v={t?.modelConfidence != null ? pct(t.modelConfidence) : "— —"} tone="cyan" />
        <Line k="Node" v={`${t?.node ?? "—"} · ${t?.latencyMs ?? 0}ms`} />
      </div>
      <div className="mt-5 flex gap-[3px]" aria-hidden>
        {PIPELINE.map((s) => {
          const cur = status?.stageIndex ?? 0;
          const fill = s.index < cur ? 1 : s.index === cur ? (status?.stageProgress ?? 0) : 0;
          return (
            <div key={s.id} className="h-[3px] flex-1 bg-line-strong">
              <div className="h-full bg-cyan shadow-[0_0_8px_rgb(var(--cyan)/0.7)]" style={{ width: `${fill * 100}%` }} />
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
