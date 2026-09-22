"use client";

import { motion } from "framer-motion";
import { EVIDENCE_KINDS } from "@/lib/constants";
import { cn, formatClock, pct } from "@/lib/utils";
import type { Evidence } from "@/types";

const sevTone = (s: number) => (s >= 0.68 ? "text-alert" : s >= 0.4 ? "text-amber" : "text-fg-muted");
const sevBar = (s: number) => (s >= 0.68 ? "bg-alert" : s >= 0.4 ? "bg-amber" : "bg-fg-dim");

export function FindingsList({ evidence, selectedId, onSelect, isVideo }: { evidence: Evidence[]; selectedId?: string | null; onSelect: (id: string) => void; isVideo: boolean }) {
  return (
    <ul className="divide-y divide-line">
      {evidence.map((e, i) => {
        const active = e.id === selectedId;
        return (
          <motion.li key={e.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.06 * i, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
            <button
              onClick={() => onSelect(e.id)}
              aria-pressed={active}
              className={cn(
                "group relative flex w-full flex-col gap-2 px-4 py-3 text-left transition-colors",
                active ? "bg-ink-2" : "hover:bg-ink-2/60",
              )}
            >
              <span className={cn("absolute inset-y-0 left-0 w-px transition-opacity", sevBar(e.severity), active ? "opacity-100" : "opacity-0 group-hover:opacity-60")} />
              <span className="flex items-center justify-between gap-3">
                <span className={cn("font-mono text-2xs uppercase", sevTone(e.severity))}>{EVIDENCE_KINDS[e.kind].label}</span>
                {isVideo && e.timestampSec != null && <span className="tabular font-mono text-2xs text-fg-dim">F{String((e.frameIndex ?? 0) + 1).padStart(2, "0")} · {formatClock(e.timestampSec, true)}</span>}
              </span>
              <span className="text-[13px] leading-snug text-fg">{e.title}</span>
              <span className="flex items-center gap-3">
                <span className="flex h-1 flex-1 bg-line-strong">
                  <span className={cn("h-full transition-[width] duration-700", sevBar(e.severity))} style={{ width: `${e.severity * 100}%` }} />
                </span>
                <span className="tabular font-mono text-2xs text-fg-muted">{pct(e.severity, 0)}</span>
              </span>
            </button>
          </motion.li>
        );
      })}
    </ul>
  );
}
