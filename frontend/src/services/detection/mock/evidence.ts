import { EVIDENCE_KINDS } from "@/lib/constants";
import { clamp } from "@/lib/utils";
import { errorLevel, frequencySpectrum, noiseResidual, renderHeatmap, type HeatBlob } from "@/lib/forensics/layers";
import { fitToCanvas, toDataUrl } from "@/lib/forensics/canvas";
import { range, shuffle, type Rand } from "@/lib/rng";
import type { Evidence, EvidenceKind, EvidenceLayer, FrameAnalysis, Media, Region } from "@/types";
import type { Plan } from "./plan";
import { planRand } from "./plan";

/** A frame the pipeline has decoded, with an optional known face box (specimens). */
export interface SourceFrame {
  index: number;
  t: number;
  canvas: HTMLCanvasElement;
  face?: Region;
}

const COPY: Record<EvidenceKind, { title: string; text: string }> = {
  facial_boundary_artifact: {
    title: "Blending discontinuity along facial boundary",
    text: "Blending characteristics along the facial boundary differ from the adjacent hairline and neck. Discontinuities of this kind are sometimes associated with face-swap compositing, though soft focus and retouching can produce them too.",
  },
  unnatural_texture: {
    title: "Skin micro-texture departs from surrounding area",
    text: "Skin micro-texture here is smoother and less varied than the surrounding regions. This can occur when detail is generated rather than captured, but it is also typical of skin-smoothing filters.",
  },
  compression_anomaly: {
    title: "Localised compression history mismatch",
    text: "Error levels in this patch differ from the rest of the frame, suggesting it may carry a different processing history. Re-editing and re-saving an authentic file can produce a similar pattern.",
  },
  synthetic_frequency_signature: {
    title: "Periodic peaks in the frequency spectrum",
    text: "The spectrum contains periodic peaks consistent with upsampling operations used by some image generators. Resizing and sharpening can introduce similar peaks, so this is treated as one contributing signal.",
  },
  temporal_inconsistency: {
    title: "Frame-to-frame instability in facial region",
    text: "Facial texture and boundary position shift between adjacent frames more than the motion accounts for. This can indicate frame-by-frame synthesis, but rapid movement and encoder artefacts can cause it too.",
  },
};

/** Best-guess face region for arbitrary uploads. Explicitly simulated. */
export function guessFace(r: Rand, aspect: number): Region {
  const w = aspect > 1.25 ? range(r, 0.2, 0.28) : range(r, 0.34, 0.44);
  const h = clamp(w * aspect * 1.18, 0.3, 0.6);
  return {
    x: clamp(0.5 - w / 2 + range(r, -0.06, 0.06), 0.05, 0.95 - w),
    y: clamp(0.16 + range(r, -0.03, 0.05), 0.04, 0.96 - h),
    w,
    h,
    label: "FACE",
    score: range(r, 0.93, 0.995),
  };
}

function sub(face: Region, fx: number, fy: number, fw: number, fh: number, label: string, score: number): Region {
  return { x: face.x + face.w * fx, y: face.y + face.h * fy, w: face.w * fw, h: face.h * fh, label, score };
}

function regionFor(kind: EvidenceKind, face: Region, score: number): Region[] {
  switch (kind) {
    case "facial_boundary_artifact":
      return [sub(face, -0.03, 0.62, 1.06, 0.4, "BOUNDARY", score)];
    case "unnatural_texture":
      return [sub(face, 0.04, 0.42, 0.36, 0.3, "TEXTURE", score), sub(face, 0.6, 0.42, 0.34, 0.28, "TEXTURE", score * 0.9)];
    case "compression_anomaly":
      return [sub(face, 0.52, 0.02, 0.44, 0.3, "ELA", score)];
    case "temporal_inconsistency":
      return [sub(face, 0.1, 0.24, 0.8, 0.5, "TEMPORAL", score)];
    default:
      return [];
  }
}

const IMAGE_KINDS: EvidenceKind[] = ["facial_boundary_artifact", "unnatural_texture", "synthetic_frequency_signature", "compression_anomaly"];

