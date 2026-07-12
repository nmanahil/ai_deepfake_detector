export interface PredictResponse {
  id: number;
  label: "real" | "fake";
  confidence: number; // 0–1
  explanation: string;
  heatmap_b64: string | null;
}

export interface PredictionRecord {
  id: number;
  created_at: string; // ISO-8601
  filename: string;
  label: "real" | "fake";
  confidence: number;
  explanation: string;
  heatmap_path: string | null;
}

export interface HistoryResponse {
  total: number;
  items: PredictionRecord[];
}
