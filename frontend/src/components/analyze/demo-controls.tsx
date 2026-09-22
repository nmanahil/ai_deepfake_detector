"use client";

import { useSyncExternalStore } from "react";
import { FlaskConical } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { Segmented } from "@/components/ui/segmented";
import { SimulatedTag } from "@/components/ui/badge";
import { detection } from "@/services/detection";
import { getForcedOutcome, setForcedOutcome, subscribeForced, type ForcedOutcome } from "@/services/detection/mock/controls";

/** Lets a presenter force each outcome of the mock engine. Hidden when a real backend is configured. */
export function DemoControls() {
  const value = useSyncExternalStore(subscribeForced, getForcedOutcome, () => "auto" as ForcedOutcome);
  if (!detection.simulated) return null;
  return (
    <Panel title={<><FlaskConical className="size-3" /> Demo controls</>} meta={<SimulatedTag label="MOCK ENGINE" />}>
      <p className="mb-3 text-[12px] leading-relaxed text-fg-muted">
        The demo engine does not detect anything. Force the outcome it will report for the next file.
      </p>
      <Segmented<ForcedOutcome>
        label="Forced outcome"
        value={value}
        onChange={setForcedOutcome}
        className="w-full [&>button]:flex-1 [&>button]:px-1"
        options={[
          { value: "auto", label: "Auto" },
          { value: "authentic", label: "Auth" },
          { value: "suspicious", label: "Susp" },
          { value: "manipulated", label: "Manip" },
          { value: "fail", label: "Fail" },
        ]}
      />
      <p className="label mt-3">
        {value === "auto" ? "Outcome derived from the file hash" : value === "fail" ? "Pipeline will be interrupted mid-run" : `Will report: ${value}`}
      </p>
    </Panel>
  );
}
