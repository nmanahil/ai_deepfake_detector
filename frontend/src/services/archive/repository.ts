import { del, get, set } from "idb-keyval";
import type { Analysis, AnalysisSummary } from "@/types";

/**
 * Persistence for finished analyses. Backed by IndexedDB in the browser; a real
 * deployment would replace this with `GET /v1/analyses` on the server.
 */
export interface AnalysisRepository {
  list(): Promise<AnalysisSummary[]>;
  get(id: string): Promise<Analysis | undefined>;
  save(analysis: Analysis): Promise<void>;
  saveMany(analyses: Analysis[]): Promise<void>;
  remove(id: string): Promise<void>;
  clear(): Promise<void>;
}

const INDEX_KEY = "vera:index:v1";
const rec = (id: string) => `vera:analysis:${id}`;
const MAX_RECORDS = 120;

export function summarize(a: Analysis): AnalysisSummary {
  return {
    id: a.id,
    createdAt: a.createdAt,
    media: { ...a.media, previewUrl: undefined },
    verdict: a.result.verdict,
    manipulationScore: a.result.manipulationScore,
    confidence: a.result.confidence,
    evidenceCount: a.evidence.length,
    simulated: a.result.simulated,
    sample: a.sample,
  };
}

class IdbRepository implements AnalysisRepository {
  // Serialise writes so concurrent saves can't clobber the shared index.
  private queue: Promise<unknown> = Promise.resolve();
  private enqueue<T>(fn: () => Promise<T>): Promise<T> {
    const next = this.queue.then(fn, fn);
    this.queue = next.catch(() => undefined);
    return next;
  }

  async list() {
    const idx = (await get<AnalysisSummary[]>(INDEX_KEY)) ?? [];
    return idx.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  get(id: string) {
    return get<Analysis>(rec(id));
  }

  save(a: Analysis) {
    return this.saveMany([a]);
  }

  saveMany(analyses: Analysis[]) {
    return this.enqueue(async () => {
      let idx = (await get<AnalysisSummary[]>(INDEX_KEY)) ?? [];
      for (const a of analyses) {
        const clean: Analysis = { ...a, media: { ...a.media, previewUrl: undefined } };
        await set(rec(a.id), clean);
        idx = [summarize(a), ...idx.filter((s) => s.id !== a.id)];
      }
      idx.sort((x, y) => y.createdAt.localeCompare(x.createdAt));
      const evicted = idx.splice(MAX_RECORDS);
      await Promise.all(evicted.map((s) => del(rec(s.id))));
      await set(INDEX_KEY, idx);
    });
  }

  remove(id: string) {
    return this.enqueue(async () => {
      const idx = (await get<AnalysisSummary[]>(INDEX_KEY)) ?? [];
      await del(rec(id));
      await set(INDEX_KEY, idx.filter((s) => s.id !== id));
    });
  }

  clear() {
    return this.enqueue(async () => {
      const idx = (await get<AnalysisSummary[]>(INDEX_KEY)) ?? [];
      await Promise.all(idx.map((s) => del(rec(s.id))));
      await set(INDEX_KEY, []);
    });
  }
}

export const repository: AnalysisRepository = new IdbRepository();
