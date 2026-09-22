export type MediaKind = "image" | "video" | "audio";

/** Static description of an uploaded file, populated by the ingestion stage. */
export interface Media {
  id: string;
  kind: MediaKind;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  /** Pixel dimensions. Absent for audio. */
  width?: number;
  height?: number;
  /** Video / audio only. */
  durationSec?: number;
  /** Video only. Frame rate is estimated client-side unless the backend supplies it. */
  fps?: number;
  frameCount?: number;
  /** SHA-256 of the file bytes, hex encoded. */
  sha256: string;
  /** Small JPEG data URL (≤ 320px). Persisted with the analysis. */
  thumbnail: string;
  /**
   * Ephemeral object URL for in-session playback. Never persisted — after a reload
   * the archive falls back to thumbnails and extracted evidence frames.
   */
  previewUrl?: string;
}

/** Everything the intake layer needs to know to accept or reject a file. */
export interface MediaConstraints {
  maxBytes: number;
  imageTypes: string[];
  videoTypes: string[];
  audioTypes: string[];
}
