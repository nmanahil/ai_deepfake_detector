"use client";

import { cn } from "@/lib/utils";

export function TelemetryItem({ label, value, tone, className }: { label: string; value: React.ReactNode; tone?: "cyan" | "signal" | "amber" | "alert"; className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <span className="label">{label}</span>
      <span
        className={cn(
          "tabular truncate font-mono text-xs uppercase",
          tone === "cyan" && "text-cyan",
          tone === "signal" && "text-signal",
          tone === "amber" && "text-amber",
          tone === "alert" && "text-alert",
          !tone && "text-fg",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function StatusDot({ tone = "signal", pulse = true, className }: { tone?: "signal" | "cyan" | "amber" | "alert" | "dim"; pulse?: boolean; className?: string }) {
  const bg = { signal: "bg-signal", cyan: "bg-cyan", amber: "bg-amber", alert: "bg-alert", dim: "bg-fg-dim" }[tone];
  return (
    <span className={cn("relative inline-flex size-1.5", className)}>
      {pulse && tone !== "dim" && <span className={cn("absolute inset-0 rounded-full opacity-60 animate-pulse-ring", bg)} />}
      <span className={cn("relative size-1.5 rounded-full", bg)} />
    </span>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="border border-line-strong bg-ink-2 px-1.5 py-0.5 font-mono text-[10px] text-fg-muted">{children}</kbd>;
}
