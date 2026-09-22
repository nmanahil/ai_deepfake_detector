"use client";

import Link from "next/link";
import { ScanLine, Trash2 } from "lucide-react";
import { useState } from "react";
import { HistoryList } from "@/components/history/history-list";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorPanel } from "@/components/states/error-panel";
import { LoadSamplesButton } from "@/components/states/load-samples";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { clearArchive, refreshArchive, useArchive } from "@/services/archive/store";

export default function HistoryPage() {
  const { summaries, loading, error } = useArchive();
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <PageHeader
        index="04"
        eyebrow="Analysis history"
        title={<>The evidence<br />archive.</>}
        description="Every completed analysis is stored with its full forensic record. Open any entry to review the evidence or generate a report."
        actions={
          summaries.length > 0 ? (
            confirm ? (
              <>
                <span className="font-mono text-2xs uppercase text-alert">Delete all {summaries.length} records?</span>
                <Button variant="ghost" size="sm" onClick={() => setConfirm(false)}>Cancel</Button>
                <Button variant="danger" size="sm" onClick={async () => { await clearArchive(); setConfirm(false); }}>Confirm</Button>
              </>
            ) : (
              <Button variant="secondary" size="sm" onClick={() => setConfirm(true)}><Trash2 /> Clear archive</Button>
            )
          ) : undefined
        }
      />
      <div className="space-y-5 p-4 sm:p-6 lg:p-8">
        {error ? (
          <ErrorPanel title="ARCHIVE UNAVAILABLE" detail="Browser storage could not be read. Private browsing or blocked site data can cause this." actions={<Button variant="secondary" onClick={() => void refreshArchive()}>Try again</Button>} />
        ) : loading ? (
          <div className="space-y-2">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-[76px]" />)}</div>
        ) : summaries.length === 0 ? (
          <Panel flush>
            <EmptyState
              title="NO EVIDENCE IN THE ARCHIVE"
              detail="Your analyzed media will appear here."
              actions={<><Button variant="primary" asChild><Link href="/analyze"><ScanLine /> Analyze media</Link></Button><LoadSamplesButton /></>}
            />
          </Panel>
        ) : (
          <HistoryList list={summaries} />
        )}
      </div>
    </>
  );
}