export function buildEvidence(plan: Plan, media: Media, frames: SourceFrame[], faces: Region[]): Evidence[] {
  const r = planRand(plan, 0xe71d);
  const isVideo = media.kind === "video";
  const count = plan.verdict === "authentic" ? (r() > 0.45 ? 1 : 0) : plan.verdict === "suspicious" ? 2 + (r() > 0.5 ? 1 : 0) : 4 + (r() > 0.4 ? 1 : 0) + (isVideo ? 1 : 0);

  const pool: EvidenceKind[] = isVideo ? [...IMAGE_KINDS, "temporal_inconsistency", "temporal_inconsistency"] : IMAGE_KINDS;
  const kinds: EvidenceKind[] =
    plan.verdict === "authentic"
      ? ["compression_anomaly"].slice(0, count) as EvidenceKind[]
      : shuffle(r, pool).slice(0, count);
  // Ensure a manipulated video always shows temporal evidence.
  if (isVideo && plan.verdict !== "authentic" && !kinds.includes("temporal_inconsistency")) kinds[0] = "temporal_inconsistency";

  const flaggedFrames = shuffle(r, frames.map((f) => f.index));
  return kinds.map((kind, i) => {
    const severity =
      plan.verdict === "authentic" ? range(r, 0.12, 0.26) : plan.verdict === "suspicious" ? range(r, 0.42, 0.66) : range(r, 0.68, 0.95);
    const frame = isVideo ? frames[flaggedFrames[i % flaggedFrames.length]] ?? frames[0] : frames[0];
    const face = frame.face ?? faces[frame.index] ?? faces[0];
    const meta = COPY[kind];
    const authenticSoft = plan.verdict === "authentic";
    return {
      id: `ev-${i + 1}`,
      kind,
      title: authenticSoft ? "Minor compression variation (within normal range)" : meta.title,
      description: authenticSoft
        ? "Small differences in error level were observed, consistent with ordinary re-encoding. This did not materially affect the assessment."
        : meta.text,
      severity,
      contribution: clamp(severity * range(r, 0.14, 0.28), 0.01, 0.3),
      frameIndex: isVideo ? frame.index : 0,
      timestampSec: isVideo ? frame.t : undefined,
      regions: regionFor(kind, face, severity),
      layer: EVIDENCE_KINDS[kind].layer,
    };
  }).sort((a, b) => b.contribution - a.contribution);
}

export function buildFrames(plan: Plan, frames: SourceFrame[], faces: Region[], evidence: Evidence[], previewOf: (f: SourceFrame) => string): FrameAnalysis[] {
  const r = planRand(plan, 0xf4a3);
  const byFrame = new Map<number, Evidence[]>();
  evidence.forEach((e) => {
    const k = e.frameIndex ?? 0;
    byFrame.set(k, [...(byFrame.get(k) ?? []), e]);
  });
  return frames.map((f) => {
    const ev = byFrame.get(f.index) ?? [];
    const base = plan.score * 0.62;
    const lift = ev.length ? Math.max(...ev.map((e) => e.severity)) : 0;
    const score = clamp(ev.length ? Math.max(base, lift) + range(r, -0.04, 0.04) : base + range(r, -0.1, 0.06), 0.02, 0.98);
    const flagged = ev.length > 0 && plan.verdict !== "authentic";
    const face = f.face ?? faces[f.index] ?? faces[0];
    let heatmapUrl: string | undefined;
    if (flagged) {
      const aspect = f.canvas.width / f.canvas.height;
      heatmapUrl = renderHeatmap(blobsFor(ev, face), aspect, 200).dataUrl;
    }
    return {
      index: f.index,
      timestampSec: f.t,
      thumbnail: previewOf(f),
      manipulationScore: score,
      faces: [face],
      flagged,
      evidenceIds: ev.map((e) => e.id),
      heatmapUrl,
    };
  });
}

export function blobsFor(evidence: Evidence[], face: Region): HeatBlob[] {
  const blobs: HeatBlob[] = [];
  evidence.forEach((e) => {
    e.regions.forEach((rg) => {
      blobs.push({ x: rg.x + rg.w / 2, y: rg.y + rg.h / 2, r: Math.max(rg.w, rg.h) * 0.42, strength: clamp(e.severity * 1.1, 0.25, 1) });
    });
  });
  if (!blobs.length) blobs.push({ x: face.x + face.w / 2, y: face.y + face.h / 2, r: face.w * 0.5, strength: 0.12 });
  return blobs;
}

export interface ComputedLayers {
  noise: string;
  ela: string;
  fft: string;
}

/** Real, pixel-derived layers, split so the pipeline can attribute them to the right stage. */
export const computeResidualLayers = async (c: HTMLCanvasElement) => ({ noise: noiseResidual(c), ela: await errorLevel(c) });
export const computeSpectrumLayer = (c: HTMLCanvasElement) => frequencySpectrum(c, 256);

export function buildLayers(hasHeat: boolean, l: ComputedLayers): EvidenceLayer[] {
  return [
    { id: "original", label: "Original", description: "Unmodified media frame as ingested.", provenance: "computed" },
    { id: "faces", label: "Face detection", description: "Regions where a face was localised. Simulated by the demo engine.", provenance: "simulated" },
    { id: "regions", label: "Suspicious regions", description: "Areas contributing most to the assessment. Simulated by the demo engine.", provenance: "simulated" },
    ...(hasHeat
      ? [{ id: "heatmap" as const, label: "Heatmap overlay", description: "Relative contribution of each area to the manipulation score. Simulated by the demo engine.", provenance: "simulated" as const }]
      : []),
    { id: "frequency", label: "Frequency domain", description: "Log-magnitude 2D Fourier spectrum. Computed from the pixels.", provenance: "computed", dataUrl: l.fft },
    { id: "compression", label: "Compression (ELA)", description: "Error-level analysis after a JPEG re-save at q=75. Computed from the pixels.", provenance: "computed", dataUrl: l.ela },
    { id: "noise", label: "Noise residual", description: "Image minus its local mean, amplified. Computed from the pixels.", provenance: "computed", dataUrl: l.noise },
  ];
}

export function frameToPreview(c: HTMLCanvasElement, max = 560, q = 0.78) {
  return toDataUrl(fitToCanvas(c, max), "image/jpeg", q);
}

