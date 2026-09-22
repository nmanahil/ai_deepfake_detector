/**
 * Demo controls for the mock engine only. They let a presenter force each
 * outcome (and the failure state) without hunting for the right file.
 */
export type ForcedOutcome = "auto" | "authentic" | "suspicious" | "manipulated" | "fail";

const KEY = "vera.demo.force";

export function getForcedOutcome(): ForcedOutcome {
  try {
    const v = window.localStorage.getItem(KEY) as ForcedOutcome | null;
    if (v && ["auto", "authentic", "suspicious", "manipulated", "fail"].includes(v)) return v;
  } catch {
    /* storage unavailable */
  }
  return "auto";
}

export function setForcedOutcome(v: ForcedOutcome) {
  try {
    window.localStorage.setItem(KEY, v);
  } catch {
    /* storage unavailable */
  }
  listeners.forEach((l) => l());
}

const listeners = new Set<() => void>();
export function subscribeForced(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
