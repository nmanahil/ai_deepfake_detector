"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  ["hero", "Hero"], ["demo", "Live analysis"], ["how-it-works", "How it works"], ["capabilities", "Capabilities"],
  ["lab", "Interactive forensics"], ["architecture", "Architecture"], ["trust", "Trust"], ["cta", "Analyze"],
] as const;

/** Fixed section indicator on wide screens — a small piece of cinematic chrome. */
export function SectionHud() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const els = SECTIONS.map(([id]) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(SECTIONS.findIndex(([id]) => id === e.target.id)); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return (
    <nav aria-label="Page sections" className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 2xl:block">
      <ol className="flex flex-col items-end gap-3">
        {SECTIONS.map(([id, label], i) => (
          <li key={id}>
            <a href={`#${id}`} aria-current={active === i ? "true" : undefined} className="group flex items-center gap-3">
              <span className={cn("font-mono text-[9px] uppercase tracking-[0.14em] transition-all", active === i ? "translate-x-0 text-cyan opacity-100" : "translate-x-2 text-fg-dim opacity-0 group-hover:translate-x-0 group-hover:opacity-100")}>{label}</span>
              <span className={cn("block h-px transition-all duration-500", active === i ? "w-8 bg-cyan" : "w-4 bg-line-strong group-hover:w-6 group-hover:bg-fg-muted")} />
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
