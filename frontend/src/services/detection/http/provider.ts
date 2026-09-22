import type { Analysis, AnalysisHandle, AnalysisStatus } from "@/types";
import { DetectionError, type DetectionProvider } from "../provider";

/**
 * Talks to a Python FastAPI detection service. Wire format = the TypeScript
 * types in `src/types` (mirror them as Pydantic models). See docs/detection-api.md.
 *
 *   POST /v1/analyses               multipart `file`   → 202 { id }
 *   GET  /v1/analyses/{id}/status                      → AnalysisStatus
 *   GET  /v1/analyses/{id}/result                      → Analysis
 *   DELETE /v1/analyses/{id}                           → 204 (cancel)
 *
 * NOTE: contract-first — not yet exercised against a live backend.
 */
export class HttpDetectionProvider implements DetectionProvider {
  readonly id = "http" as const;
  readonly label = "VERA Inference API";
  readonly simulated = false;

  constructor(private baseUrl: string) {}

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}${path}`, init);
    } catch {
      throw new DetectionError("network", "The analysis service could not be reached.");
    }
    if (res.status === 404) throw new DetectionError("not_found", "Analysis not found.", false);
    if (res.status === 409) throw new DetectionError("not_ready", "Analysis has not completed yet.");
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { detail?: string };
      throw new DetectionError("rejected", body.detail ?? `Service responded with HTTP ${res.status}.`, res.status >= 500);
    }
    return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
  }

  async analyzeMedia(file: File): Promise<AnalysisHandle> {
    const form = new FormData();
    form.append("file", file);
    return this.request<AnalysisHandle>("/v1/analyses", { method: "POST", body: form });
  }

  getAnalysisStatus(id: string): Promise<AnalysisStatus> {
    return this.request<AnalysisStatus>(`/v1/analyses/${encodeURIComponent(id)}/status`);
  }

  getAnalysisResult(id: string): Promise<Analysis> {
    return this.request<Analysis>(`/v1/analyses/${encodeURIComponent(id)}/result`);
  }

  async cancelAnalysis(id: string): Promise<void> {
    await this.request<void>(`/v1/analyses/${encodeURIComponent(id)}`, { method: "DELETE" });
  }
}
