"use client";

import { motion } from "framer-motion";
import { useCountUp } from "@/hooks/use-count-up";
import { cn } from "@/lib/utils";
import type { Stats } from "@/lib/stats";

function Num({ value, decimals = 0, suffix = "" }: { value: number; decimals?: number; suffix?: string }) {
  const t = useCountUp(value, { duration: 1.2, decimals });
  return <>{t}{suffix}</>;
}

/** Ruled KPI strip — hairline dividers rather than a wall of cards. */
export function KpiGrid({ stats }: { stats: Stats }) {
  const tiles = [
    { label: "Total analyses", value: stats.total, tone: "text-fg", bar: "bg-fg-muted", share: 1 },
    { label: "Authentic media", value: stats.byVerdict.authentic, tone: "text-signal", bar: "bg-signal", share: stats.total ? stats.byVerdict.authentic / stats.total : 0 },
    { label: "Suspicious media", value: stats.byVerdict.suspicious, tone: "text-amber", bar: "bg-amber", share: stats.total ? stats.byVerdict.suspicious / stats.total : 0 },
    { label: "Likely manipulated", value: stats.byVerdict.manipulated, tone: "text-alert", bar: "bg-alert", share: stats.total ? stats.byVerdict.manipulated / stats.total : 0 },
    { label: "Avg. confidence", value: stats.avgConfidence * 100, decimals: 1, suffix: "%", tone: "text-cyan", bar: "bg-cyan", share: stats.avgConfidence },
  ];
  return (
    <dl className="grid grid-cols-2 border border-line bg-ink-1/60 sm:grid-cols-3 xl:grid-cols-5">
      {tiles.map((t, i) => (
        <motion.div
          key={t.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={cn("relative border-line p-5", "border-b border-r [&:nth-child(2n)]:border-r-0 sm:[&:nth-child(2n)]:border-r sm:[&:nth-child(3n)]:border-r-0 xl:[&:nth-child(3n)]:border-r xl:[&:nth-child(5n)]:border-r-0 xl:border-b-0", i === tiles.length - 1 && "col-span-2 border-r-0 sm:col-span-1")}
        >
          <dt className="label">{t.label}</dt>
          <dd className={cn("tabular mt-4 font-mono text-4xl font-medium leading-none", t.tone)}>
            <Num value={t.value} decimals={t.decimals} suffix={t.suffix} />
          </dd>
          <div className="mt-5 h-[2px] bg-line-strong/70">
            <motion.div className={cn("h-full", t.bar)} initial={{ width: 0 }} animate={{ width: `${t.share * 100}%` }} transition={{ delay: 0.3 + i * 0.06, duration: 1, ease: [0.16, 1, 0.3, 1] }} />
          </div>
        </motion.div>
      ))}
    </dl>
  );
}
