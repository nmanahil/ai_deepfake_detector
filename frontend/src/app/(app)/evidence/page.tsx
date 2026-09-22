"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ScanLine } from "lucide-react";
import { EvidenceExplorer } from "@/components/evidence/explorer";
import { EvidenceTimeline } from "@/components/evidence/timeline";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";
import { LoadSamplesButton } from "@/components/states/load-samples";
import { VerdictBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { useStoredAnalysis } from "@/hooks/use-analysis";
import { useAnalysisSession } from "@/hooks/use-analysis-session";
import { pct } from "@/lib/utils";
import { useArchive } from "@/services/archive/store";

function EvidenceInner() {
  const { summaries, loading } = useArchive();
  const session = useAnalysisSession();
  const router = useRouter();
  const params = useSearchParams();
  const wanted = params.get("id") ?? session.analysis?.id ?? summaries[0]?.id ?? null;
  const { analysis, loading: loadingRecord } = useStoredAnalysis(loading ? null : wanted);
  const [frame, setFrame] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => { setFrame(0); setSelected(null); }, [analysis?.id]);

  return (
    <>
      <PageHeader
        index="03"
        eyebrow="Evidence explorer"
        title={<>Inspect the<br />evidence itself.</>}
        description="Switch between the source frame and forensic layers, overlay what the system flagged, and step through video frame by frame."
        actions={
          summaries.length > 0 ? (
            <label className="flex items-center gap-3 font-mono text-2xs uppercase text-fg-dim">
              Case
              <select value={wanted ?? ""} onChange={(e) => router.replace(`/evidence?id=${e.target.value}`)} className="h-10 max-w-[280px] border border-line-strong bg-ink-1 px-3 font-mono text-xs normal-case text-fg focus:border-cyan focus:outline-none">
                {summaries.map((s) => <option key={s.id} value={s.id}>{s.media.filename} · {s.id}</option>)}
              </select>
            </label>
          ) : undefined
        }
      />
      <div className="space-y-5 p-4 sm:p-6 lg:p-8">
        {loading || (wanted && loadingRecord) ? (
          <Skeleton className="h-[560px]" />
        ) : !analysis ? (
          <Panel flush>
            <EmptyState title="NO EVIDENCE IN THE ARCHIVE" detail="Analyze a file and its forensic layers will be available to inspect here." actions={<><Button variant="primary" asChild><Link href="/analyze"><ScanLine /> Analyze media</Link></Button><LoadSamplesButton /></>} />
          </Panel>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border border-line bg-ink-1/60 px-4 py-3">
              <span className="font-mono text-[13px] text-fg">{analysis.media.filename}</span>
              <VerdictBadge verdict={analysis.result.verdict} />
              <span className="label">Confidence <span className="text-fg">{pct(analysis.result.confidence)}</span></span>
              <span className="label text-cyan">{analysis.id}</span>
              <Link href={`/history/${analysis.id}`} className="label ml-auto hover:text-cyan">Full case file →</Link>
            </div>
            <EvidenceExplorer key={analysis.id} wide analysis={analysis} frame={frame} onFrame={setFrame} selectedId={selected} onSelect={setSelected} />
            <EvidenceTimeline analysis={analysis} frame={frame} selectedId={selected} onSelect={(id) => { setSelected(id); const e = analysis.evidence.find((x) => x.id === id); if (e?.frameIndex != null && analysis.media.kind === "video") setFrame(e.frameIndex); }} onFrame={setFrame} />
          </>
        )}
      </div>
    </>
  );
}

export default function EvidencePage() {
  return <Suspense fallback={<div className="p-8"><Skeleton className="h-[560px]" /></div>}><EvidenceInner /></Suspense>;
}
