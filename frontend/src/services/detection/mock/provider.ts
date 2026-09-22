import type { Analysis, AnalysisHandle, AnalysisStatus } from "@/types";
import { DetectionError, type DetectionProvider } from "../provider";
import { createJob, newAnalysisId, runJob, type Job } from "./runner";

/**
 * In-browser mock detection engine. Implements the same contract a FastAPI
 * backend would, including asynchronous jobs that are polled for status.
 *
 * It performs real frame extraction and real signal-processing visualisations
 * (noise residual, ELA, FFT) but the verdict itself is SIMULATED.
 */
export class MockDetectionProvider implements DetectionProvider {
  readonly id = "mock" as const;
  readonly label = "VERA Demo Engine";
  readonly simulated = true;
  private jobs = new Map<string, Job>();

  async analyzeMedia(file: File): Promise<AnalysisHandle> {
    const id = newAnalysisId();
    const job = createJob(id);
    this.jobs.set(id, job);
    void runJob(job, file);
    return { id };
  }

  async getAnalysisStatus(id: string): Promise<AnalysisStatus> {
    const job = this.jobs.get(id);
    if (!job) throw new DetectionError("not_found", `Unknown analysis ${id}`, false);
    const s = job.status;
    // Return a snapshot so React state never aliases the job's live object.
    return { ...s, telemetry: { ...s.telemetry }, log: [...s.log], error: s.error && { ...s.error } };
  }

  async getAnalysisResult(id: string): Promise<Analysis> {
    const job = this.jobs.get(id);
    if (!job) throw new DetectionError("not_found", `Unknown analysis ${id}`, false);
    if (job.status.state === "failed") throw new DetectionError("failed", job.status.error?.message ?? "Analysis failed");
    if (!job.analysis) throw new DetectionError("not_ready", "Analysis has not completed yet");
    return job.analysis;
  }

  async cancelAnalysis(id: string): Promise<void> {
    const job = this.jobs.get(id);
    if (job) job.cancelled = true;
  }
}
