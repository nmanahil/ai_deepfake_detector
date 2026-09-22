import type { Verdict } from "@/types";

/** Thresholds on the fused manipulation score. Shared by the mock engine and dashboards. */
export function verdictFromScore(score: number): Verdict {
  if (score >= 0.68) return "manipulated";
  if (score >= 0.38) return "suspicious";
  return "authentic";
}
