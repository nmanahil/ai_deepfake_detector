"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Hydration-safe reduced-motion flag. `useReducedMotion` can differ between the
 * server render and the first client render, which breaks hydration whenever markup
 * depends on it. This reports `false` until mounted, then the real preference.
 */
export function useReduce() {
  const pref = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted && !!pref;
}
