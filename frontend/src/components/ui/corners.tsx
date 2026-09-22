import { cn } from "@/lib/utils";

const TONES = {
  default: "border-line-strong",
  cyan: "border-cyan/70",
  signal: "border-signal/70",
  amber: "border-amber/70",
  alert: "border-alert/70",
} as const;

/** Four hairline corner ticks — the product's recurring "instrument frame" motif. */
export function Corners({ className, size = 8, tone = "default" }: { className?: string; size?: number; tone?: keyof typeof TONES }) {
  const base = cn("pointer-events-none absolute transition-colors duration-500", TONES[tone]);
  const s = { width: size, height: size };
  return (
    <span aria-hidden className={cn("contents", className)}>
      <span className={cn(base, "left-0 top-0 border-l border-t")} style={s} />
      <span className={cn(base, "right-0 top-0 border-r border-t")} style={s} />
      <span className={cn(base, "bottom-0 left-0 border-b border-l")} style={s} />
      <span className={cn(base, "bottom-0 right-0 border-b border-r")} style={s} />
    </span>
  );
}
