import Link from "next/link";
import { BRAND } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function LogoMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden className={className}>
      {/* viewfinder corners */}
      <path d="M2 10V2h8M22 2h8v8M30 22v8h-8M10 30H2v-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
      {/* V — two strokes, the right one offset like a scan misregistration */}
      <path d="M9 9l7 14" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
      <path d="M23 9l-7 14" stroke="rgb(var(--cyan))" strokeWidth="2" strokeLinecap="square" />
      <circle cx="16" cy="16" r="1.2" fill="rgb(var(--cyan))" className="animate-blink" />
    </svg>
  );
}

export function Logo({ href = "/", compact, className }: { href?: string; compact?: boolean; className?: string }) {
  return (
    <Link href={href} aria-label={`${BRAND.name} — ${BRAND.tagline}`} className={cn("group inline-flex items-center gap-3", className)}>
      <LogoMark className="text-fg transition-transform duration-500 ease-expo group-hover:rotate-[90deg]" />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-sans text-[17px] font-semibold tracking-[0.28em] text-fg">{BRAND.name}</span>
          <span className="mt-1.5 font-mono text-[9px] tracking-[0.22em] text-fg-dim">{BRAND.tagline}</span>
        </span>
      )}
    </Link>
  );
}
