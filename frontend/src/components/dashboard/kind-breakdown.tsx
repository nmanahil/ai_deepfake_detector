"use client";

import { motion } from "framer-motion";
import { Panel } from "@/components/ui/panel";
import { pct } from "@/lib/utils";
import type { Stats } from "@/lib/stats";

/** Media-type breakdown: one proportional bar, then per-type detail rows. */
export function KindBreakdown({ stats }: { stats: Stats }) {
  const rows = [
    { key: "image", label: "Images", color: "bg-cyan", ...stats.byKind.image },
    { key: "video", label: "Video", color: "bg-azure", ...stats.byKind.video },
  ];
  const total = Math.max(1, stats.total);
  return (
    <Panel title="Media-type breakdown">
      <div className="flex h-3 gap-[2px]" role="img" aria-label={rows.map((r) => `${r.label} ${r.count}`).join(", ")}>
        {rows.map((r, i) => (
          <motion.div key={r.key} className={`${r.color} origin-left`} style={{ width: `${(r.count / total) * 100}%` }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.2 + i * 0.1, duration: 0.9, ease: [0.16, 1, 0.3, 1] }} />
        ))}
      </div>
      <ul className="mt-6 divide-y divide-line">
        {rows.map((r) => (
          <li key={r.key} className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 py-3.5">
            <span className="flex items-center gap-2.5 text-[13px] text-fg"><span className={`size-2 ${r.color}`} />{r.label}</span>
            <span className="tabular text-right font-mono text-sm text-fg">{r.count} <span className="text-fg-dim">· {pct(r.count / total, 0)}</span></span>
            <span className="label">Avg. confidence {r.count ? pct(r.avgConfidence, 1) : "—"}</span>
            <span className="label text-right">{r.flagged} flagged</span>
          </li>
        ))}
      </ul>
      <p className="label mt-1">Audio · planned</p>
    </Panel>
  );
}
