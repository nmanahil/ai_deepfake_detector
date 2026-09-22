"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AnalysisWorkspace } from "@/components/analyze/analysis-workspace";
import { ErrorPanel } from "@/components/states/error-panel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useStoredAnalysis } from "@/hooks/use-analysis";

export default function CaseFilePage() {
  const { id } = useParams<{ id: string }>();
  const { analysis, loading, missing } = useStoredAnalysis(id);

  if (loading) {
    return (
      <div className="space-y-5 p-4 sm:p-8">
        <Skeleton className="h-16" />
        <div className="grid gap-5 xl:grid-cols-[260px_1fr_340px]"><Skeleton className="h-[420px]" /><Skeleton className="h-[520px]" /><Skeleton className="h-[520px]" /></div>
      </div>
    );
  }
  if (missing || !analysis) {
    return (
      <div className="p-4 sm:p-8">
        <ErrorPanel title="RECORD NOT FOUND" detail={`No analysis with ID ${id} exists in this archive. It may have been deleted, or created in a different browser.`} code="NOT_FOUND" actions={<Button variant="secondary" asChild><Link href="/history">Back to archive</Link></Button>} />
      </div>
    );
  }
  return <AnalysisWorkspace analysis={analysis} backHref="/history" />;
}
