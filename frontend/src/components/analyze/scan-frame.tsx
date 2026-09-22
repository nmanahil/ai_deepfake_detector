"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { Corners } from "@/components/ui/corners";
import { BRAND } from "@/lib/constants";
import { mulberry32 } from "@/lib/rng";
import type { AnalysisStatus, Media } from "@/types";
import { clampAspect, FitBox } from "./fit-box";

const COLS = 14;
const ROWS = 10;

function HudChip({ className, children }: { className: string; children: React.ReactNode }) {
  return <span className={`absolute z-20 bg-ink/75 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-cyan backdrop-blur-sm ${className}`}>{children}</span>;
}

/** CENTER (running): the media under live forensic scan, with telemetry HUD. */
export function ScanFrame({ media, status }: { media: Media | undefined; status: AnalysisStatus | null }) {
  const t = status?.telemetry;
  const stage = status?.stage ?? "ingestion";
  const cells = useMemo(() => {
    const r = mulberry32(media ? media.sha256.length + media.sizeBytes : 7);
    return Array.from({ length: COLS * ROWS }, () => r());
  }, [media]);
  const aspect = clampAspect(media?.width, media?.height);
  const face = t?.faceBox;
  const stageP = status?.stageProgress ?? 0;

  return (
    <div className="relative border border-line bg-void">
      <FitBox aspect={aspect} className="h-[clamp(300px,52vh,620px)]" innerClassName="overflow-hidden bg-ink-2">
        {media ? (
          media.kind === "video" && media.previewUrl ? (
            <video src={media.previewUrl} muted loop autoPlay playsInline className="absolute inset-0 size-full object-cover" aria-label={`Video under analysis: ${media.filename}`} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={media.previewUrl ?? media.thumbnail} alt={`Evidence under analysis: ${media.filename}`} className="absolute inset-0 size-full object-cover" />
          )
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <span className="label animate-blink">Ingesting…</span>
          </div>
        )}
        <div aria-hidden className="scanlines absolute inset-0 z-10 opacity-60" />
        <div aria-hidden className="absolute inset-0 z-10 bg-gradient-to-b from-ink/40 via-transparent to-ink/50" />

        {/* artifact analysis: patch grid lights up */}
        {(stage === "artifacts" || stage === "temporal") && (
          <div aria-hidden className="absolute inset-0 z-10 grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}>
            {cells.map((v, i) => {
              const lit = stage === "artifacts" ? v < stageP * 0.9 : v < 0.25;
              return <span key={i} className="border border-cyan/10 transition-colors duration-300" style={{ backgroundColor: lit ? `rgb(56 226 255 / ${0.04 + v * 0.16})` : "transparent" }} />;
            })}
          </div>
        )}

        {/* frequency: pulsing rings */}
        {stage === "frequency" && (
          <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 z-10 size-full">
            {[0, 1, 2].map((i) => (
              <motion.circle key={i} cx="50" cy="45" fill="none" stroke="rgb(56 226 255)" strokeWidth="0.25" initial={{ r: 4, opacity: 0.8 }} animate={{ r: 46, opacity: 0 }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.8, ease: "easeOut" }} />
            ))}
          </svg>
        )}

        {/* face box */}
        {face && (
          <motion.div
            aria-hidden
            className="absolute z-20 border border-cyan"
            style={{ left: `${face.x * 100}%`, top: `${face.y * 100}%`, width: `${face.w * 100}%`, height: `${face.h * 100}%` }}
            initial={{ opacity: 0, scale: 1.12 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Corners tone="cyan" size={10} />
            <span className="absolute -top-5 left-0 bg-cyan px-1 font-mono text-[9px] font-medium uppercase text-ink">FACE · {Math.round((face.score ?? 0.97) * 1000) / 10}%</span>
          </motion.div>
        )}

        {/* scan head */}
        {status?.state === "running" && (
          <motion.div aria-hidden className="absolute inset-x-0 z-20 h-24" style={{ top: `${(t?.scan ?? 0) * 100}%`, y: "-100%" }}>
            <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-b from-transparent to-cyan/25" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-cyan shadow-[0_0_18px_2px_rgb(var(--cyan)/0.9)]" />
          </motion.div>
        )}

        <Corners tone="cyan" size={18} />
        <HudChip className="left-3 top-3">SIGNAL {String(t?.signalIndex ?? 0).padStart(2, "0")}</HudChip>
        <HudChip className="right-3 top-3 tabular">LATENCY {t?.latencyMs ?? 0}ms</HudChip>
        <HudChip className="bottom-3 left-3">MODEL {BRAND.modelVersion}</HudChip>
        <HudChip className="bottom-3 right-3">{t?.hashState === "VERIFIED" ? "FRAME HASH VERIFIED" : `HASH ${t?.hashState ?? "PENDING"}`}</HudChip>
      </FitBox>
    </div>
  );
}
