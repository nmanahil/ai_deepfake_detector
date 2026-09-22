"use client";

import { useReduce } from "@/hooks/use-reduced-motion";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Segmented signal bar: ████████░░ — the visual language of the "Why this result?" panel. */
export function Meter({
  value,
  segments = 20,
  tone = "cyan",
  delay = 0,
  animate = true,
  className,
}: {
  value: number;
  segments?: number;
  tone?: "cyan" | "signal" | "amber" | "alert";
  delay?: number;
  animate?: boolean;
  className?: string;
}) {
  const reduce = useReduce();
  const lit = Math.round(Math.min(1, Math.max(0, value)) * segments);
  const color = { cyan: "bg-cyan", signal: "bg-signal", amber: "bg-amber", alert: "bg-alert" }[
    tone
  ];
  return (
    <div className={cn("flex h-2.5 w-full gap-[2px]", className)} role="presentation">
      {Array.from({ length: segments }, (_, i) => {
        const on = i < lit;
        return (
          <motion.span
            key={i}
            className={cn("h-full flex-1", on ? color : "bg-line-strong/60")}
            initial={animate && !reduce ? { opacity: 0, scaleY: 0.3 } : false}
            animate={{ opacity: on ? 1 : 0.7, scaleY: 1 }}
            transition={{ delay: delay + i * 0.022, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          />
        );
      })}
    </div>
  );
}

export function toneForScore(v: number): "signal" | "amber" | "alert" {
  return v >= 0.68 ? "alert" : v >= 0.38 ? "amber" : "signal";
}
