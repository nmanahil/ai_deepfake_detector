"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

/** A hairline that sweeps across the top of the viewport on each navigation. */
export function RouteProgress() {
  const pathname = usePathname();
  return (
    <AnimatePresence>
      <motion.div
        key={pathname}
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-[90] h-px origin-left bg-cyan shadow-[0_0_12px_rgb(var(--cyan))]"
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{ scaleX: 1, opacity: 0 }}
        transition={{ scaleX: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }, opacity: { delay: 0.45, duration: 0.4 } }}
      />
    </AnimatePresence>
  );
}
