"use client";

import { useReduce } from "@/hooks/use-reduced-motion";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Forensic-grid visualisation used behind every empty state: a scanned, empty specimen tray. */
export function ForensicGrid({ className }: { className?: string }) {
  const reduce = useReduce();
  const cols = 12;
  const rows = 6;
  return (
    <svg viewBox="0 0 480 240" className={cn("w-full max-w-[520px]", className)} aria-hidden>
      <defs>
        <linearGradient id="eg-fade" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="white" stopOpacity="1" />
          <stop offset="1" stopColor="white" stopOpacity="0.1" />
        </linearGradient>
        <mask id="eg-mask">
          <rect width="480" height="240" fill="url(#eg-fade)" />
        </mask>
      </defs>
      <g mask="url(#eg-mask)" stroke="rgb(var(--line-strong))" strokeWidth="1">
        {Array.from({ length: cols + 1 }, (_, i) => (
          <line key={`v${i}`} x1={(i * 480) / cols} y1="0" x2={(i * 480) / cols} y2="240" />
        ))}
        {Array.from({ length: rows + 1 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={(i * 240) / rows} x2="480" y2={(i * 240) / rows} />
        ))}
      </g>
      <g stroke="rgb(var(--fg-dim))" strokeWidth="1.2">
        <path d="M0 14V0h14M466 0h14v14M480 226v14h-14M14 240H0v-14" fill="none" />
        <path d="M240 108v24M228 120h24" stroke="rgb(var(--cyan))" opacity="0.8" />
        <circle cx="240" cy="120" r="30" fill="none" strokeDasharray="2 5" />
      </g>
      {!reduce && (
        <motion.rect
          x="0"
          width="480"
          height="1.5"
          fill="rgb(var(--cyan))"
          opacity="0.6"
          initial={{ y: 0 }}
          animate={{ y: [0, 238, 0] }}
          transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
        />
      )}
    </svg>
  );
}

export function EmptyState({
  title,
  detail,
  actions,
  className,
  compact,
}: {
  title: string;
  detail: string;
  actions?: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center px-4 text-center",
        compact ? "py-10" : "py-16 sm:py-24",
        className,
      )}
    >
      <ForensicGrid className={compact ? "max-w-[300px]" : undefined} />
      <p className={cn("display mt-4", compact ? "text-2xl" : "text-3xl sm:text-5xl")}>{title}</p>
      <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-fg-muted">{detail}</p>
      {actions && <div className="mt-7 flex flex-wrap justify-center gap-3">{actions}</div>}
    </div>
  );
}
