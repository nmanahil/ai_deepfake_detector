import { renderHeatmap } from "@/lib/forensics/layers";
import { fitToCanvas, toDataUrl } from "@/lib/forensics/canvas";
import { mulberry32, range } from "@/lib/rng";
import { clamp } from "@/lib/utils";
import type { Analysis, Evidence, LogEntry, Media, Region } from "@/types";
import {
  blobsFor, buildEvidence, buildFrames, buildLayers, computeResidualLayers, computeSpectrumLayer, frameToPreview, guessFace,
  type SourceFrame,
} from "./evidence";
import { assembleResult, type Plan } from "./plan";

/** Simulated face localisation. Tracks a stable subject across frames with slight drift. */
export function localizeFaces(plan: Plan, frames: SourceFrame[]): Region[] {
  const aspect = frames[0].canvas.width / frames[0].canvas.height;
  const base = guessFace(mulberry32(plan.seed ^ 0xfa), aspect);
  return frames.map((f) => {
    if (f.face) return f.face;
    const r = mulberry32(plan.seed + f.index * 31);
    return {
      ...base,
      x: clamp(base.x + Math.sin(f.index * 0.7) * 0.012 + range(r, -0.004, 0.004), 0.02, 0.98 - base.w),
      y: clamp(base.y + Math.cos(f.index * 0.5) * 0.008, 0.02, 0.98 - base.h),
    };
  });
}

export function peakFrame(evidence: Evidence[], frames: SourceFrame[]): SourceFrame {
  if (evidence.length) {
    const top = [...evidence].sort((a, b) => b.severity - a.severity)[0];
    return frames[top.frameIndex ?? 0] ?? frames[0];
  }
  return frames[Math.floor(frames.length / 2)];
}

export { buildEvidence, computeResidualLayers, computeSpectrumLayer };

interface AssembleInput {
  id: string;
  createdAt: string;
  media: Media;
  plan: Plan;
  frames: SourceFrame[];
  faces: Region[];
  evidence: Evidence[];
  residual: { noise: string; ela: string };
  fft: string;
  log: LogEntry[];
  sample?: boolean;
}

export function assembleAnalysis(i: AssembleInput): Analysis {
  const isVideo = i.media.kind === "video";
  const peak = peakFrame(i.evidence, i.frames);
  const flaggedHere = i.evidence.filter((e) => (e.frameIndex ?? 0) === peak.index);
  const face = i.faces[peak.index] ?? i.faces[0];
  const hasHeat = i.plan.verdict !== "authentic" || i.evidence.length > 0;

  const preview = isVideo ? i.media.thumbnail : toDataUrl(fitToCanvas(i.frames[0].canvas, 960), "image/jpeg", 0.84);
  const frames = buildFrames(i.plan, i.frames, i.faces, i.evidence, (f) => (isVideo ? frameToPreview(f.canvas) : preview));

  let heatmap: Analysis["heatmap"] = null;
  if (hasHeat) {
    const aspect = peak.canvas.width / peak.canvas.height;
    const h = renderHeatmap(blobsFor(flaggedHere.length ? flaggedHere : i.evidence, face), aspect, 256);
    heatmap = { width: h.width, height: h.height, dataUrl: h.dataUrl, peak: h.peak };
  }

  return {
    id: i.id,
    createdAt: i.createdAt,
    state: "completed",
    media: i.media,
    result: assembleResult(i.plan, i.media.kind),
    evidence: i.evidence,
    frames,
    layers: buildLayers(hasHeat, { noise: i.residual.noise, ela: i.residual.ela, fft: i.fft }),
    heatmap,
    preview,
    log: i.log,
    sample: i.sample,
  };
}
