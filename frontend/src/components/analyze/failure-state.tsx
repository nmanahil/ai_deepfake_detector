"use client";

import { RotateCcw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorPanel } from "@/components/states/error-panel";
import type { AnalysisError } from "@/types";

export function FailureState({ error, stageLabel, onRetry, onReset }: { error: AnalysisError; stageLabel?: string; onRetry: () => void; onReset: () => void }) {
  return (
    <ErrorPanel
      title="ANALYSIS INTERRUPTED"
      detail={`${error.message}${stageLabel ? ` The run stopped during ${stageLabel.toLowerCase()}.` : ""} No assessment was produced, and nothing has been saved to the archive.`}
      code={error.code.toUpperCase()}
      actions={
        <>
          {error.retryable && (
            <Button variant="primary" onClick={onRetry}>
              <RotateCcw /> Retry analysis
            </Button>
          )}
          <Button variant="secondary" onClick={onReset}>
            <Upload /> Submit different evidence
          </Button>
        </>
      }
    />
  );
}
