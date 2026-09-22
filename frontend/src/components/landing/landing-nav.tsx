"use client";

import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-500", scrolled || open ? "border-b border-line bg-ink/85 backdrop-blur-md" : "border-b border-transparent")}>
      <motion.div aria-hidden style={{ scaleX: progress }} className="absolute inset-x-0 bottom-[-1px] h-px origin-left bg-cyan shadow-[0_0_10px_rgb(var(--cyan))]" />
      <div className="mx-auto flex h-[68px] max-w-[1360px] items-center justify-between px-4 sm:px-8">
        <Logo />
        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="relative px-3.5 py-2 font-mono text-2xs uppercase tracking-[0.12em] text-fg-muted transition-colors hover:text-fg">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/analyze">Analyze media</Link>
          </Button>
          <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"} className="grid size-10 place-items-center text-fg md:hidden">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden border-t border-line md:hidden" aria-label="Mobile">
            <ul className="px-4 py-3">
              {NAV.map((n, i) => (
                <li key={n.href}>
                  <Link href={n.href} onClick={() => setOpen(false)} className="flex items-center gap-4 border-b border-line py-4 font-display text-3xl">
                    <span className="font-mono text-2xs text-cyan">{String(i + 1).padStart(2, "0")}</span>
                    {n.label}
                  </Link>
                </li>
              ))}
              <li className="py-4"><Button variant="primary" className="w-full" asChild><Link href="/analyze">Analyze media</Link></Button></li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
