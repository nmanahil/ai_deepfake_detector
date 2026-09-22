import type { AnalysisSummary, MediaKind, Verdict } from "@/types";

export interface DayBucket {
  key: string;
  date: Date;
  authentic: number;
  suspicious: number;
  manipulated: number;
  total: number;
}

export interface Stats {
  total: number;
  byVerdict: Record<Verdict, number>;
  avgConfidence: number;
  byKind: Record<"image" | "video", { count: number; avgConfidence: number; flagged: number }>;
}

export function computeStats(list: AnalysisSummary[]): Stats {
  const byVerdict: Record<Verdict, number> = { authentic: 0, suspicious: 0, manipulated: 0 };
  const kinds = { image: { count: 0, conf: 0, flagged: 0 }, video: { count: 0, conf: 0, flagged: 0 } };
  let conf = 0;
  for (const a of list) {
    byVerdict[a.verdict]++;
    conf += a.confidence;
    const k = a.media.kind === "video" ? "video" : "image";
    kinds[k].count++;
    kinds[k].conf += a.confidence;
    if (a.verdict !== "authentic") kinds[k].flagged++;
  }
  const fin = (k: "image" | "video") => ({ count: kinds[k].count, avgConfidence: kinds[k].count ? kinds[k].conf / kinds[k].count : 0, flagged: kinds[k].flagged });
  return { total: list.length, byVerdict, avgConfidence: list.length ? conf / list.length : 0, byKind: { image: fin("image"), video: fin("video") } };
}

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/** One bucket per calendar day, oldest → newest, ending today. */
export function dailyBuckets(list: AnalysisSummary[], days: number, now = new Date()): DayBucket[] {
  const buckets: DayBucket[] = [];
  const map = new Map<string, DayBucket>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const b: DayBucket = { key: dayKey(d), date: d, authentic: 0, suspicious: 0, manipulated: 0, total: 0 };
    buckets.push(b);
    map.set(b.key, b);
  }
  for (const a of list) {
    const b = map.get(dayKey(new Date(a.createdAt)));
    if (b) {
      b[a.verdict]++;
      b.total++;
    }
  }
  return buckets;
}

export const kindLabel = (k: MediaKind) => (k === "video" ? "VIDEO" : k === "audio" ? "AUDIO" : "IMAGE");
