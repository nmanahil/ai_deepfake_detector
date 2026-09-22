"use client";

import { useEffect, useState } from "react";
import { repository } from "@/services/archive/repository";
import type { Analysis } from "@/types";

/** Load a full analysis record from the archive by id. */
export function useStoredAnalysis(id: string | null | undefined) {
  const [state, setState] = useState<{ analysis: Analysis | null; loading: boolean; missing: boolean }>({
    analysis: null,
    loading: !!id,
    missing: false,
  });
  useEffect(() => {
    let alive = true;
    if (!id) {
      setState({ analysis: null, loading: false, missing: false });
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    repository
      .get(id)
      .then((a) => alive && setState({ analysis: a ?? null, loading: false, missing: !a }))
      .catch(() => alive && setState({ analysis: null, loading: false, missing: true }));
    return () => {
      alive = false;
    };
  }, [id]);
  return state;
}
