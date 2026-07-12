import { useCallback, useRef, useState } from "react";
import type { PredictResponse } from "@/types/prediction";

// XHR is used instead of fetch because the Fetch API does not expose upload
// progress events (ReadableStream only covers the response body, not the
// request body). XHR's upload.onprogress gives us real byte-level progress,
// which is meaningful for large images on slow connections.
const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "/api";

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; progress: number }
  | { status: "success"; result: PredictResponse }
  | { status: "error"; message: string };

interface UseImageUploadReturn {
  state: UploadState;
  selectedFile: File | null;
  upload: (file: File) => void;
  reset: () => void;
}

export function useImageUpload(): UseImageUploadReturn {
  const [state, setState] = useState<UploadState>({ status: "idle" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // Keep a ref to the active XHR so we can abort on unmount or reset
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const upload = useCallback((file: File) => {
    setSelectedFile(file);
    // Abort any in-flight request before starting a new one
    xhrRef.current?.abort();

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setState({ status: "uploading", progress: Math.round((e.loaded / e.total) * 100) });
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText) as PredictResponse;
          setState({ status: "success", result });
        } catch {
          setState({ status: "error", message: "Unexpected response from server." });
        }
      } else {
        let detail = `Server error (${xhr.status}).`;
        try {
          const body = JSON.parse(xhr.responseText) as { detail?: string };
          if (body.detail) detail = body.detail;
        } catch { /* ignore parse errors */ }
        setState({ status: "error", message: detail });
      }
    };

    xhr.onerror = () => setState({ status: "error", message: "Network error. Is the backend running?" });
    xhr.onabort = () => setState({ status: "idle" });

    const form = new FormData();
    form.append("file", file);

    setState({ status: "uploading", progress: 0 });
    xhr.open("POST", `${BASE}/predict`);
    xhr.send(form);
  }, []);

  const reset = useCallback(() => {
    xhrRef.current?.abort();
    setSelectedFile(null);
    setState({ status: "idle" });
  }, []);

  return { state, selectedFile, upload, reset };
}
