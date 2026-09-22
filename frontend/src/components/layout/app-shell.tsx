"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { StatusDot } from "@/components/ui/telemetry";
import { BRAND } from "@/lib/constants";
import { useAnalysisSession } from "@/hooks/use-analysis-session";
import { NAV_ITEMS } from "./nav-config";
import { RouteProgress } from "./route-progress";
import { MobileNav, Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { phase, status } = useAnalysisSession();

  // 1–5 jump between sections (ignored while typing).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      const item = NAV_ITEMS[Number(e.key) - 1];
      if (item) router.push(item.href);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <div className="min-h-dvh">
      <RouteProgress />
      <Sidebar />
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-ink/90 px-4 backdrop-blur lg:hidden">
        <Logo />
        <div className="flex items-center gap-2 font-mono text-2xs uppercase text-fg-muted">
          {phase === "running" ? (
            <>
              <StatusDot tone="cyan" />
              <span className="text-cyan">Analysing {status ? `${Math.round(status.progress * 100)}%` : ""}</span>
            </>
          ) : (
            <>
              <StatusDot tone="signal" />
              {BRAND.modelVersion}
            </>
          )}
        </div>
      </header>
      <div className="lg:pl-[232px]">
        <main id="main" tabIndex={-1} className="min-h-dvh pb-24 outline-none lg:pb-0">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
