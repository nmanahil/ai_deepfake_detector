"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ParticleField } from "./particle-field";
import { ChamberRings } from "./chamber-rings";

/** Full-viewport reaction when a file is dragged anywhere over the window. */
export function DragOverlay({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          role="status"
          aria-live="assertive"
          className="pointer-events-none fixed inset-0 z-[80] grid place-items-center bg-ink/85 backdrop-blur-[3px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div aria-hidden className="bg-grid mask-fade-radial absolute inset-0 opacity-60" />
          <ParticleField active />
          <div aria-hidden className="absolute left-1/2 top-1/2 aspect-square w-[min(760px,140vw)] -translate-x-1/2 -translate-y-1/2 opacity-80">
            <ChamberRings active />
          </div>
          <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="relative px-6 text-center">
            <p className="display text-[40px] text-cyan sm:text-7xl">
              DROP EVIDENCE
              <br />
              TO BEGIN ANALYSIS
            </p>
            <p className="label mt-6">JPEG · PNG · WEBP · MP4 · WEBM · MOV — up to 200 MB</p>
          </motion.div>
          <div aria-hidden className="absolute inset-3 border border-cyan/60 sm:inset-5" />
          {[
            "left-3 top-3 sm:left-5 sm:top-5 border-l-2 border-t-2",
            "right-3 top-3 sm:right-5 sm:top-5 border-r-2 border-t-2",
            "bottom-3 left-3 sm:bottom-5 sm:left-5 border-b-2 border-l-2",
            "bottom-3 right-3 sm:bottom-5 sm:right-5 border-b-2 border-r-2",
          ].map((c) => (
            <span key={c} aria-hidden className={`absolute size-8 border-cyan ${c}`} />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
