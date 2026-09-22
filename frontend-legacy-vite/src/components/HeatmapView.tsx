import { useState } from "react";

interface HeatmapViewProps {
  originalSrc: string;
  heatmapB64: string;
}

type ViewMode = "original" | "heatmap";

export default function HeatmapView({ originalSrc, heatmapB64 }: HeatmapViewProps) {
  const [mode, setMode] = useState<ViewMode>("heatmap");

  const src =
    mode === "heatmap" ? `data:image/png;base64,${heatmapB64}` : originalSrc;

  return (
    <div className="space-y-3">
      {/* Toggle */}
      <div
        role="group"
        aria-label="Image view mode"
        className="inline-flex rounded-lg border border-gray-200 bg-gray-100 p-1 text-sm"
      >
        {(["heatmap", "original"] as ViewMode[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setMode(v)}
            aria-pressed={mode === v}
            className={`rounded-md px-3 py-1 font-medium capitalize transition-colors ${
              mode === v
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {v === "heatmap" ? "Attention map" : "Original"}
          </button>
        ))}
      </div>

      {/* Image */}
      <div className="relative overflow-hidden rounded-lg border border-gray-100">
        <img
          key={mode}
          src={src}
          alt={
            mode === "heatmap"
              ? "Attention heatmap overlay showing regions the model focused on"
              : "Original uploaded image"
          }
          className="w-full object-contain"
        />
      </div>

      <p className="text-xs text-gray-400">
        {mode === "heatmap"
          ? "Red regions indicate areas the model weighted most heavily in its decision."
          : "Original image as uploaded."}
      </p>
    </div>
  );
}
