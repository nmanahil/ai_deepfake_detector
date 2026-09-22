"use client";

import Link from "next/link";
import { ScanLine } from "lucide-react";
import { useMemo } from "react";
import { KindBreakdown } from "@/components/dashboard/kind-breakdown";
import { KpiGrid } from "@/components/dashboard/kpi-grid";
import { RecentList } from "@/components/dashboard/recent-list";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";
import { LoadSamplesButton } from "@/components/states/load-samples";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { SimulatedTag } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { computeStats } from "@/lib/stats";
import { useArchive } from "@/services/archive/store";

export default function OverviewPage() {
  const { summaries, loading } = useArchive();
  const stats = useMemo(() => computeStats(summaries), [summaries]);
  const hasSim = summaries.some((s) => s.simulated);

  return (
    <>
      <PageHeader
        index="01"
        eyebrow="Media forensics dashboard"
        title={<>Everything the lab<br />has <em className="text-cyan not-italic">examined</em>.</>}
        description="A running view of analyses, verdicts and confidence across your archive."
        actions={
          <Button variant="primary" asChild>
            <Link href="/analyze"><ScanLine /> Analyze media</Link>
          </Button>
        }
      />
      <div className="space-y-5 p-4 sm:p-6 lg:p-8">
        {loading ? (
          <>
            <Skeleton className="h-[148px]" />
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]"><Skeleton className="h-[380px]" /><Skeleton className="h-[380px]" /></div>
          </>
        ) : summaries.length === 0 ? (
          <Panel flush>
            <EmptyState
              title="NO EVIDENCE IN THE ARCHIVE"
              detail="Your analyzed media will appear here. Analyze a file, or load a simulated sample archive to explore the dashboard."
              actions={<><Button variant="primary" asChild><Link href="/analyze"><ScanLine /> Analyze media</Link></Button><LoadSamplesButton /></>}
            />
          </Panel>
        ) : (
          <>
            {hasSim && <div className="flex items-center gap-3"><SimulatedTag label="SIMULATED RESULTS" /><span className="label">Verdicts in this archive come from the demo engine.</span></div>}
            <KpiGrid stats={stats} />
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
              <TrendChart list={summaries} />
              <KindBreakdown stats={stats} />
            </div>
            <RecentList list={summaries} />
          </>
        )}
      </div>
    </>
  );
}
