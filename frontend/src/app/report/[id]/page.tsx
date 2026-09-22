"use client";

import { ArrowLeft, Download, Printer } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ReportDocument } from "@/components/report/report-document";
import { ErrorPanel } from "@/components/states/error-panel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useStoredAnalysis } from "@/hooks/use-analysis";
import { downloadBlob } from "@/lib/utils";
import type { Analysis } from "@/types";

/** JSON export omits embedded imagery — it is the machine-readable summary of the assessment. */
function exportJson(a: Analysis) {
  const { preview: _p, layers, frames, heatmap: _h, media, ...rest } = a;
  void _p; void _h;
  const doc = {
    ...rest,
    media: { ...media, thumbnail: undefined, previewUrl: undefined },
    layers: layers.map(({ dataUrl: _d, ...l }) => { void _d; return l; }),
    frames: frames.map(({ thumbnail: _t, heatmapUrl: _u, ...f }) => { void _t; void _u; return f; }),
  };
  downloadBlob(new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" }), `vera-report-${a.id}.json`);
}

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const { analysis, loading, missing } = useStoredAnalysis(id);
  return (
    <div className="min-h-dvh bg-ink-1 print:bg-white">
      <div className="no-print sticky top-0 z-30 border-b border-line bg-ink/95 backdrop-blur">
        <div className="mx-auto flex max-w-[860px] flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Button variant="ghost" size="sm" asChild><Link href={`/history/${id}`}><ArrowLeft /> Case file</Link></Button>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" disabled={!analysis} onClick={() => analysis && exportJson(analysis)}><Download /> JSON</Button>
            <Button variant="primary" size="sm" disabled={!analysis} onClick={() => window.print()}><Printer /> Save as PDF</Button>
          </div>
        </div>
      </div>
      <main id="main" className="px-3 py-6 sm:px-6 sm:py-10 print:p-0">
        {loading ? <div className="mx-auto max-w-[860px]"><Skeleton className="h-[900px]" /></div> : missing || !analysis ? (
          <div className="mx-auto max-w-[860px]"><ErrorPanel title="REPORT UNAVAILABLE" detail={`No analysis with ID ${id} could be found, so there is nothing to report on.`} code="NOT_FOUND" actions={<Button variant="secondary" asChild><Link href="/history">Back to archive</Link></Button>} /></div>
        ) : <ReportDocument analysis={analysis} />}
      </main>
    </div>
  );
}
