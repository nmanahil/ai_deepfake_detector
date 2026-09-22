import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { BRAND, NAV } from "@/lib/constants";
import { StatusDot } from "@/components/ui/telemetry";

export function Footer() {
  return (
    <footer className="border-t border-line bg-ink-1/50">
      <div className="mx-auto grid max-w-[1360px] gap-12 px-4 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-6 max-w-xs text-[13px] leading-relaxed text-fg-muted">Media forensics for a world where seeing is no longer believing. Probabilistic by design, explainable by default.</p>
        </div>
        <div>
          <p className="label mb-4">Product</p>
          <ul className="space-y-2.5 text-[13px] text-fg-muted">{NAV.map((n) => <li key={n.href}><Link href={n.href} className="transition-colors hover:text-cyan">{n.label}</Link></li>)}</ul>
        </div>
        <div>
          <p className="label mb-4">Learn</p>
          <ul className="space-y-2.5 text-[13px] text-fg-muted">
            <li><a href="#how-it-works" className="transition-colors hover:text-cyan">How it works</a></li>
            <li><a href="#lab" className="transition-colors hover:text-cyan">Interactive forensics</a></li>
            <li><a href="#architecture" className="transition-colors hover:text-cyan">Architecture</a></li>
            <li><a href="#trust" className="transition-colors hover:text-cyan">Limitations</a></li>
          </ul>
        </div>
        <div>
          <p className="label mb-4">Responsible use</p>
          <p className="text-[12.5px] leading-relaxed text-fg-dim">Detection can produce false positives and false negatives. Do not treat any result as proof. This build uses a demo engine; its results are simulated.</p>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-4 px-4 py-5 font-mono text-2xs uppercase text-fg-dim sm:px-8">
          <span className="flex items-center gap-2"><StatusDot tone="signal" /> System online · Model {BRAND.modelVersion} · {BRAND.node}</span>
          <span>© 2026 {BRAND.name} · Demo build</span>
        </div>
      </div>
    </footer>
  );
}
