import { BRAND, PIPELINE } from "@/lib/constants";
import { fitToCanvas } from "@/lib/forensics/canvas";
import { detectKind, MediaProbeError, probeMedia } from "@/lib/media/probe";
import { extractFrames, sampleCount } from "@/lib/media/frames";
import { clamp, sleep } from "@/lib/utils";
import { mulberry32 } from "@/lib/rng";
import type { Analysis, AnalysisError, AnalysisStatus, LogEntry, Media, StageId, Telemetry, Verdict } from "@/types";
import { getForcedOutcome } from "./controls";
import { planOutcome, type Plan } from "./plan";
import type { SourceFrame } from "./evidence";
import { assembleAnalysis, buildEvidence, computeResidualLayers, computeSpectrumLayer, localizeFaces, peakFrame } from "./steps";

export interface Job {
  status: AnalysisStatus;
  analysis?: Analysis;
  cancelled: boolean;
}

class Cancelled extends Error {}
class StageFailure extends Error {
  constructor(public info: AnalysisError) {
    super(info.message);
  }
}

export function newAnalysisId() {
  const abc = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return "VRA-" + Array.from(bytes, (b) => abc[b % abc.length]).join("");
}

export function createJob(id: string): Job {
  return {
    cancelled: false,
    status: {
      id,
      state: "queued",
      stage: "ingestion",
      stageIndex: 0,
      stageProgress: 0,
      progress: 0,
      startedAt: Date.now(),
      log: [],
      telemetry: {
        frameCursor: 0, frameTotal: 1, faceState: "PENDING", temporalState: "PENDING", frequencyState: "PENDING",
        modelConfidence: null, latencyMs: 0, signalIndex: 0, hashState: "PENDING", node: BRAND.node, scan: 0,
      },
    },
  };
}

const log = (job: Job, stage: StageId, message: string, level: LogEntry["level"] = "info") => {
  job.status.log.push({ t: Date.now() - job.status.startedAt, stage, message, level });
};
const tel = (job: Job, patch: Partial<Telemetry>) => Object.assign(job.status.telemetry, patch);

async function stage<T>(job: Job, id: StageId, minMs: number, work: () => Promise<T>, tick?: (p: number) => void): Promise<T> {
  const idx = PIPELINE.findIndex((s) => s.id === id);
  const st = job.status;
  st.stage = id;
  st.stageIndex = idx;
  st.stageProgress = 0;
  tel(job, { signalIndex: idx + 1 });
  const t0 = performance.now();
  let done = false;
  let out!: T;
  let err: unknown;
  work().then(
    (v) => {
      out = v;
      done = true;
    },
    (e) => {
      err = e;
      done = true;
    },
  );
  const jitter = 0.92 + ((idx * 37) % 17) / 100;
  for (;;) {
    if (job.cancelled) throw new Cancelled();
    const p01 = Math.min((performance.now() - t0) / (minMs * jitter), 1);
    const p = done ? p01 : Math.min(p01, 0.94);
    st.stageProgress = p;
    st.progress = (idx + p) / PIPELINE.length;
    tel(job, { scan: (((performance.now() - t0) / 1600) % 1), latencyMs: 118 + Math.round(Math.sin(performance.now() / 380) * 26 + 26) });
    tick?.(p);
    if (err) throw err;
    if (done && p01 >= 1) break;
    await sleep(48);
  }
  return out;
}

