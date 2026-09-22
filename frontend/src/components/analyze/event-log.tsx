"use client";

import { useEffect, useRef } from "react";
import { PIPELINE } from "@/lib/constants";
import { cn, formatClock } from "@/lib/utils";
import type { LogEntry } from "@/types";

export function EventLog({ entries, follow, className }: { entries: LogEntry[]; follow?: boolean; className?: string }) {
  const ref = useRef<HTMLOListElement>(null);
  useEffect(() => {
    if (follow && ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [entries.length, follow]);

  if (!entries.length) {
    return <p className={cn("label px-4 py-8 text-center", className)}>Awaiting events…</p>;
  }
  return (
    <ol ref={ref} className={cn("max-h-[240px] space-y-1 overflow-y-auto px-4 py-3 font-mono text-[11px] leading-relaxed", className)} aria-label="Event log">
      {entries.map((e, i) => {
        const st = PIPELINE.find((p) => p.id === e.stage);
        return (
          <li key={i} className="flex gap-3">
            <span className="tabular shrink-0 text-fg-dim">{formatClock(e.t / 1000, true)}</span>
            <span className="shrink-0 text-cyan/70">{st?.code}</span>
            <span className={cn(e.level === "ok" ? "text-fg" : e.level === "warn" ? "text-amber" : "text-fg-muted")}>
              {e.level === "ok" && <span className="mr-1.5 text-signal">✓</span>}
              {e.message}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
