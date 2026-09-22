import type { Analysis, Evidence, FrameAnalysis, LayerId } from "@/types";

/** Frame on which the pixel-derived layers (noise / ELA / FFT) were computed. */
export function peakFrameIndex(a: Analysis): number {
  if (a.media.kind !== "video") return 0;
  if (!a.evidence.length) return Math.floor(a.frames.length / 2);
  return [...a.evidence].sort((x, y) => y.severity - x.severity)[0].frameIndex ?? 0;
}

export function frameAt(a: Analysis, index: number): FrameAnalysis {
  return a.frames[Math.min(Math.max(index, 0), a.frames.length - 1)];
}

export function heatmapUrlFor(a: Analysis, frame: FrameAnalysis): string | undefined {
  if (frame.heatmapUrl) return frame.heatmapUrl;
  if (a.heatmap && frame.index === peakFrameIndex(a)) return a.heatmap.dataUrl;
  return undefined;
}

export function evidenceOnFrame(a: Analysis, index: number): Evidence[] {
  return a.evidence.filter((e) => (e.frameIndex ?? 0) === index);
}

export function layerOf(a: Analysis, id: LayerId) {
  return a.layers.find((l) => l.id === id);
}

export function frameSrc(a: Analysis, frame: FrameAnalysis) {
  return a.media.kind === "image" ? a.preview : frame.thumbnail;
}
