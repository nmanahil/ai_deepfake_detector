"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AudioLines, FileVideo, ImageIcon, UploadCloud } from "lucide-react";
import { useRef } from "react";
import { Corners } from "@/components/ui/corners";
import { Tag } from "@/components/ui/badge";
import { CONSTRAINTS } from "@/lib/constants";
import { cn, formatBytes } from "@/lib/utils";
import { ChamberRings } from "./chamber-rings";
import { ParticleField } from "./particle-field";

/**
 * The evidence intake chamber: the primary upload surface. Reacts to page-wide
 * drags (via `dragging`) as well as direct interaction.
 */
export function IntakeChamber({ dragging, onFile, className }: { dragging: boolean; onFile: (f: File) => void; className?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const accept = [...CONSTRAINTS.imageTypes, ...CONSTRAINTS.videoTypes].join(",");

  return (
    <div className={cn("relative isolate", className)}>
      <button
        type="button"
        onClick={() => input.current?.click()}
        aria-label="Select evidence to analyse. Images and video up to 200 megabytes."
        className={cn(
          "group relative flex min-h-[460px] w-full flex-col items-center justify-center overflow-hidden border bg-ink-1/70 px-6 py-16 text-center transition-colors duration-500 focus-visible:outline-offset-[-6px] sm:min-h-[560px]",
          dragging ? "border-cyan bg-cyan/[0.04]" : "border-line hover:border-line-strong",
        )}
      >
        <div aria-hidden className="bg-grid mask-fade-radial pointer-events-none absolute inset-0 opacity-50" />
        <ParticleField active={dragging} />
        <Corners size={dragging ? 26 : 16} tone={dragging ? "cyan" : "default"} />

        {/* rings */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 m-auto aspect-square w-[min(540px,120%)]"
          animate={{ scale: dragging ? 1.08 : 1, opacity: dragging ? 1 : 0.85 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <ChamberRings active={dragging} />
        </motion.div>

        {/* readouts */}
        <div className="pointer-events-none absolute left-4 top-4 hidden flex-col gap-1 text-left font-mono text-2xs uppercase text-fg-dim sm:flex">
          <span>CHAMBER 01</span>
          <span className={dragging ? "text-cyan" : ""}>{dragging ? "INTAKE ARMED" : "INTAKE READY"}</span>
        </div>
        <div className="pointer-events-none absolute right-4 top-4 hidden text-right font-mono text-2xs uppercase text-fg-dim sm:block">
          MAX {formatBytes(CONSTRAINTS.maxBytes)}
        </div>

        <div className="relative z-10 flex max-w-md flex-col items-center">
          <AnimatePresence mode="wait" initial={false}>
            {dragging ? (
              <motion.div key="drop" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                <p className="display text-[34px] text-cyan sm:text-5xl">
                  DROP EVIDENCE
                  <br />
                  TO BEGIN ANALYSIS
                </p>
                <p className="label mt-5 animate-blink">Release to start the forensic pipeline</p>
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="flex flex-col items-center">
                <span className="mb-6 grid size-14 place-items-center border border-line-strong bg-ink/80 text-cyan transition-transform duration-500 ease-expo group-hover:-translate-y-1">
                  <UploadCloud className="size-6" strokeWidth={1.4} />
                </span>
                <p className="display text-4xl sm:text-5xl">Submit evidence</p>
                <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-fg-muted">
                  Drag an image or video anywhere on this page, or select a file. Analysis begins automatically.
                </p>
                <span className="mt-7 inline-flex h-10 items-center gap-2 border border-cyan/50 px-5 font-mono text-[11px] uppercase tracking-[0.1em] text-cyan transition-colors group-hover:bg-cyan group-hover:text-ink">
                  Select file
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex flex-wrap items-center justify-center gap-2 px-4">
          <Tag>
            <ImageIcon className="size-3" /> JPEG · PNG · WEBP
          </Tag>
          <Tag>
            <FileVideo className="size-3" /> MP4 · WEBM · MOV
          </Tag>
          <Tag className="opacity-60">
            <AudioLines className="size-3" /> AUDIO · PLANNED
          </Tag>
        </div>
      </button>
      <input
        ref={input}
        type="file"
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
