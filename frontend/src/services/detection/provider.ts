import type { Analysis, AnalysisHandle, AnalysisStatus, AnalyzeOptions } from "@/types";

/**
 * The seam between the UI and whatever performs detection.
 *
 * The UI only ever talks to a `DetectionProvider`. Today that is the in-browser
 * mock engine; tomorrow it is `HttpDetectionProvider` pointing at a Python
 * FastAPI service (PyTorch · OpenCV · FFmpeg). Swap by changing
 * `NEXT_PUBLIC_DETECTION_PROVIDER` — no component changes are required.
 */
export interface DetectionProvider {
  readonly id: "mock" | "http";
  readonly label: string;
  /** `true` when results are produced by a demo engine rather than a trained model. */
  readonly simulated: boolean;

  /** Submit media. Resolves as soon as a job exists; poll status for progress. */
  analyzeMedia(file: File, options?: AnalyzeOptions): Promise<AnalysisHandle>;
  /** Live stage, progress and telemetry for a job. */
  getAnalysisStatus(id: string): Promise<AnalysisStatus>;
  /** The complete record. Only valid once status is `completed`. */
  getAnalysisResult(id: string): Promise<Analysis>;
  /** Best-effort cancellation. */
  cancelAnalysis(id: string): Promise<void>;
}

export type DetectionErrorCode = "network" | "rejected" | "not_found" | "not_ready" | "failed" | "cancelled";

export class DetectionError extends Error {
  constructor(
    public code: DetectionErrorCode,
    message: string,
    public retryable = true,
  ) {
    super(message);
    this.name = "DetectionError";
  }
}
