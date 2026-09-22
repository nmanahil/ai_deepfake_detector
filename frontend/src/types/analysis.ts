import type { Media } from "./media";

/* ────────────────────────────────────────────────────────────────────────────
 * Verdicts & signals
 * The vocabulary is deliberately probabilistic. There is no "is fake" state.
 * ──────────────────────────────────────────────────────────────────────────── */

export type Verdict = "authentic" | "suspicious" | "manipulated";

export type SignalKey = "facial" | "temporal" | "texture" | "frequency" | "compression";

export interface SignalScore {
  key: SignalKey;
  label: string;
  /** 0–1 — how strongly this signal contributed toward manipulation. */
  score: number;
  /** 0–1 — relative weight in the fusion step. */
  weight: number;
  /** Plain-language summary of what the signal measures. */
  description: string;
  /** Not every signal applies to every media type (e.g. temporal on stills). */
  applicable: boolean;
}

export interface ModelMetadata {
  name: string;
  version: string;
  family: string;
  framework: string;
  inputResolution: string;
  ensemble: string[];
  node: string;
  latencyMs: number;
  /** `true` when produced by the in-browser mock engine, never by a trained model. */
  simulated: boolean;
}

export interface DetectionResult {
  verdict: Verdict;
  /** 0–1 — the fused manipulation likelihood. */
  manipulationScore: number;
  /** 0–1 — the model's confidence in the verdict above. Not a guarantee. */
  confidence: number;
  headline: string;
  signals: SignalScore[];
  /** Plain-language narrative paragraphs, safe to show to a non-expert. */
  explanation: string[];
  limitations: string[];
  model: ModelMetadata;
  simulated: boolean;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Evidence
 * ──────────────────────────────────────────────────────────────────────────── */

export type EvidenceKind =
  | "temporal_inconsistency"
  | "facial_boundary_artifact"
  | "unnatural_texture"
  | "compression_anomaly"
  | "synthetic_frequency_signature";

/** Normalised (0–1) rectangle relative to the frame. */
export interface Region {
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  score?: number;
}

export interface Evidence {
  id: string;
  kind: EvidenceKind;
  title: string;
  description: string;
  /** 0–1 — how notable this observation is on its own. */
  severity: number;
  /** 0–1 — how much it moved the overall score. */
  contribution: number;
  frameIndex?: number;
  timestampSec?: number;
  regions: Region[];
  /** The visualisation layer that best illustrates this evidence. */
  layer?: LayerId;
}

export interface FrameAnalysis {
  index: number;
  timestampSec: number;
  /** JPEG data URL of the sampled frame. */
  thumbnail: string;
  manipulationScore: number;
  faces: Region[];
  flagged: boolean;
  evidenceIds: string[];
  /** Transparent PNG heat overlay for this frame, when it carries suspicious regions. */
  heatmapUrl?: string;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Visual layers
 * ──────────────────────────────────────────────────────────────────────────── */

export type LayerId = "original" | "faces" | "regions" | "heatmap" | "frequency" | "compression" | "noise";

/** `computed` layers are derived from the uploaded pixels; `simulated` layers are mock output. */
export type Provenance = "computed" | "simulated";

export interface Heatmap {
  width: number;
  height: number;
  /** Transparent PNG overlay data URL. */
  dataUrl: string;
  peak: number;
}

export interface EvidenceLayer {
  id: LayerId;
  label: string;
  description: string;
  provenance: Provenance;
  /** Absent for `original`, which uses the media preview. */
  dataUrl?: string;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Pipeline
 * ──────────────────────────────────────────────────────────────────────────── */

export type StageId =
  | "ingestion"
  | "extraction"
  | "localization"
  | "artifacts"
  | "temporal"
  | "frequency"
  | "inference"
  | "synthesis";

export interface PipelineStage {
  id: StageId;
  index: number;
  code: string;
  label: string;
  short: string;
  blurb: string;
}

export type AnalysisState = "queued" | "running" | "completed" | "failed";

/** Live telemetry streamed while a job is running. Strings keep it backend-agnostic. */
export interface Telemetry {
  frameCursor: number;
  frameTotal: number;
  faceState: string;
  temporalState: string;
  frequencyState: string;
  modelConfidence: number | null;
  latencyMs: number;
  signalIndex: number;
  hashState: string;
  node: string;
  /** Normalised position of the analysis scan-head over the media (0–1). */
  scan: number;
  /** Localised face region once stage 03 has resolved it. */
  faceBox?: Region;
}

export interface LogEntry {
  t: number;
  stage: StageId;
  message: string;
  level: "info" | "ok" | "warn";
}

export interface AnalysisStatus {
  id: string;
  state: AnalysisState;
  stage: StageId;
  stageIndex: number;
  /** 0–1 progress within the current stage. */
  stageProgress: number;
  /** 0–1 overall progress. */
  progress: number;
  telemetry: Telemetry;
  log: LogEntry[];
  error?: AnalysisError;
  startedAt: number;
  media?: Media;
}

export type AnalysisErrorCode = "decode_failed" | "engine_unavailable" | "timeout" | "unsupported" | "unknown";

export interface AnalysisError {
  code: AnalysisErrorCode;
  message: string;
  retryable: boolean;
}

/** The persisted, complete record of a finished analysis. */
export interface Analysis {
  id: string;
  createdAt: string;
  state: "completed";
  media: Media;
  result: DetectionResult;
  evidence: Evidence[];
  frames: FrameAnalysis[];
  layers: EvidenceLayer[];
  heatmap: Heatmap | null;
  /** Full-size preview (≤ 960px) for the explorer; thumbnails cover video. */
  preview: string;
  log: LogEntry[];
  /** Set for records created by the "sample archive" loader. */
  sample?: boolean;
}

export interface AnalyzeOptions {
  signal?: AbortSignal;
}

/** Summary row persisted alongside each analysis for fast list / dashboard rendering. */
export interface AnalysisSummary {
  id: string;
  createdAt: string;
  media: Media;
  verdict: Verdict;
  manipulationScore: number;
  confidence: number;
  evidenceCount: number;
  simulated: boolean;
  sample?: boolean;
}

export interface AnalysisHandle {
  id: string;
}
