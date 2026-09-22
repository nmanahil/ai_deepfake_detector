"use client";

import { Database } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { loadSampleArchive, SAMPLE_TOTAL } from "@/services/archive/samples";

/** Populates the archive with simulated analyses so dashboards can be explored. */
export function LoadSamplesButton({ variant = "secondary" }: { variant?: "secondary" | "ghost" }) {
  const [progress, setProgress] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const run = async () => {
    setFailed(false);
    setProgress(0);
    try {
      await loadSampleArchive((d) => setProgress(d));
    } catch {
      setFailed(true);
    } finally {
      setProgress(null);
    }
  };
  return (
    <Button variant={variant} onClick={run} disabled={progress !== null} aria-live="polite">
      <Database />
      {progress !== null ? `Generating ${progress}/${SAMPLE_TOTAL}` : failed ? "Retry sample archive" : "Load sample archive"}
    </Button>
  );
}
