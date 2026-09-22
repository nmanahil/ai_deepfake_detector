"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Square, X } from "lucide-react";
import Link from "next/link";
import { AnalysisWorkspace } from "@/components/analyze/analysis-workspace";
import { DemoControls } from "@/components/analyze/demo-controls";
import { DragOverlay } from "@/components/analyze/drag-overlay";
import { EventLog } from "@/components/analyze/event-log";
import { FailureState } from "@/components/analyze/failure-state";
import { IntakeChamber } from "@/components/analyze/intake-chamber";
import { MediaSummary } from "@/components/analyze/media-summary";
import { PipelineRail } from "@/components/analyze/pipeline-rail";
import { ScanFrame } from "@/components/analyze/scan-frame";
import { TelemetryReadout } from "@/components/analyze/telemetry-readout";
import { AnalysisTopBar } from "@/components/analyze/topbar";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorPanel } from "@/components/states/error-panel";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { PIPELINE } from "@/lib/constants";
import { useAnalysisSession } from "@/hooks/use-analysis-session";
import { useFileDrop } from "@/hooks/use-file-drop";
import { detection } from "@/services/detection";

function IntakeNotes() {
  return (
    <Panel title="Intake requirements">
      <dl className="space-y-3 text-[13px]">
        {[
          ["Images", "JPEG · PNG · WebP"],
          ["Video", "MP4 · WebM · MOV"],
          ["Audio", "Planned"],
          ["Limit", "200 MB per file"],
        ].map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-4 border-b border-line pb-3 last:border-0 last:pb-0">
            <dt className="label">{k}</dt>
            <dd className="font-mono text-xs text-fg">{v}</dd>
          </div>
        ))}
      </dl>
      {detection.simulated && (
        <p className="mt-4 border-t border-line pt-4 text-[12px] leading-relaxed text-fg-muted">
          The demo engine runs entirely in your browser. Files are not uploaded anywhere.
        </p>
      )}
    </Panel>
  );
}

export default function AnalyzePage() {
  const s = useAnalysisSession();
  const dragging = useFileDrop(s.submit, s.phase !== "running");

  if (s.phase === "completed" && s.analysis) {
    return (
      <>
        <AnalysisWorkspace key={s.analysis.id} analysis={s.analysis} onNew={s.reset} />
        <DragOverlay active={dragging} />
      </>
    );
  }

  const running = s.phase === "running";
  const failed = s.phase === "failed";
  const stage = s.status ? PIPELINE[s.status.stageIndex] : undefined;

  return (
    <>
      <AnalysisTopBar
        phase={s.phase}
        status={s.status}
        media={s.status?.media}
        id={s.status?.id}
        actions={
          running ? (
            <Button variant="danger" size="sm" onClick={s.abort}>
              <Square className="size-3" /> Abort
            </Button>
          ) : undefined
        }
      />
      <div className="ws-grid gap-4 p-4 sm:gap-5 sm:p-6 lg:p-8">
        <div className="ws-left space-y-4">
          {s.status?.media ? (
            <MediaSummary media={s.status.media} id={s.status.id} />
          ) : running ? (
            <Panel title="Evidence item" flush>
              <Skeleton className="h-[220px]" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </Panel>
          ) : (
            <IntakeNotes />
          )}
          {!running && <DemoControls />}
        </div>

        <div className="ws-center min-w-0 space-y-4">
          <AnimatePresence>
            {s.rejection && (
              <motion.div key="rej" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <ErrorPanel
                  compact
                  tone="amber"
                  title={s.rejection.message}
                  detail={s.rejection.detail}
                  code={s.rejection.code.toUpperCase()}
                  actions={
                    <Button variant="secondary" size="sm" onClick={s.dismissRejection}>
                      <X /> Dismiss
                    </Button>
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>

          {failed && s.error ? (
            <FailureState error={s.error} stageLabel={stage?.label} onRetry={s.retry} onReset={s.reset} />
          ) : running ? (
            <>
              <ScanFrame media={s.status?.media} status={s.status} />
              <TelemetryReadout status={s.status} />
            </>
          ) : (
            <IntakeChamber dragging={dragging} onFile={s.submit} />
          )}
        </div>

        <div className="ws-right min-w-0 space-y-4">
          <PipelineRail status={s.status} idle={s.phase === "idle"} />
          {s.phase === "idle" && (
            <p className="border border-line bg-ink-1/60 p-4 text-[12px] leading-relaxed text-fg-muted">
              Results are probabilistic. Every assessment is accompanied by the evidence behind it, and none is presented as proof.
            </p>
          )}
        </div>

        <div className="ws-bottom min-w-0">
          <Panel title="Forensic timeline" meta={running ? <span className="text-cyan">Live</span> : undefined} flush>
            {s.status && s.status.log.length ? (
              <EventLog entries={s.status.log} follow className="max-h-[220px]" />
            ) : (
              <EmptyState
                compact
                title="NO EVIDENCE LOADED"
                detail="The forensic timeline and evidence log will populate as soon as analysis begins."
                actions={
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/history">Open archive</Link>
                  </Button>
                }
              />
            )}
          </Panel>
        </div>
      </div>
      <DragOverlay active={dragging} />
    </>
  );
}
