"use client";

import { useReduce } from "@/hooks/use-reduced-motion";
import { animate, useMotionValue } from "framer-motion";
import { useEffect, useState } from "react";

/** Smoothly count from 0 to `target`. Honors reduced-motion by jumping straight to the value. */
export function useCountUp(target: number, { duration = 1.6, delay = 0, decimals = 1 } = {}) {
  const reduce = useReduce();
  const mv = useMotionValue(0);
  const [text, setText] = useState((0).toFixed(decimals));
  useEffect(() => {
    if (reduce) {
      setText(target.toFixed(decimals));
      return;
    }
    mv.set(0);
    const unsub = mv.on("change", (v) => setText(v.toFixed(decimals)));
    const c = animate(mv, target, { duration, delay, ease: [0.16, 1, 0.3, 1] });
    return () => {
      c.stop();
      unsub();
    };
  }, [target, duration, delay, decimals, mv, reduce]);
  return text;
}