/** Runs the whole simulated pipeline for a file, mutating `job.status` as it goes. */
export async function runJob(job: Job, file: File): Promise<void> {
  const st = job.status;
  const id = st.id;
  const force = getForcedOutcome();
  st.state = "running";

  try {
    const kind = detectKind(file);
    if (kind !== "image" && kind !== "video") {
      throw new StageFailure({ code: "unsupported", message: "This media type cannot be analysed.", retryable: false });
    }

    /* 01 — INGESTION */
    log(job, "ingestion", `Received ${file.name} (${file.type || "unknown"})`);
    const probe = await stage(job, "ingestion", 1200, async () => {
      try {
        return await probeMedia(file, kind, id);
      } catch (e) {
        if (e instanceof MediaProbeError) throw new StageFailure({ code: "decode_failed", message: e.message, retryable: false });
        throw e;
      }
    }, (p) => tel(job, { hashState: p > 0.5 ? "VERIFIED" : "HASHING" }));
    const media: Media = probe.media;
    st.media = media;
    tel(job, { hashState: "VERIFIED" });
    log(job, "ingestion", `SHA-256 ${media.sha256.slice(0, 16)}… verified`, "ok");
    log(job, "ingestion", `${media.width}×${media.height}${media.durationSec ? ` · ${media.durationSec.toFixed(1)}s` : ""} · ${media.kind}`);

    const plan: Plan = planOutcome(media.sha256, media.kind, force === "auto" || force === "fail" ? undefined : (force as Verdict));
    const isVideo = media.kind === "video";
    const frameTotal = isVideo ? Math.max(1, media.frameCount ?? 1) : 1;
    tel(job, { frameTotal });

    /* 02 — FRAME EXTRACTION */
    let frames: SourceFrame[];
    if (isVideo) {
      const n = sampleCount(media.durationSec ?? 0);
      log(job, "extraction", `Sampling ${n} frames across ${media.durationSec?.toFixed(1)}s`);
      frames = await stage(job, "extraction", 1900, () =>
        extractFrames(probe.source as HTMLVideoElement, media.durationSec ?? 0, n, (d) => tel(job, { frameCursor: Math.round((d / n) * frameTotal) })),
        (p) => tel(job, { frameCursor: Math.max(job.status.telemetry.frameCursor, Math.round(p * frameTotal * 0.98)) }),
      );
    } else {
      log(job, "extraction", "Still image — 1 frame");
      frames = await stage(job, "extraction", 900, async () => [{ index: 0, t: 0, canvas: fitToCanvas(probe.source as HTMLImageElement, 960) }], () => tel(job, { frameCursor: 1 }));
    }
    log(job, "extraction", `${frames.length} frame${frames.length > 1 ? "s" : ""} decoded`, "ok");

    /* 03 — FACE LOCALIZATION */
    const faces = await stage(job, "localization", 1300, async () => localizeFaces(plan, frames), (p) =>
      tel(job, {
        frameCursor: Math.round(p * frameTotal),
        faceState: p < 0.3 ? "SCANNING" : p < 0.95 ? "FACIAL REGION DETECTED" : "1 SUBJECT · TRACKED",
      }),
    );
    tel(job, { faceBox: { ...faces[0], label: "FACE" } });
    log(job, "localization", "Facial region detected (simulated)", "ok");
    const evidence = buildEvidence(plan, media, frames, faces);
    const peak = peakFrame(evidence, frames);

    /* 04 — ARTIFACT ANALYSIS (real noise residual + ELA) */
    const residual = await stage(job, "artifacts", 1700, () => computeResidualLayers(peak.canvas), (p) =>
      tel(job, { frameCursor: Math.round(p * frameTotal), frequencyState: "QUEUED" }),
    );
    log(job, "artifacts", "Noise residual and error-level maps computed", "ok");

    /* 05 — TEMPORAL CONSISTENCY */
    await stage(job, "temporal", isVideo ? 1700 : 700, async () => undefined, (p) =>
      tel(job, {
        frameCursor: isVideo ? Math.round(p * frameTotal) : 1,
        temporalState: isVideo ? (p < 0.95 ? "ANALYZING" : "COMPLETE") : "N/A · STILL IMAGE",
      }),
    );
    log(job, "temporal", isVideo ? "Inter-frame coherence evaluated (simulated)" : "Skipped — single frame", isVideo ? "ok" : "info");

    /* 06 — FREQUENCY ANALYSIS (real FFT) */
    const fft = await stage(job, "frequency", 1500, async () => computeSpectrumLayer(peak.canvas), (p) =>
      tel(job, { frequencyState: p < 0.9 ? "SCANNING" : "SIGNATURE RESOLVED" }),
    );
    log(job, "frequency", "2D Fourier spectrum computed", "ok");

    /* 07 — MODEL INFERENCE */
    const r = mulberry32(plan.seed ^ 0x1f);
    await stage(job, "inference", 1900, async () => undefined, (p) => {
      if (force === "fail" && p > 0.55) {
        throw new StageFailure({ code: "engine_unavailable", message: "The analysis node stopped responding during model inference.", retryable: true });
      }
      const target = plan.confidence;
      const wobble = (r() - 0.5) * 0.03 * (1 - p);
      tel(job, { modelConfidence: clamp(0.5 + (target - 0.5) * (1 - Math.pow(1 - p, 3)) + wobble, 0, 0.995) });
    });
    tel(job, { modelConfidence: plan.confidence });
    log(job, "inference", "Ensemble inference complete (simulated)", "ok");

    /* 08 — EVIDENCE SYNTHESIS */
    const analysis = await stage(job, "synthesis", 1000, async () => {
      const a = assembleAnalysis({
        id, createdAt: new Date().toISOString(), media, plan, frames, faces, evidence,
        residual, fft, log: [...st.log],
      });
      return a;
    });
    log(job, "synthesis", `${analysis.evidence.length} evidence item${analysis.evidence.length === 1 ? "" : "s"} fused into assessment`, "ok");
    analysis.log = [...st.log];
    job.analysis = analysis;
    st.progress = 1;
    st.stageProgress = 1;
    st.state = "completed";
  } catch (e) {
    if (e instanceof Cancelled) {
      st.state = "failed";
      st.error = { code: "unknown", message: "Analysis aborted by operator.", retryable: true };
    } else if (e instanceof StageFailure) {
      st.state = "failed";
      st.error = e.info;
      log(job, st.stage, e.info.message, "warn");
    } else {
      st.state = "failed";
      st.error = { code: "unknown", message: e instanceof Error ? e.message : "Unexpected pipeline failure.", retryable: true };
      log(job, st.stage, st.error.message, "warn");
    }
  }
}
