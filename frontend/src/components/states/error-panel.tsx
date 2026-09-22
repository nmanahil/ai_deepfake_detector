"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Corners } from "@/components/ui/corners";
import { cn } from "@/lib/utils";

/** Designed error state. `code` is a small mono reference line for support / logs. */
export function ErrorPanel({
  title,
  detail,
  code,
  tone = "alert",
  actions,
  className,
  compact,
}: {
  title: string;
  detail: string;
  code?: string;
  tone?: "alert" | "amber";
  actions?: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  const color = tone === "alert" ? "text-alert" : "text-amber";
  const border = tone === "alert" ? "border-alert/40" : "border-amber/40";
  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn("relative overflow-hidden border bg-ink-1/80", border, compact ? "p-5" : "p-8 sm:p-12", className)}
    >
      <Corners tone={tone} size={12} />
      <div aria-hidden className="bg-grid-fine pointer-events-none absolute inset-0 opacity-30 mask-fade-b" />
      <div aria-hidden className={cn("absolute inset-x-0 top-0 h-px", tone === "alert" ? "bg-alert/60" : "bg-amber/60")} />
      <div className={cn("relative flex gap-5", compact ? "items-start" : "flex-col items-start sm:flex-row")}>
        <span className={cn("grid size-11 shrink-0 place-items-center border", border, color)}>
          <AlertTriangle className="size-5" strokeWidth={1.5} />
        </span>
        <div className="min-w-0">
          <p className={cn("display", compact ? "text-2xl" : "text-4xl sm:text-5xl", color)}>{title}</p>
          <p className="text-pretty mt-3 max-w-lg text-[15px] leading-relaxed text-fg-muted">{detail}</p>
          {code && <p className="label mt-4">REF · {code}</p>}
          {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
        </div>
      </div>
    </motion.div>
  );
}
