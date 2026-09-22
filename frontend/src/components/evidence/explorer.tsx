"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Eye, Flame, ScanFace, Square } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { FindingsList } from "@/components/analyze/findings-list";
import { SimulatedTag, Tag } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { Segmented } from "@/components/ui/segmented";
import { EVIDENCE_KINDS } from "@/lib/constants";
import { frameAt, heatmapUrlFor, layerOf, peakFrameIndex } from "@/lib/analysis";
import { cn, formatClock, pct } from "@/lib/utils";
import type { Analysis, Evidence } from "@/types";
import { FrameStrip } from "./frame-strip";
import { LayerStage, type BaseView, type Overlay } from "./layer-stage";

const OVERLAY_META: { id: Overlay; label: string; Icon: typeof Eye }[] = [
  { id: "faces", label: "Faces", Icon: ScanFace },
  { id: "regions", label: "Regions", Icon: Square },
  { id: "heatmap", label: "Heatmap", Icon: Flame },
];

/**
 * Evidence Explorer. Frame and evidence selection are controlled by the parent so the
 * bottom timeline, findings list and this viewer stay in sync.
 */
export function EvidenceExplorer({
  analysis, frame, onFrame, selectedId, onSelect, wide,
}: {
  analysis: Analysis;
  frame: number;
  onFrame: (i: number) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  wide?: boolean;
}) {
  const isVideo = analysis.media.kind === "video";
  const [base, setBase] = useState<BaseView>("original");
  const [overlays, setOverlays] = useState<Set<Overlay>>(() => new Set(analysis.result.verdict === "authentic" ? ["faces"] : ["regions", "heatmap"]));
  const [compare, setCompare] = useState(false);
  const [split, setSplit] = useState(0.5);
  const [heatOpacity, setHeatOpacity] = useState(0.62);

  const fr = frameAt(analysis, frame);
  const peak = peakFrameIndex(analysis);
  const selected = analysis.evidence.find((e) => e.id === selectedId) ?? null;
  const hasHeat = !!heatmapUrlFor(analysis, fr);
  const baseLayer = base === "original" ? undefined : layerOf(analysis, base);
  const toggle = (o: Overlay) => setOverlays((s) => { const n = new Set(s); if (n.has(o)) n.delete(o); else n.add(o); return n; });

  const select = useCallback((id: string | null) => {
    onSelect(id);
    const ev = analysis.evidence.find((e) => e.id === id);
    if (!ev) return;
    if (isVideo && ev.frameIndex != null) onFrame(ev.frameIndex);
    const hint = ev.layer;
    if (hint === "noise" || hint === "compression" || hint === "frequency") setBase(hint);
    else {
      setBase("original");
      setOverlays((s) => new Set([...s, "regions", ...(hint === "heatmap" ? (["heatmap"] as Overlay[]) : [])]));
    }
  }, [analysis.evidence, isVideo, onFrame, onSelect]);

  const baseOptions = useMemo(() => [
    { value: "original" as const, label: "Original" },
    { value: "noise" as const, label: "Noise" },
    { value: "compression" as const, label: "ELA" },
    { value: "frequency" as const, label: "FFT" },
  ], []);

  const stageHeight = wide ? "h-[clamp(360px,66vh,760px)]" : "h-[clamp(300px,48vh,560px)]";

  const stage = (
    <Panel
      flush
      title="Evidence explorer"
      meta={
        <>
          {baseLayer ? <Tag tone={baseLayer.provenance === "computed" ? "cyan" : "amber"}>{baseLayer.provenance === "computed" ? "Computed from pixels" : "Simulated"}</Tag> : <Tag>Source frame</Tag>}
          {isVideo && <span className="tabular hidden sm:inline">F{String(fr.index + 1).padStart(2, "0")} · {formatClock(fr.timestampSec, true)}</span>}
        </>
      }
    >
      <div className="flex flex-col gap-3 border-b border-line p-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented label="Base view" value={base} onChange={setBase} options={baseOptions} />
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Overlays">
          {OVERLAY_META.map(({ id, label, Icon }) => {
            const disabled = base === "frequency" || (id === "heatmap" && !hasHeat);
            const on = overlays.has(id) && !disabled;
            return (
              <button key={id} aria-pressed={on} disabled={disabled} onClick={() => toggle(id)} className={cn("inline-flex h-8 items-center gap-1.5 border px-2.5 font-mono text-2xs uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-35", on ? "border-cyan/60 bg-cyan/10 text-cyan" : "border-line-strong text-fg-muted hover:text-fg")}>
                <Icon className="size-3" /> {label}
              </button>
            );
          })}
          {base !== "original" && base !== "frequency" && (
            <button aria-pressed={compare} onClick={() => setCompare((c) => !c)} className={cn("inline-flex h-8 items-center gap-1.5 border px-2.5 font-mono text-2xs uppercase transition-colors", compare ? "border-cyan/60 bg-cyan/10 text-cyan" : "border-line-strong text-fg-muted hover:text-fg")}>
              Compare
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        <LayerStage analysis={analysis} frame={fr} base={base} overlays={overlays} heatOpacity={heatOpacity} split={compare && base !== "original" && base !== "frequency" ? split : null} selectedId={selectedId} className={stageHeight} />
        {compare && base !== "original" && base !== "frequency" && (
          <>
            <div aria-hidden className="pointer-events-none absolute inset-y-0 z-20 w-px bg-cyan shadow-[0_0_10px_rgb(var(--cyan))]" style={{ left: `${split * 100}%` }} />
            <input type="range" min={0} max={1} step={0.005} value={split} onChange={(e) => setSplit(Number(e.target.value))} aria-label="Compare original and layer" className="absolute inset-x-0 bottom-3 z-30 mx-auto w-[min(360px,80%)] accent-cyan" />
          </>
        )}
        {isVideo && base !== "original" && fr.index !== peak && (
          <button onClick={() => onFrame(peak)} className="absolute left-3 top-3 z-30 border border-amber/50 bg-ink/85 px-2 py-1 font-mono text-[10px] uppercase text-amber">
            Layer computed on F{String(peak + 1).padStart(2, "0")} · jump
          </button>
        )}
      </div>

      {isVideo && <FrameStrip analysis={analysis} frame={frame} onFrame={onFrame} />}

      <div className="flex flex-col gap-2 border-t border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12px] leading-relaxed text-fg-muted">{baseLayer ? baseLayer.description : "Unmodified frame as ingested. Toggle overlays to inspect what the system flagged."}</p>
        {overlays.has("heatmap") && hasHeat && base !== "frequency" && (
          <label className="flex shrink-0 items-center gap-2 font-mono text-2xs uppercase text-fg-dim">
            Heat
            <input type="range" min={0.2} max={1} step={0.05} value={heatOpacity} onChange={(e) => setHeatOpacity(Number(e.target.value))} aria-label="Heatmap opacity" className="w-24 accent-cyan" />
            <SimulatedTag />
          </label>
        )}
      </div>
    </Panel>
  );

  const detail = <EvidenceDetail evidence={selected} isVideo={isVideo} onShow={() => selected && select(selected.id)} />;

  if (!wide) {
    return (
      <div className="space-y-4">
        {stage}
        {detail}
      </div>
    );
  }
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      {stage}
      <div className="space-y-4">
        <Panel title="Findings" meta={<span className="tabular">{String(analysis.evidence.length).padStart(2, "0")}</span>} flush>
          {analysis.evidence.length ? <FindingsList evidence={analysis.evidence} selectedId={selectedId} onSelect={(id) => select(id)} isVideo={isVideo} /> : <p className="px-4 py-8 text-center font-mono text-2xs uppercase text-fg-dim">No notable findings recorded</p>}
        </Panel>
        {detail}
      </div>
    </div>
  );
}

function EvidenceDetail({ evidence, isVideo, onShow }: { evidence: Evidence | null; isVideo: boolean; onShow: () => void }) {
  return (
    <Panel title="Evidence detail" flush>
      <AnimatePresence mode="wait" initial={false}>
        {evidence ? (
          <motion.div key={evidence.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="space-y-4 p-4">
            <div>
              <p className="font-mono text-2xs uppercase text-cyan">{EVIDENCE_KINDS[evidence.kind].label}</p>
              <p className="mt-1.5 text-[15px] leading-snug text-fg">{evidence.title}</p>
            </div>
            <p className="text-pretty text-[13px] leading-relaxed text-fg-muted">{evidence.description}</p>
            <dl className="grid grid-cols-3 gap-px border border-line bg-line">
              {[["Severity", pct(evidence.severity, 0)], ["Contribution", `+${pct(evidence.contribution, 1)}`], [isVideo ? "Time" : "Scope", isVideo && evidence.timestampSec != null ? formatClock(evidence.timestampSec, true) : evidence.regions.length ? "Regional" : "Global"]].map(([k, v]) => (
                <div key={k} className="bg-ink-1 p-2.5">
                  <dt className="label">{k}</dt>
                  <dd className="tabular mt-1 font-mono text-xs text-fg">{v}</dd>
                </div>
              ))}
            </dl>
            <button onClick={onShow} className="font-mono text-2xs uppercase text-cyan underline-offset-4 hover:underline">Show in {evidence.layer ? evidence.layer : "viewer"} →</button>
            <p className="border-t border-line pt-3 text-[11px] leading-relaxed text-fg-dim">This observation does not prove manipulation on its own. It is one contribution to the overall assessment.</p>
          </motion.div>
        ) : (
          <motion.p key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 py-8 text-center font-mono text-2xs uppercase leading-relaxed text-fg-dim">
            Select a finding or timeline marker
            <br />to inspect its evidence
          </motion.p>
        )}
      </AnimatePresence>
    </Panel>
  );
}
