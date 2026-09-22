"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, FileText, Plus } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { EvidenceExplorer } from "@/components/evidence/explorer";
import { EvidenceTimeline } from "@/components/evidence/timeline";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { Segmented } from "@/components/ui/segmented";
import type { Analysis } from "@/types";
import { EventLog } from "./event-log";
import { MediaSummary } from "./media-summary";
import { ResultPanel } from "./result-panel";
import { AnalysisTopBar } from "./topbar";
import { VerdictDial } from "./verdict-dial";

/**
 * The completed-analysis workspace: LEFT media · CENTER assessment / explorer ·
 * RIGHT results · BOTTOM timeline. Shared by /analyze and the archived case file.
 */
export function AnalysisWorkspace({ analysis, onNew, backHref }: { analysis: Analysis; onNew?: () => void; backHref?: string }) {
  const [view, setView] = useState<"assessment" | "explorer">("assessment");
  const [frame, setFrame] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const select = useCallback((id: string) => {
    setSelectedId(id);
    const ev = analysis.evidence.find((e) => e.id === id);
    if (ev?.frameIndex != null && analysis.media.kind === "video") setFrame(ev.frameIndex);
    setView("explorer");
  }, [analysis]);

  return (
    <>
      <AnalysisTopBar
        phase="completed"
        media={analysis.media}
        id={analysis.id}
        actions={
          <>
            {backHref && (
              <Button variant="ghost" size="sm" asChild>
                <Link href={backHref}><ArrowLeft className="size-3.5" /> Archive</Link>
              </Button>
            )}
            {onNew && (
              <Button variant="secondary" size="sm" onClick={onNew}>
                <Plus /> New analysis
              </Button>
            )}
            <Button variant="primary" size="sm" asChild>
              <Link href={`/report/${analysis.id}`}>
                <FileText className="size-3.5" /> Forensic report
              </Link>
            </Button>
          </>
        }
      />
      <div className="ws-grid gap-4 p-4 sm:gap-5 sm:p-8">
        <div className="ws-left space-y-4">
          <MediaSummary media={analysis.media} id={analysis.id} />
        </div>

        <div className="ws-center min-w-0 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Segmented
              label="Center view"
              value={view}
              onChange={setView}
              options={[
                { value: "assessment", label: "Assessment" },
                { value: "explorer", label: "Evidence explorer" },
              ]}
            />
            <span className="label hidden sm:block">{view === "assessment" ? "Authenticity assessment" : "Layered forensic viewer"}</span>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            {view === "assessment" ? (
              <motion.div key="assessment" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <Panel className="overflow-hidden" bodyClassName="relative px-2 py-8 sm:px-6 sm:py-10">
                  <div aria-hidden className="bg-grid mask-fade-radial pointer-events-none absolute inset-0 opacity-40" />
                  <VerdictDial key={analysis.id} result={analysis.result} />
                </Panel>
              </motion.div>
            ) : (
              <motion.div key="explorer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <EvidenceExplorer analysis={analysis} frame={frame} onFrame={setFrame} selectedId={selectedId} onSelect={setSelectedId} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="ws-right min-w-0">
          <ResultPanel analysis={analysis} selectedId={selectedId} onSelect={select} />
        </div>

        <div className="ws-bottom grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <EvidenceTimeline analysis={analysis} frame={frame} selectedId={selectedId} onSelect={select} onFrame={(i) => { setFrame(i); setView("explorer"); }} />
          <Panel title="Event log" flush>
            <EventLog entries={analysis.log} />
          </Panel>
        </div>
      </div>
    </>
  );
}
