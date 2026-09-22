import { CONSTRAINTS } from "@/lib/constants";
import { fitToCanvas, toDataUrl } from "@/lib/forensics/canvas";
import type { Media, MediaKind } from "@/types";

export type IntakeRejection =
  | { code: "unsupported"; message: string; detail: string }
  | { code: "too_large"; message: string; detail: string }
  | { code: "audio_planned"; message: string; detail: string }
  | { code: "empty"; message: string; detail: string };

export type ValidationResult = { ok: true; kind: Exclude<MediaKind, "audio"> } | { ok: false; reason: IntakeRejection };

const EXT_KIND: Record<string, MediaKind> = {
  jpg: "image", jpeg: "image", png: "image", webp: "image",
  mp4: "video", webm: "video", mov: "video", m4v: "video",
  mp3: "audio", wav: "audio", m4a: "audio", ogg: "audio", flac: "audio",
};

export function detectKind(file: File): MediaKind | null {
  if (CONSTRAINTS.imageTypes.includes(file.type)) return "image";
  if (CONSTRAINTS.videoTypes.includes(file.type)) return "video";
  if (CONSTRAINTS.audioTypes.includes(file.type) || file.type.startsWith("audio/")) return "audio";
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXT_KIND[ext] ?? null;
}

export function validateFile(file: File): ValidationResult {
  if (file.size === 0) {
    return { ok: false, reason: { code: "empty", message: "EMPTY EVIDENCE FILE", detail: `${file.name} contains no data.` } };
  }
  const kind = detectKind(file);
  if (kind === "audio") {
    return {
      ok: false,
      reason: {
        code: "audio_planned",
        message: "AUDIO ANALYSIS NOT YET AVAILABLE",
        detail: "Voice-clone and synthetic speech detection is on the roadmap. Images and video are supported today.",
      },
    };
  }
  if (!kind) {
    return {
      ok: false,
      reason: {
        code: "unsupported",
        message: "UNSUPPORTED EVIDENCE FORMAT",
        detail: `${file.type || "Unknown type"} cannot be ingested. Accepted: JPEG, PNG, WebP, MP4, WebM, MOV.`,
      },
    };
  }
  if (file.size > CONSTRAINTS.maxBytes) {
    return {
      ok: false,
      reason: {
        code: "too_large",
        message: "EVIDENCE EXCEEDS PROCESSING LIMIT",
        detail: `${(file.size / 1024 / 1024).toFixed(1)} MB submitted. The limit is ${CONSTRAINTS.maxBytes / 1024 / 1024} MB per file.`,
      },
    };
  }
  return { ok: true, kind };
}

export class MediaProbeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaProbeError";
  }
}

const HASH_WINDOW = 64 * 1024 * 1024;

/** SHA-256 over the file (first 64 MB for very large files, to keep ingestion snappy). */
export async function hashFile(file: File): Promise<string> {
  const buf = await file.slice(0, HASH_WINDOW).arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

function loadImageEl(url: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => rej(new MediaProbeError("The image could not be decoded."));
    img.src = url;
  });
}

export function loadVideoEl(url: string): Promise<HTMLVideoElement> {
  return new Promise((res, rej) => {
    const v = document.createElement("video");
    v.preload = "auto";
    v.muted = true;
    v.playsInline = true;
    v.crossOrigin = "anonymous";
    const timer = window.setTimeout(() => rej(new MediaProbeError("The video took too long to load.")), 20000);
    v.onloadeddata = async () => {
      // MediaRecorder-style WebM reports Infinity until the end has been sought.
      if (!Number.isFinite(v.duration)) {
        await new Promise<void>((r) => {
          const done = () => {
            v.removeEventListener("durationchange", done);
            r();
          };
          v.addEventListener("durationchange", done);
          v.currentTime = 1e6;
          window.setTimeout(done, 2500);
        });
        v.currentTime = 0;
      }
      window.clearTimeout(timer);
      if (!Number.isFinite(v.duration) || v.duration <= 0) rej(new MediaProbeError("The video has no readable duration."));
      else res(v);
    };
    v.onerror = () => {
      window.clearTimeout(timer);
      rej(new MediaProbeError("The video could not be decoded by this browser."));
    };
    v.src = url;
  });
}

export function seekVideo(v: HTMLVideoElement, t: number): Promise<void> {
  return new Promise((res) => {
    if (Math.abs(v.currentTime - t) < 0.001) return res();
    const done = () => {
      v.removeEventListener("seeked", done);
      res();
    };
    v.addEventListener("seeked", done);
    v.currentTime = t;
  });
}

const ASSUMED_FPS = 30;

export interface ProbeResult {
  media: Media;
  /** Decoded source kept for the pipeline; caller must not leak it. */
  source: HTMLImageElement | HTMLVideoElement;
  objectUrl: string;
}

export async function probeMedia(file: File, kind: "image" | "video", id: string): Promise<ProbeResult> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const [sha256] = await Promise.all([hashFile(file)]);
    if (kind === "image") {
      const img = await loadImageEl(objectUrl);
      const thumb = toDataUrl(fitToCanvas(img, 320), "image/jpeg", 0.8);
      return {
        objectUrl,
        source: img,
        media: {
          id, kind, filename: file.name, mimeType: file.type || "image/*", sizeBytes: file.size,
          width: img.naturalWidth, height: img.naturalHeight, sha256, thumbnail: thumb, previewUrl: objectUrl,
        },
      };
    }
    const v = await loadVideoEl(objectUrl);
    const duration = Number.isFinite(v.duration) ? v.duration : 0;
    await seekVideo(v, Math.min(duration * 0.1, Math.max(0, duration - 0.1)));
    const thumb = toDataUrl(fitToCanvas(v, 320), "image/jpeg", 0.8);
    return {
      objectUrl,
      source: v,
      media: {
        id, kind, filename: file.name, mimeType: file.type || "video/*", sizeBytes: file.size,
        width: v.videoWidth, height: v.videoHeight, durationSec: duration,
        // Browsers do not expose container frame rate; 30 fps is assumed until a backend supplies it.
        fps: ASSUMED_FPS, frameCount: Math.round(duration * ASSUMED_FPS),
        sha256, thumbnail: thumb, previewUrl: objectUrl,
      },
    };
  } catch (e) {
    URL.revokeObjectURL(objectUrl);
    if (e instanceof MediaProbeError) throw e;
    throw new MediaProbeError("The file could not be read.");
  }
}
