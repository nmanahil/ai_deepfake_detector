"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/states/empty-state";
import { SimulatedTag, Tag, VerdictBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { cn, formatClock, formatDate, pct } from "@/lib/utils";
import { removeAnalysis } from "@/services/archive/store";
import type { AnalysisSummary, Verdict } from "@/types";

type VerdictFilter = "all" | Verdict;
type KindFilter = "all" | "image" | "video";
type Sort = "newest" | "oldest" | "confidence" | "risk";

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-pressed={active} className={cn("h-8 border px-3 font-mono text-2xs uppercase transition-colors", active ? "border-cyan/60 bg-cyan/10 text-cyan" : "border-line-strong text-fg-muted hover:text-fg")}>
      {children}
    </button>
  );
}

export function HistoryList({ list }: { list: AnalysisSummary[] }) {
  const [q, setQ] = useState("");
  const [verdict, setVerdict] = useState<VerdictFilter>("all");
  const [kind, setKind] = useState<KindFilter>("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [confirm, setConfirm] = useState<string | null>(null);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = list.filter((a) => (verdict === "all" || a.verdict === verdict) && (kind === "all" || a.media.kind === kind) && (!needle || a.media.filename.toLowerCase().includes(needle) || a.id.toLowerCase().includes(needle)));
    const cmp: Record<Sort, (a: AnalysisSummary, b: AnalysisSummary) => number> = {
      newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
      oldest: (a, b) => a.createdAt.localeCompare(b.createdAt),
      confidence: (a, b) => b.confidence - a.confidence,
      risk: (a, b) => b.manipulationScore - a.manipulationScore,
    };
    return out.sort(cmp[sort]);
  }, [list, q, verdict, kind, sort]);

  const filtered = q || verdict !== "all" || kind !== "all";
  const reset = () => { setQ(""); setVerdict("all"); setKind("all"); };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 border border-line bg-ink-1/60 p-3 lg:flex-row lg:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search filename or analysis ID</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-fg-dim" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search filename or ID…" className="h-9 w-full border border-line-strong bg-ink pl-9 pr-3 font-mono text-xs text-fg placeholder:text-fg-dim focus:border-cyan focus:outline-none" />
        </label>
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by result">
          {(["all", "authentic", "suspicious", "manipulated"] as const).map((v) => <Chip key={v} active={verdict === v} onClick={() => setVerdict(v)}>{v === "all" ? "All results" : v}</Chip>)}
        </div>
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by media type">
          {(["all", "image", "video"] as const).map((v) => <Chip key={v} active={kind === v} onClick={() => setKind(v)}>{v === "all" ? "All media" : v}</Chip>)}
        </div>
        <label className="flex items-center gap-2 font-mono text-2xs uppercase text-fg-dim">
          Sort
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-9 border border-line-strong bg-ink px-2 font-mono text-2xs uppercase text-fg focus:border-cyan focus:outline-none">
            <option value="newest">Newest</option><option value="oldest">Oldest</option><option value="confidence">Confidence</option><option value="risk">Manipulation score</option>
          </select>
        </label>
      </div>

      <Panel flush corners={false} title={`${rows.length} of ${list.length} records`}>
        <div className="hidden grid-cols-[64px_minmax(0,1.6fr)_120px_100px_170px_90px_130px_40px] gap-4 border-b border-line px-4 py-2.5 lg:grid">
          {["", "Filename", "Date", "Type", "Result", "Confidence", "Analysis ID", ""].map((h, i) => <span key={i} className="label">{h}</span>)}
        </div>
        {rows.length === 0 ? (
          <EmptyState compact title="NO MATCHING EVIDENCE" detail="No records match the current filters." actions={<Button variant="secondary" size="sm" onClick={reset}><X /> Clear filters</Button>} />
        ) : (
          <ul className="divide-y divide-line">
            <AnimatePresence initial={false}>
              {rows.map((a, i) => (
                <motion.li key={a.id} layout="position" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: Math.min(i, 10) * 0.03, duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="group relative">
                  <div className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-4 py-3 transition-colors group-hover:bg-ink-2/70 lg:grid-cols-[64px_minmax(0,1.6fr)_120px_100px_170px_90px_130px_40px]">
                    <Link href={`/history/${a.id}`} aria-label={`Open forensic report for ${a.media.filename}`} className="absolute inset-0 z-0 lg:right-12" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.media.thumbnail} alt="" className="pointer-events-none relative size-14 border border-line object-cover lg:size-[52px]" />
                    <div className="pointer-events-none relative min-w-0">
                      <p className="truncate font-mono text-[13px] text-fg">{a.media.filename}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 lg:hidden">
                        <span className="label">{formatDate(a.createdAt)}</span>
                        <span className="label text-cyan">{a.id}</span>
                      </p>
                      <p className="label mt-1 hidden lg:block">{a.media.kind === "video" ? `${formatClock(a.media.durationSec ?? 0)} · ` : ""}{a.evidenceCount} evidence item{a.evidenceCount === 1 ? "" : "s"}{a.sample ? " · sample" : ""}</p>
                    </div>
                    <span className="pointer-events-none relative hidden font-mono text-xs text-fg-muted lg:block">{formatDate(a.createdAt)}</span>
                    <span className="pointer-events-none relative hidden lg:block"><Tag>{a.media.kind}</Tag></span>
                    <div className="pointer-events-none relative flex flex-col items-end gap-1.5 lg:items-start">
                      <VerdictBadge verdict={a.verdict} />
                      <span className="tabular font-mono text-2xs text-fg-muted lg:hidden">{pct(a.confidence)}</span>
                    </div>
                    <span className="tabular pointer-events-none relative hidden font-mono text-xs text-fg lg:block">{pct(a.confidence)}</span>
                    <span className="pointer-events-none relative hidden font-mono text-xs text-cyan lg:block">{a.id}</span>
                    <button onClick={() => setConfirm(a.id)} aria-label={`Delete ${a.media.filename}`} className="relative z-10 hidden size-8 place-items-center text-fg-dim opacity-0 transition-all hover:text-alert focus-visible:opacity-100 group-hover:opacity-100 lg:grid">
                      <Trash2 className="size-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                  {confirm === a.id && (
                    <div role="alertdialog" aria-label="Confirm deletion" className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-t border-alert/30 bg-alert/[0.06] px-4 py-3">
                      <p className="font-mono text-2xs uppercase text-alert">Remove this record from the archive?</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setConfirm(null)}>Cancel</Button>
                        <Button size="sm" variant="danger" onClick={async () => { await removeAnalysis(a.id); setConfirm(null); }}>Delete</Button>
                      </div>
                    </div>
                  )}
                  {a.simulated && <span className="hidden" aria-hidden><SimulatedTag /></span>}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </Panel>
      {filtered && rows.length > 0 && <button onClick={reset} className="font-mono text-2xs uppercase text-cyan hover:underline">Clear filters</button>}
    </div>
  );
}
