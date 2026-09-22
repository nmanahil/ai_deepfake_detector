import { cn } from "@/lib/utils";

/**
 * Letterboxes a child of fixed aspect ratio inside a container of definite height,
 * without JS measurement (uses container query units). Overlays can be positioned
 * in normalised coordinates against the inner box.
 */
export function FitBox({ aspect, className, innerClassName, children }: { aspect: number; className?: string; innerClassName?: string; children: React.ReactNode }) {
  return (
    <div className={cn("grid place-items-center [container-type:size]", className)}>
      <div className={cn("relative", innerClassName)} style={{ aspectRatio: String(aspect), width: `min(100cqw, calc(100cqh * ${aspect}))` }}>
        {children}
      </div>
    </div>
  );
}

export function clampAspect(w?: number, h?: number) {
  if (!w || !h) return 4 / 3;
  return Math.min(2.2, Math.max(0.55, w / h));
}
