import HeatmapView from "@/components/HeatmapView";
import type { PredictResponse } from "@/types/prediction";

interface ResultCardProps {
  result: PredictResponse;
  /** Object URL of the original uploaded image for side-by-side heatmap comparison. */
  previewUrl: string;
  onReset: () => void;
}

export default function ResultCard({ result, previewUrl, onReset }: ResultCardProps) {
  const isFake = result.label === "fake";
  const pct = Math.round(result.confidence * 100);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* ── Verdict header ── */}
      <div className={`px-5 py-4 ${isFake ? "bg-red-50" : "bg-green-50"}`}>
        <div className="flex items-center gap-3">
          <VerdictBadge isFake={isFake} />
          <span className="text-sm text-gray-500 ml-auto">{pct}% confidence</span>
        </div>

        {/* Confidence bar */}
        <div className="mt-3">
          <div
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Confidence: ${pct}%`}
            className="h-2 w-full overflow-hidden rounded-full bg-white/60"
          >
            <div
              className={`h-full rounded-full transition-all ${isFake ? "bg-red-500" : "bg-green-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Explanation */}
        <p className="mt-3 text-sm text-gray-700">{result.explanation}</p>
      </div>

      {/* ── Heatmap / original toggle ── */}
      {result.heatmap_b64 ? (
        <div className="px-5 py-4 border-t border-gray-100">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Visual Explanation
          </p>
          <HeatmapView originalSrc={previewUrl} heatmapB64={result.heatmap_b64} />
        </div>
      ) : (
        /* Heatmap unavailable — still show the original so the result isn't empty */
        <div className="px-5 py-4 border-t border-gray-100">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Uploaded Image
          </p>
          <img
            src={previewUrl}
            alt="Uploaded image"
            className="w-full rounded-lg border border-gray-100 object-contain"
          />
          <p className="mt-2 text-xs text-gray-400">
            Attention heatmap unavailable for this prediction.
          </p>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
        <button
          type="button"
          onClick={onReset}
          className="text-sm font-medium text-indigo-600 hover:underline"
        >
          ← Analyze another image
        </button>
        <a
          href={`/api/history/${result.id}/report`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
        >
          Download report →
        </a>
      </div>
    </div>
  );
}

// ── VerdictBadge ─────────────────────────────────────────────────────────────
// Uses both color AND an icon+text label so the verdict is accessible without
// relying on color alone.

function VerdictBadge({ isFake }: { isFake: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
        isFake
          ? "bg-red-100 text-red-700"
          : "bg-green-100 text-green-700"
      }`}
    >
      {isFake ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          AI-Generated / Fake
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
          Real / Authentic
        </>
      )}
    </span>
  );
}
