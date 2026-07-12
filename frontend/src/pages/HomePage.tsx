import { useEffect, useRef } from "react";
import UploadZone from "@/components/UploadZone";
import ProgressBar from "@/components/ProgressBar";
import ErrorMessage from "@/components/ErrorMessage";
import ResultCard from "@/components/ResultCard";
import { useImageUpload } from "@/hooks/useImageUpload";

export default function HomePage() {
  const { state, selectedFile, upload, reset } = useImageUpload();

  // Derive a stable object URL from the selected file; revoke on change/unmount
  const previewUrlRef = useRef<string | null>(null);
  useEffect(() => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = selectedFile ? URL.createObjectURL(selectedFile) : null;
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, [selectedFile]);

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Analyze an Image</h1>
        <p className="mt-2 text-sm text-gray-500">
          Upload a photo to detect whether it is AI-generated or real.
        </p>
      </div>

      {state.status !== "success" && (
        <UploadZone
          onFileSelected={upload}
          disabled={state.status === "uploading"}
        />
      )}

      {state.status === "uploading" && (
        <ProgressBar value={state.progress} label="Uploading and analyzing…" />
      )}

      {state.status === "error" && (
        <ErrorMessage message={state.message} onDismiss={reset} />
      )}

      {state.status === "success" && previewUrlRef.current && (
        <ResultCard
          result={state.result}
          previewUrl={previewUrlRef.current}
          onReset={reset}
        />
      )}
    </div>
  );
}
