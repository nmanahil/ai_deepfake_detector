import type { HistoryResponse, PredictResponse, PredictionRecord } from "@/types/prediction";

// In dev the Vite proxy rewrites /api/* → http://localhost:8000/*
// In production set VITE_API_BASE_URL to the deployed backend origin.
const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "/api";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { detail?: string }).detail ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function predictImage(file: File): Promise<PredictResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE}/predict`, { method: "POST", body: form });
  return handleResponse<PredictResponse>(res);
}

export async function getHistory(limit = 20, offset = 0): Promise<HistoryResponse> {
  const res = await fetch(`${BASE}/history?limit=${limit}&offset=${offset}`);
  return handleResponse<HistoryResponse>(res);
}

export async function getHistoryItem(id: number): Promise<PredictionRecord> {
  const res = await fetch(`${BASE}/history/${id}`);
  return handleResponse<PredictionRecord>(res);
}

export function downloadReport(id: number): void {
  // Opens the HTML report in a new tab; the browser's print dialog handles PDF export.
  window.open(`${BASE}/history/${id}/report`, "_blank", "noopener,noreferrer");
}
