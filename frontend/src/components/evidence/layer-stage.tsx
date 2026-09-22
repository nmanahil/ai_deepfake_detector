"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
import { Corners } from "@/components/ui/corners";
import { clampAspect, FitBox } from "@/components/analyze/fit-box";
import { EVIDENCE_KINDS } from "@/lib/constants";
import { evidenceOnFrame, frameSrc, heatmapUrlFor, layerOf } from "@/lib/analysis";
import { cn } from "@/lib/utils";
import type { Analysis, FrameAnalysis, Region } from "@/types";

export type BaseView = "original" | "noise" | "compression" | "frequency";
export type Overlay = "faces" | "regions" | "heatmap";

function Box({ r, className, children, style }: { r: Region; className?: string; children?: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className={cn("absolute", className)} style={{ left: `${r.x * 100}%`, top: `${r.y * 100}%`, width: `${r.w * 100}%`, height: `${r.h * 100}%`, ...style }}>
      {children}
    </div>
  );
}

export function LayerStage({
  analysis, frame, base, overlays, heatOpacity, split, selectedId, className,
}: {
  analysis: Analysis; frame: FrameAnalysis; base: BaseView; overlays: Set<Overlay>; heatOpacity: number; split: number | null; selectedId: string | null; className?: string;
}) {
  const aspect = base === "frequency" ? 1 : clampAspect(analysis.media.width, analysis.media.height);
  const orig = frameSrc(analysis, frame);
  const layer = base === "original" ? undefined : layerOf(analysis, base)?.dataUrl;
  const heat = heatmapUrlFor(analysis, frame);
  const evidence = useMemo(() => evidenceOnFrame(analysis, frame.index), [analysis, frame.index]);
  const vectorsOn = base !== "frequency";
  const hasSel = evidence.some((e) => e.id === selectedId);

  return (
    <FitBox aspect={aspect} className={cn("bg-void", className)} innerClassName="overflow-hidden bg-ink-2">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div key={base === "frequency" ? "fft" : `f${frame.index}`} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          {base !== "frequency" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={orig} alt={`Evidence frame ${frame.index + 1} of ${analysis.media.filename}`} className="absolute inset-0 size-full object-cover" draggable={false} />
          )}
          {layer && (
            <motion.div
              key={base}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={split != null && base !== "frequency" ? { clipPath: `inset(0 0 0 ${split * 100}%)` } : undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={layer} alt={`${base} layer`} className="absolute inset-0 size-full object-cover [image-rendering:auto]" draggable={false} />
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {vectorsOn && overlays.has("heatmap") && heat && (
        <motion.div key={`${frame.index}-heat`} className="pointer-events-none absolute inset-0" initial={{ clipPath: "inset(0 100% 0 0)" }} animate={{ clipPath: "inset(0 0% 0 0)" }} transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heat} alt="" className="size-full object-cover blur-[1.5px]" style={{ opacity: heatOpacity }} />
          <motion.span aria-hidden className="absolute inset-y-0 w-px bg-alert shadow-[0_0_14px_2px_rgb(var(--alert)/0.8)]" initial={{ left: "0%" }} animate={{ left: "100%", opacity: [1, 1, 0] }} transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] }} />
        </motion.div>
      )}

      {vectorsOn && overlays.has("faces") && frame.faces.map((f, i) => (
        <Box key={`face-${i}`} r={f} className="border border-cyan/80">
          <Corners tone="cyan" size={8} />
          <span className="absolute -top-[18px] left-0 bg-cyan px-1 font-mono text-[9px] font-medium uppercase text-ink">FACE {f.score ? `· ${(f.score * 100).toFixed(1)}%` : ""}</span>
        </Box>
      ))}

      {vectorsOn && overlays.has("regions") && evidence.flatMap((e) =>
        e.regions.map((r, i) => {
          const sel = e.id === selectedId;
          const tone = e.severity >= 0.68 ? "border-alert text-alert" : e.severity >= 0.4 ? "border-amber text-amber" : "border-fg-muted text-fg-muted";
          return (
            <motion.div key={`${e.id}-${i}`} initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: hasSel && !sel ? 0.35 : 1, scale: 1 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className={cn("absolute border", tone, sel && "border-2")} style={{ left: `${r.x * 100}%`, top: `${r.y * 100}%`, width: `${r.w * 100}%`, height: `${r.h * 100}%` }}>
              <span className={cn("absolute -top-[18px] left-[-1px] whitespace-nowrap bg-ink/85 px-1 font-mono text-[9px] uppercase", sel ? "bg-current" : "")}>
                <span className={sel ? "text-ink" : ""}>{r.label ?? EVIDENCE_KINDS[e.kind].label.split(" ")[0]}</span>
              </span>
              {sel && <span aria-hidden className="absolute -inset-1 animate-pulse border border-current opacity-60" />}
            </motion.div>
          );
        }),
      )}

      <div aria-hidden className="scanlines pointer-events-none absolute inset-0 opacity-30" />
      <Corners tone="cyan" size={14} />
    </FitBox>
  );
}
