import { VERDICTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Verdict } from "@/types";

const TONE = {
  authentic: "border-signal/40 bg-signal/10 text-signal",
  suspicious: "border-amber/40 bg-amber/10 text-amber",
  manipulated: "border-alert/40 bg-alert/10 text-alert",
} as const;

export function VerdictBadge({ verdict, compact, className }: { verdict: Verdict; compact?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 whitespace-nowrap border px-2 py-1 font-mono text-2xs uppercase", TONE[verdict], className)}>
      <span className={cn("size-1.5 rounded-full", VERDICTS[verdict].bg)} />
      {compact ? VERDICTS[verdict].label : VERDICTS[verdict].short}
    </span>
  );
}

export function Tag({ children, tone = "neutral", className }: { children: React.ReactNode; tone?: "neutral" | "cyan" | "amber"; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap border px-1.5 py-0.5 font-mono text-2xs uppercase",
        tone === "neutral" && "border-line-strong text-fg-muted",
        tone === "cyan" && "border-cyan/40 bg-cyan/5 text-cyan",
        tone === "amber" && "border-amber/40 bg-amber/5 text-amber",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Marks anything produced by the demo engine. Deliberately impossible to miss but quiet. */
export function SimulatedTag({ className, label = "SIMULATED" }: { className?: string; label?: string }) {
  return (
    <Tag tone="amber" className={className}>
      <span className="size-1 rounded-full bg-amber" />
      {label}
    </Tag>
  );
}
