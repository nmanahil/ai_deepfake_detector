import UploadZone from "@/components/UploadZone";
import ProgressBar from "@/components/ProgressBar";
import ErrorMessage from "@/components/ErrorMessage";
import { useImageUpload } from "@/hooks/useImageUpload";
import type { PredictResponse } from "@/types/prediction";

export default function HomePage() {
  const { state, upload, reset } = useImageUpload();

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Analyze an Image</h1>
        <p className="mt-2 text-sm text-gray-500">
          Upload a photo to detect whether it is AI-generated or real.
        </p>
      </div>

      <UploadZone
        onFileSelected={upload}
        disabled={state.status === "uploading"}
      />

      {state.status === "uploading" && (
        <ProgressBar value={state.progress} label="Uploading and analyzing…" />
      )}

      {state.status === "error" && (
        <ErrorMessage message={state.message} onDismiss={reset} />
      )}

      {state.status === "success" && (
        <ResultCard result={state.result} onReset={reset} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ResultCard — shown after a successful prediction
// ---------------------------------------------------------------------------

interface ResultCardProps {
  result: PredictResponse;
  onReset: () => void;
}

function ResultCard({ result, onReset }: ResultCardProps) {
  const isFake = result.label === "fake";
  const pct = (result.confidence * 100).toFixed(1);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className={`px-5 py-4 ${isFake ? "bg-red-50" : "bg-green-50"}`}>
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold uppercase tracking-wide ${
              isFake ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
            }`}
          >
            {result.label}
          </span>
          <span className="text-sm text-gray-500">{pct}% confidence</span>
        </div>
        <p className="mt-2 text-sm text-gray-700">{result.explanation}</p>
      </div>

      {result.heatmap_b64 && (
        <div className="px-5 py-4 border-t border-gray-100">
          <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
            Attention Heatmap
          </p>
          <img
            src={`data:image/png;base64,${result.heatmap_b64}`}
            alt="Attention heatmap showing regions the model focused on"
            className="w-full rounded-lg"
          />
        </div>
      )}

      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
        <button
          type="button"
          onClick={onReset}
          className="text-sm text-indigo-600 hover:underline"
        >
          Analyze another image
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
