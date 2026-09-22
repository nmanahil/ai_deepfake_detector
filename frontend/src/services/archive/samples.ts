import { fitToCanvas, toDataUrl } from "@/lib/forensics/canvas";
import { idFromSeed, mulberry32, pick, range } from "@/lib/rng";
import { renderSpecimen, specimenFaceRegion } from "@/lib/specimen";
import { planOutcome } from "@/services/detection/mock/plan";
import type { SourceFrame } from "@/services/detection/mock/evidence";
import { assembleAnalysis, buildEvidence, computeResidualLayers, computeSpectrumLayer, peakFrame } from "@/services/detection/mock/steps";
import type { Analysis, LogEntry, Media, Region } from "@/types";
import { saveMany } from "./store";
import { sleep } from "@/lib/utils";

const IMAGE_NAMES = ["press_portrait", "IMG", "profile_update", "id_scan", "conference_headshot", "DSC", "candidate_photo", "social_post"];
const VIDEO_NAMES = ["VID", "interview_clip", "statement_cam", "broadcast_segment", "call_recording", "MOV"];

const SAMPLE_COUNT = 30;

async function sha(seed: number) {
  const data = new TextEncoder().encode(`vera-sample-${seed}`);
  const d = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(d), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function buildSample(i: number, now: number): Promise<Analysis> {
  const seed = 7000 + i * 131;
  const r = mulberry32(seed);
  const isVideo = i % 3 === 1;
  const id = `VRA-${idFromSeed(seed)}`;
  // Spread over the last 30 days, denser toward the present.
  const ageDays = Math.pow(r(), 1.6) * 29.5;
  const createdAt = new Date(now - ageDays * 86400000 - range(r, 0, 3600000)).toISOString();
  const sha256 = await sha(seed);
  const plan = planOutcome(sha256, isVideo ? "video" : "image");
  const log: LogEntry[] = [];

  let frames: SourceFrame[];
  let media: Media;
  if (isVideo) {
    const duration = Math.round(range(r, 6, 42) * 10) / 10;
    const n = 8;
    frames = [];
    for (let k = 0; k < n; k++) {
      const t = (duration * (k + 0.5)) / n;
      const canvas = await renderSpecimen(seed, 320, { t });
      frames.push({ index: k, t, canvas, face: specimenFaceRegion(seed, t) });
    }
    const mid = frames[2].canvas;
    media = {
      id, kind: "video", filename: `${pick(r, VIDEO_NAMES)}_${1000 + Math.floor(r() * 9000)}.${pick(r, ["mp4", "mov", "webm"])}`,
      mimeType: "video/mp4", sizeBytes: Math.round(range(r, 4, 96) * 1024 * 1024), width: 1080, height: 1350,
      durationSec: duration, fps: 30, frameCount: Math.round(duration * 30), sha256,
      thumbnail: toDataUrl(fitToCanvas(mid, 320), "image/jpeg", 0.8),
    };
  } else {
    const canvas = await renderSpecimen(seed, 480);
    frames = [{ index: 0, t: 0, canvas, face: specimenFaceRegion(seed) }];
    media = {
      id, kind: "image", filename: `${pick(r, IMAGE_NAMES)}_${1000 + Math.floor(r() * 9000)}.${pick(r, ["jpg", "png", "jpg", "webp"])}`,
      mimeType: "image/jpeg", sizeBytes: Math.round(range(r, 0.3, 6) * 1024 * 1024), width: 1600, height: 2000,
      sha256, thumbnail: toDataUrl(fitToCanvas(canvas, 320), "image/jpeg", 0.8),
    };
  }
  const faces: Region[] = frames.map((f) => f.face!);
  const evidence = buildEvidence(plan, media, frames, faces);
  const peak = peakFrame(evidence, frames);
  const residual = await computeResidualLayers(peak.canvas);
  const fft = computeSpectrumLayer(peak.canvas);
  const push = (t: number, stage: LogEntry["stage"], message: string, level: LogEntry["level"] = "ok") => log.push({ t, stage, message, level });
  push(0, "ingestion", `Sample record ${media.filename} (simulated)`, "info");
  push(1100, "ingestion", `SHA-256 ${sha256.slice(0, 16)}… verified`);
  push(2000, "extraction", `${frames.length} frame${frames.length > 1 ? "s" : ""} decoded`);
  push(3300, "localization", "Facial region detected (simulated)");
  push(5000, "artifacts", "Noise residual and error-level maps computed");
  push(5900, "temporal", isVideo ? "Inter-frame coherence evaluated (simulated)" : "Skipped — single frame", isVideo ? "ok" : "info");
  push(7500, "frequency", "2D Fourier spectrum computed");
  push(9300, "inference", "Ensemble inference complete (simulated)");
  push(10300, "synthesis", `${evidence.length} evidence item${evidence.length === 1 ? "" : "s"} fused into assessment`);
  return assembleAnalysis({ id, createdAt, media, plan, frames, faces, evidence, residual, fft, log, sample: true });
}

/** Generates a deterministic archive of simulated analyses so dashboards have something to show. */
export async function loadSampleArchive(onProgress?: (done: number, total: number) => void) {
  const now = Date.now();
  const out: Analysis[] = [];
  for (let i = 0; i < SAMPLE_COUNT; i++) {
    out.push(await buildSample(i, now));
    onProgress?.(i + 1, SAMPLE_COUNT);
    await sleep(0);
  }
  await saveMany(out);
}

export const SAMPLE_TOTAL = SAMPLE_COUNT;
