"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { Analysis, AnalysisSummary } from "@/types";
import { repository } from "./repository";

/**
 * Tiny external store over the repository so every page shares one live list.
 * `summaries === null` means "still loading" (distinct from an empty archive).
 */
interface State {
  summaries: AnalysisSummary[] | null;
  error: boolean;
}

let state: State = { summaries: null, error: false };
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

const emit = (next: State) => {
  state = next;
  listeners.forEach((l) => l());
};

export async function refreshArchive() {
  try {
    emit({ summaries: await repository.list(), error: false });
  } catch {
    emit({ summaries: [], error: true });
  }
}

function ensureLoaded() {
  if (!loading) loading = refreshArchive();
  return loading;
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useArchive() {
  const snap = useSyncExternalStore(subscribe, () => state, () => state);
  useEffect(() => {
    void ensureLoaded();
  }, []);
  return {
    summaries: snap.summaries ?? [],
    loading: snap.summaries === null,
    error: snap.error,
  };
}

export async function saveAnalysis(a: Analysis) {
  await repository.save(a);
  await refreshArchive();
}

export async function removeAnalysis(id: string) {
  await repository.remove(id);
  await refreshArchive();
}

export async function clearArchive() {
  await repository.clear();
  await refreshArchive();
}

export async function saveMany(list: Analysis[]) {
  await repository.saveMany(list);
  await refreshArchive();
}
