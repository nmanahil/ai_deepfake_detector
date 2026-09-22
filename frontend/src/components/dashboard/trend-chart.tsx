"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Panel } from "@/components/ui/panel";
import { Segmented } from "@/components/ui/segmented";
import { dailyBuckets } from "@/lib/stats";
import { cn } from "@/lib/utils";
import type { AnalysisSummary, Verdict } from "@/types";

const SERIES: { key: Verdict; label: string; bg: string }[] = [
  { key: "authentic", label: "Authentic", bg: "bg-signal" },
  { key: "suspicious", label: "Suspicious", bg: "bg-amber" },
  { key: "manipulated", label: "Likely manipulated", bg: "bg-alert" },
];

const niceMax = (n: number) => (n <= 4 ? 4 : n <= 8 ? 8 : Math.ceil(n / 4) * 4);

/** Stacked daily counts by verdict. HTML/CSS columns so it reflows cleanly at any width. */
export function TrendChart({ list }: { list: AnalysisSummary[] }) {
  const [range, setRange] = useState<"14" | "30">("14");
  const [hover, setHover] = useState<number | null>(null);
  const data = useMemo(() => dailyBuckets(list, Number(range)), [list, range]);
  const max = niceMax(Math.max(1, ...data.map((d) => d.total)));
  const cols = data.length;
  const active = hover != null ? data[hover] : null;

  return (
    <Panel
      title="Detection trends"
      meta={<Segmented label="Time range" value={range} onChange={setRange} options={[{ value: "14", label: "14D" }, { value: "30", label: "30D" }]} />}
    >
      <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="Legend">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-2 font-mono text-2xs uppercase text-fg-muted">
            <span className={cn("size-2", s.bg)} /> {s.label}
          </span>
        ))}
      </div>

      <div className="relative flex gap-3">
        <div aria-hidden className="flex h-[220px] w-6 shrink-0 flex-col justify-between text-right font-mono text-[10px] text-fg-dim">
          {[max, max / 2, 0].map((v) => <span key={v}>{v}</span>)}
        </div>
        <div className="relative min-w-0 flex-1">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 flex h-[220px] flex-col justify-between">
            {[0, 1, 2].map((i) => <span key={i} className="h-px w-full bg-line/80" />)}
          </div>
          <div className="relative flex h-[220px] items-end gap-[3px] sm:gap-1.5" onMouseLeave={() => setHover(null)} role="group" aria-label={`Daily analyses by verdict, last ${range} days`}>
            {data.map((d, i) => (
              <button
                key={d.key}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                aria-label={`${d.date.toDateString()}: ${d.total} analyses. ${d.authentic} authentic, ${d.suspicious} suspicious, ${d.manipulated} likely manipulated.`}
                className={cn("group relative flex h-full min-w-0 flex-1 flex-col justify-end gap-[2px] transition-opacity focus-visible:outline-offset-2", hover != null && hover !== i && "opacity-45")}
              >
                <span aria-hidden className={cn("absolute inset-0 -z-0 transition-colors", hover === i && "bg-white/[0.04]")} />
                {SERIES.map((s, si) => {
                  const h = (d[s.key] / max) * 100;
                  if (!d[s.key]) return null;
                  return (
                    <motion.span
                      key={s.key}
                      className={cn("relative w-full origin-bottom", s.bg, si === 0 && "rounded-b-[2px]")}
                      style={{ height: `${h}%` }}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 0.15 + i * 0.025, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    />
                  );
                })}
              </button>
            ))}
          </div>
          <div aria-hidden className="mt-2 flex gap-[3px] sm:gap-1.5">
            {data.map((d, i) => (
              <span key={d.key} className="min-w-0 flex-1 text-center font-mono text-[9px] text-fg-dim">
                {(cols <= 14 || i % 3 === 0) && (i % (cols > 14 ? 3 : 2) === 0 || i === cols - 1) ? d.date.getDate() : ""}
              </span>
            ))}
          </div>
          {active && hover != null && (
            <div
              role="status"
              className="pointer-events-none absolute top-2 z-20 min-w-[168px] border border-line-strong bg-ink-2 p-3 shadow-2xl"
              style={{ left: `${((hover + 0.5) / cols) * 100}%`, transform: `translateX(${hover > cols / 2 ? "calc(-100% - 12px)" : "12px"})` }}
            >
              <p className="font-mono text-2xs uppercase text-fg">{active.date.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })}</p>
              <ul className="mt-2 space-y-1">
                {SERIES.map((s) => (
                  <li key={s.key} className="flex items-center justify-between gap-4 font-mono text-2xs uppercase text-fg-muted">
                    <span className="flex items-center gap-2"><span className={cn("size-1.5", s.bg)} />{s.label}</span>
                    <span className="tabular text-fg">{active[s.key]}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <table className="sr-only">
        <caption>Daily analyses by verdict</caption>
        <thead><tr><th>Date</th><th>Authentic</th><th>Suspicious</th><th>Likely manipulated</th></tr></thead>
        <tbody>{data.map((d) => <tr key={d.key}><td>{d.date.toDateString()}</td><td>{d.authentic}</td><td>{d.suspicious}</td><td>{d.manipulated}</td></tr>)}</tbody>
      </table>
    </Panel>
  );
}
