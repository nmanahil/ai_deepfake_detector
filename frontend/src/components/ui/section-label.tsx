import { cn } from "@/lib/utils";

export function SectionLabel({ index, children, className }: { index?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 font-mono text-2xs uppercase tracking-[0.14em] text-fg-dim", className)}>
      {index && <span className="text-cyan">{index}</span>}
      {index && <span aria-hidden className="h-px w-6 bg-line-strong" />}
      <span>{children}</span>
    </div>
  );
}
