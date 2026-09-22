import { fitToCanvas } from "@/lib/forensics/canvas";
import { seekVideo } from "./probe";

export interface ExtractedFrame {
  index: number;
  t: number;
  canvas: HTMLCanvasElement;
}

export function sampleCount(duration: number) {
  return Math.min(14, Math.max(8, Math.round(duration / 2)));
}

/** Seek a decoded video to evenly spaced timestamps and capture real frames. */
export async function extractFrames(
  video: HTMLVideoElement,
  duration: number,
  count: number,
  onFrame?: (done: number) => void,
  maxSide = 640,
): Promise<ExtractedFrame[]> {
  const out: ExtractedFrame[] = [];
  for (let i = 0; i < count; i++) {
    const t = Math.min(duration - 0.05, (duration * (i + 0.5)) / count);
    await seekVideo(video, Math.max(0, t));
    out.push({ index: i, t, canvas: fitToCanvas(video, maxSide) });
    onFrame?.(i + 1);
  }
  return out;
}
