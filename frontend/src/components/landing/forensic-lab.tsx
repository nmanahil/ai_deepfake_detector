"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Corners } from "@/components/ui/corners";
import { SimulatedTag, Tag } from "@/components/ui/badge";
import { toDataUrl } from "@/lib/forensics/canvas";
import { errorLevel, frequencySpectrum, noiseResidual, renderHeatmap } from "@/lib/forensics/layers";
import { renderSpecimen } from "@/lib/specimen";
import { cn } from "@/lib/utils";
import { SectionHead } from "./reveal";

type Id = "original" | "heat" | "noise" | "ela" | "fft";
const LAYERS: { id: Id; label: string; sim: boolean; note: string }[] = [
  { id: "original", label: "Original", sim: false, note: "The frame exactly as submitted. Nothing has been altered." },
  { id: "heat", label: "Heatmap", sim: true, note: "Where the system concentrated its attention when forming the assessment. Simulated here for illustration." },
  { id: "noise", label: "Noise residual", sim: false, note: "The image minus its local average, amplified. Camera noise is granular and uniform; synthesised regions are often too smooth or too regular." },
  { id: "ela", label: "Compression", sim: false, note: "Error-level analysis: re-save at a known quality and map the difference. Regions with a different history stand out." },
  { id: "fft", label: "Spectrum", sim: false, note: "The 2D Fourier transform. Peaks away from the centre point to periodic patterns in the pixels." },
];

/** Interactive layers, computed in the browser from a procedural specimen. */
export function ForensicLab() {
  const [imgs, setImgs] = useState<Record<Id, string> | null>(null);
  const [layer, setLayer] = useState<Id>("heat");
  const [split, setSplit] = useState(0.5);
  const [compare, setCompare] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const c = await renderSpecimen(14, 480);
      const heat = renderHeatmap([{ x: 0.63, y: 0.56, r: 0.11, strength: 0.95 }, { x: 0.38, y: 0.58, r: 0.08, strength: 0.6 }, { x: 0.5, y: 0.66, r: 0.1, strength: 0.5 }], 0.8, 240);
      const out = { original: toDataUrl(c), heat: heat.dataUrl, noise: noiseResidual(c), ela: await errorLevel(c), fft: frequencySpectrum(c, 256) };
      if (alive) setImgs(out);
    })();
    return () => { alive = false; };
  }, []);

  const cur = LAYERS.find((l) => l.id === layer)!;
  const overlay = layer === "heat";
  const canCompare = layer === "noise" || layer === "ela";

  return (
    <section id="lab" aria-labelledby="lab-t" className="relative border-b border-line py-24 sm:py-32">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-8">
        <SectionHead index="04" label="Interactive forensics" title={<span id="lab-t">Inspect the<br />evidence yourself.</span>} lead="Switch layers on a specimen image. The noise, compression and spectrum views are computed live in your browser." />
        <div className="mt-14 grid gap-px border border-line bg-line lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="relative grid place-items-center bg-void p-6 sm:p-10">
            <div className="relative aspect-[4/5] w-full max-w-[460px] overflow-hidden border border-line-strong bg-ink-2">
              {imgs ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgs.original} alt="Specimen portrait" className="absolute inset-0 size-full object-cover" />
                  <AnimatePresence mode="popLayout" initial={false}>
                    {layer !== "original" && (
                      <motion.div key={layer} className="absolute inset-0" initial={{ opacity: 0, scale: 1.02, clipPath: overlay ? "inset(0 100% 0 0)" : "inset(0 0 0 0)" }} animate={{ opacity: 1, scale: 1, clipPath: canCompare && compare ? `inset(0 0 0 ${split * 100}%)` : "inset(0 0 0 0)" }} exit={{ opacity: 0 }} transition={{ duration: overlay ? 1.1 : 0.5, ease: [0.16, 1, 0.3, 1] }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imgs[layer]} alt={`${cur.label} layer`} className={cn("absolute inset-0 size-full", layer === "fft" ? "object-cover" : "object-cover", overlay && "opacity-80 blur-[1px]")} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {canCompare && compare && <span aria-hidden className="pointer-events-none absolute inset-y-0 z-10 w-px bg-cyan shadow-[0_0_10px_rgb(var(--cyan))]" style={{ left: `${split * 100}%` }} />}
                </>
              ) : <div className="grid size-full place-items-center"><span className="label animate-blink">Computing layers…</span></div>}
              <Corners tone="cyan" size={16} />
            </div>
          </div>

          <div className="flex flex-col justify-between gap-8 bg-ink-1 p-6 sm:p-8">
            <div>
              <div role="radiogroup" aria-label="Forensic layer" className="flex flex-wrap gap-1.5">
                {LAYERS.map((l) => (
                  <button key={l.id} role="radio" aria-checked={layer === l.id} onClick={() => setLayer(l.id)} className={cn("h-9 border px-3 font-mono text-2xs uppercase transition-colors", layer === l.id ? "border-cyan bg-cyan text-ink" : "border-line-strong text-fg-muted hover:border-fg-dim hover:text-fg")}>{l.label}</button>
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={layer} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="mt-8">
                  <div className="flex items-center gap-3"><h3 className="display text-4xl">{cur.label}</h3>{cur.sim ? <SimulatedTag /> : layer !== "original" ? <Tag tone="cyan">Computed live</Tag> : null}</div>
                  <p className="text-pretty mt-4 text-[14.5px] leading-relaxed text-fg-muted">{cur.note}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="space-y-3">
              {canCompare && (
                <>
                  <button aria-pressed={compare} onClick={() => setCompare((c) => !c)} className={cn("h-9 w-full border font-mono text-2xs uppercase transition-colors", compare ? "border-cyan/60 bg-cyan/10 text-cyan" : "border-line-strong text-fg-muted hover:text-fg")}>Compare with original</button>
                  {compare && <input type="range" min={0} max={1} step={0.005} value={split} onChange={(e) => setSplit(Number(e.target.value))} aria-label="Comparison position" className="w-full accent-cyan" />}
                </>
              )}
              <p className="border-t border-line pt-4 text-[12px] leading-relaxed text-fg-dim">The specimen is an abstract, procedurally drawn image — not a photograph of a real person.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
