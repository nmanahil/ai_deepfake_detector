"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Logo } from "@/components/brand/logo";
import { Kbd } from "@/components/ui/telemetry";
import { cn } from "@/lib/utils";
import { LiveStatus } from "./live-status";
import { isActive, NAV_ITEMS } from "./nav-config";

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[232px] flex-col border-r border-line bg-ink/95 backdrop-blur lg:flex">
      <div className="flex h-[72px] items-center border-b border-line px-5">
        <Logo />
      </div>
      <nav aria-label="Primary" className="flex-1 px-3 py-5">
        <p className="label mb-3 px-2">Workspace</p>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex h-10 items-center gap-3 px-2 text-[13px] transition-colors",
                    active ? "text-fg" : "text-fg-muted hover:text-fg",
                  )}
                >
                  {active && (
                    <motion.span layoutId="nav-active" className="absolute inset-0 border border-line-strong bg-ink-2" transition={{ type: "spring", stiffness: 520, damping: 42 }} />
                  )}
                  {active && <motion.span layoutId="nav-bar" className="absolute inset-y-2 left-0 w-px bg-cyan shadow-[0_0_10px_rgb(var(--cyan))]" />}
                  <span className={cn("relative font-mono text-2xs tabular", active ? "text-cyan" : "text-fg-dim group-hover:text-fg-muted")}>{item.index}</span>
                  <item.Icon className="relative size-4 shrink-0 transition-transform duration-300 ease-expo group-hover:translate-x-0.5" strokeWidth={1.5} />
                  <span className="relative font-medium tracking-wide">{item.label}</span>
                  <span className="relative ml-auto opacity-0 transition-opacity group-hover:opacity-100">
                    <Kbd>{item.index.slice(1)}</Kbd>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <LiveStatus />
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <ul className="grid grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn("relative flex h-[58px] flex-col items-center justify-center gap-1.5", active ? "text-cyan" : "text-fg-muted")}
              >
                {active && <motion.span layoutId="mnav" className="absolute inset-x-3 top-0 h-px bg-cyan shadow-[0_0_10px_rgb(var(--cyan))]" />}
                <item.Icon className="size-[18px]" strokeWidth={1.5} />
                <span className="font-mono text-[9px] uppercase tracking-[0.1em]">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
