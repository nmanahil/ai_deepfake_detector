"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { PIPELINE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { AnalysisStatus } from "@/types";

/** ANALYSIS PIPELINE — each stage activates as the system progresses. */
export function PipelineRail({ status, idle }: { status: AnalysisStatus | null; idle?: boolean }) {
  const cur = status?.stageIndex ?? -1;
  const done = status?.state === "completed";
  const failed = status?.state === "failed";
  return (
    <Panel title="Analysis pipeline" meta={<span className="tabular">{done ? "8/8" : `${Math.max(0, cur + 1)}/8`}</span>} flush>
      <ol className="divide-y divide-line">
        {PIPELINE.map((s) => {
          const state = idle ? "pending" : done || s.index < cur ? "done" : s.index === cur ? (failed ? "failed" : "active") : "pending";
          return (
            <li key={s.id} aria-current={state === "active" ? "step" : undefined} className="relative">
              {state === "active" && <motion.span layoutId="pipe-active" className="absolute inset-y-0 left-0 w-px bg-cyan shadow-[0_0_10px_rgb(var(--cyan))]" />}
              <div className={cn("relative flex items-start gap-3 px-4 py-3 transition-colors duration-500", state === "active" && "bg-cyan/[0.04]", state === "failed" && "bg-alert/[0.05]")}>
                <span
                  className={cn(
                    "tabular mt-px font-mono text-2xs transition-colors",
                    state === "active" ? "text-cyan" : state === "done" ? "text-fg-muted" : state === "failed" ? "text-alert" : "text-fg-dim/70",
                  )}
                >
                  {s.code}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn("font-mono text-[11px] uppercase tracking-[0.08em] transition-colors", state === "active" ? "text-fg" : state === "done" ? "text-fg-muted" : state === "failed" ? "text-alert" : "text-fg-dim/80")}>
                    {s.label}
                  </p>
                  {state === "active" && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
                      <p className="mt-1.5 text-[12px] leading-snug text-fg-muted">{s.blurb}</p>
                      <div className="mt-2.5 h-px w-full bg-line-strong">
                        <div className="h-px bg-cyan shadow-[0_0_8px_rgb(var(--cyan))] transition-[width] duration-150 ease-linear" style={{ width: `${(status?.stageProgress ?? 0) * 100}%` }} />
                      </div>
                    </motion.div>
                  )}
                </div>
                <span className="mt-0.5 grid size-4 place-items-center">
                  {state === "done" ? (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 22 }}>
                      <Check className="size-3.5 text-signal" strokeWidth={2} />
                    </motion.span>
                  ) : state === "active" ? (
                    <span className="size-1.5 animate-blink rounded-full bg-cyan" />
                  ) : state === "failed" ? (
                    <span className="size-1.5 rounded-full bg-alert" />
                  ) : (
                    <span className="size-1 rounded-full bg-line-strong" />
                  )}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}
