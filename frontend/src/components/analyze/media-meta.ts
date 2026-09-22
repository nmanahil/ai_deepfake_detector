import { formatBytes, formatClock } from "@/lib/utils";
import type { Media } from "@/types";

const TYPE_LABEL: Record<string, string> = {
  "image/jpeg": "JPEG image", "image/png": "PNG image", "image/webp": "WebP image",
  "video/mp4": "MP4 video", "video/webm": "WebM video", "video/quicktime": "QuickTime video",
};

export function mediaFields(m: Media): { label: string; value: string }[] {
  const rows = [
    { label: "File type", value: TYPE_LABEL[m.mimeType] ?? m.mimeType },
    { label: "Resolution", value: m.width && m.height ? `${m.width} × ${m.height}` : "—" },
  ];
  if (m.kind === "video") {
    rows.push({ label: "Duration", value: formatClock(m.durationSec ?? 0, true) });
    rows.push({ label: "Frame count", value: m.frameCount ? `≈ ${m.frameCount.toLocaleString()}` : "—" });
  }
  rows.push({ label: "File size", value: formatBytes(m.sizeBytes) });
  rows.push({ label: "SHA-256", value: `${m.sha256.slice(0, 8)}…${m.sha256.slice(-6)}` });
  return rows;
}
