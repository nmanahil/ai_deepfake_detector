"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { VerdictBadge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { formatRelative, pct } from "@/lib/utils";
import type { AnalysisSummary } from "@/types";

export function RecentList({ list }: { list: AnalysisSummary[] }) {
  return (
    <Panel title="Recent analyses" meta={<Link href="/history" className="text-cyan hover:underline">View all</Link>} flush>
      <ul className="divide-y divide-line">
        {list.slice(0, 6).map((a) => (
          <li key={a.id}>
            <Link href={`/history/${a.id}`} className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-ink-2/70">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.media.thumbnail} alt="" className="size-11 shrink-0 border border-line object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-[13px] text-fg">{a.media.filename}</p>
                <p className="label mt-1">{a.media.kind} · {formatRelative(a.createdAt)} · {a.id}</p>
              </div>
              <div className="hidden flex-col items-end gap-1.5 sm:flex">
                <VerdictBadge verdict={a.verdict} />
                <span className="tabular font-mono text-2xs text-fg-muted">{pct(a.confidence)}</span>
              </div>
              <ArrowUpRight className="size-4 shrink-0 text-fg-dim transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan" strokeWidth={1.5} />
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
