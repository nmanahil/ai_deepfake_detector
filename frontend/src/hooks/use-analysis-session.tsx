"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { detection, DetectionError } from "@/services/detection";
import { saveAnalysis } from "@/services/archive/store";
import { validateFile, type IntakeRejection } from "@/lib/media/probe";
import type { Analysis, AnalysisError, AnalysisStatus } from "@/types";

export type Phase = "idle" | "running" | "completed" | "failed";

interface Session {
  phase: Phase;
  status: AnalysisStatus | null;
  analysis: Analysis | null;
  file: File | null;
  rejection: IntakeRejection | null;
  error: AnalysisError | null;
  submit: (file: File) => void;
  retry: () => void;
  abort: () => void;
  reset: () => void;
  dismissRejection: () => void;
}

const Ctx = createContext<Session | null>(null);
const POLL_MS = 140;

/**
 * Owns the lifecycle of the current analysis. It lives in the root layout so a
 * run keeps going while the user browses other pages, and can be resumed.
 */
export function AnalysisSessionProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [status, setStatus] = useState<AnalysisStatus | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [rejection, setRejection] = useState<IntakeRejection | null>(null);
  const [error, setError] = useState<AnalysisError | null>(null);
  const runRef = useRef(0);
  const timer = useRef<number | null>(null);
  const activeId = useRef<string | null>(null);

  const stopPolling = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
  };

  const fail = useCallback((err: AnalysisError) => {
    stopPolling();
    setError(err);
    setPhase("failed");
  }, []);

  const start = useCallback(
    async (f: File) => {
      const run = ++runRef.current;
      stopPolling();
      setFile(f);
      setAnalysis(null);
      setStatus(null);
      setError(null);
      setRejection(null);
      setPhase("running");
      try {
        const { id } = await detection.analyzeMedia(f);
        if (run !== runRef.current) return;
        activeId.current = id;
        const tick = async () => {
          try {
            const s = await detection.getAnalysisStatus(id);
            if (run !== runRef.current) return;
            setStatus(s);
            if (s.state === "completed") {
              const a = await detection.getAnalysisResult(id);
              if (run !== runRef.current) return;
              setAnalysis(a);
              setPhase("completed");
              void saveAnalysis(a).catch(() => undefined);
              return;
            }
            if (s.state === "failed") {
              fail(s.error ?? { code: "unknown", message: "The analysis did not complete.", retryable: true });
              return;
            }
            timer.current = window.setTimeout(tick, POLL_MS);
          } catch (e) {
            if (run !== runRef.current) return;
            const retryable = e instanceof DetectionError ? e.retryable : true;
            fail({ code: "engine_unavailable", message: e instanceof Error ? e.message : "The analysis service could not be reached.", retryable });
          }
        };
        void tick();
      } catch (e) {
        if (run !== runRef.current) return;
        fail({ code: "engine_unavailable", message: e instanceof Error ? e.message : "The analysis service could not be reached.", retryable: true });
      }
    },
    [fail],
  );

  const submit = useCallback(
    (f: File) => {
      const v = validateFile(f);
      if (!v.ok) {
        setRejection(v.reason);
        return;
      }
      void start(f);
    },
    [start],
  );

  const abort = useCallback(() => {
    runRef.current++;
    stopPolling();
    if (activeId.current) void detection.cancelAnalysis(activeId.current).catch(() => undefined);
    setPhase("idle");
    setStatus(null);
    setFile(null);
  }, []);

  const reset = useCallback(() => {
    runRef.current++;
    stopPolling();
    setPhase("idle");
    setStatus(null);
    setAnalysis(null);
    setFile(null);
    setError(null);
    setRejection(null);
  }, []);

  const retry = useCallback(() => {
    if (file) void start(file);
  }, [file, start]);

  useEffect(() => () => stopPolling(), []);

  const value = useMemo<Session>(
    () => ({ phase, status, analysis, file, rejection, error, submit, retry, abort, reset, dismissRejection: () => setRejection(null) }),
    [phase, status, analysis, file, rejection, error, submit, retry, abort, reset],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAnalysisSession() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAnalysisSession must be used inside AnalysisSessionProvider");
  return v;
}
