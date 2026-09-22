"use client";

import { useEffect, useRef, useState } from "react";
import { errorLevel, noiseResidual } from "@/lib/forensics/layers";
import { renderSpecimen } from "@/lib/specimen";
import { toDataUrl } from "@/lib/forensics/canvas";
import { Segmented } from "@/components/ui/segmented";
import { DiagramFrame } from "./diagram-frame";

type View = "noise" | "ela";

/** Hover lens over a real, in-browser noise-residual / ELA computation of a specimen. */
export function ArtifactsDiagram() {
  const [layers, setLayers] = useState<{ base: string; noise: string; ela: string } | null>(null);
  const [view, setView] = useState<View>("noise");
  const [pos, setPos] = useState<{ x: number; y: number } | null>({ x: 50, y: 42 });
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const c = await renderSpecimen(21, 480);
      const ela = await errorLevel(c);
      if (alive) setLayers({ base: toDataUrl(c), noise: noiseResidual(c), ela });
    })();
    return () => { alive = false; };
  }, []);

  const move = (e: React.PointerEvent) => {
    const r = box.current!.getBoundingClientRect();
    setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };
  const key = (e: React.KeyboardEvent) => {
    const d = 4;
    setPos((p) => {
      const c = p ?? { x: 50, y: 50 };
      if (e.key === "ArrowLeft") return { ...c, x: Math.max(0, c.x - d) };
      if (e.key === "ArrowRight") return { ...c, x: Math.min(100, c.x + d) };
      if (e.key === "ArrowUp") return { ...c, y: Math.max(0, c.y - d) };
      if (e.key === "ArrowDown") return { ...c, y: Math.min(100, c.y + d) };
      return c;
    });
  };
  const layer = layers?.[view];

  return (
    <DiagramFrame label="Artifact lens" meta={<Segmented label="Layer" value={view} onChange={setView} options={[{ value: "noise", label: "Noise residual" }, { value: "ela", label: "ELA" }]} />} caption="Computed live in your browser from a procedurally drawn specimen. Move the lens (or use the arrow keys) to compare the source with its forensic residue. Smooth, over-regularised regions can be a sign of synthetic texture.">
      <div className="grid place-items-center bg-void p-4 sm:p-6">
        <div ref={box} tabIndex={0} onKeyDown={key} onPointerMove={move} onPointerLeave={() => setPos(null)} aria-label="Forensic lens. Use arrow keys to move." role="application" className="relative aspect-[4/5] w-full max-w-[380px] cursor-none overflow-hidden border border-line-strong bg-ink-2 touch-none">
          {layers ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={layers.base} alt="Specimen source" className="absolute inset-0 size-full object-cover" />
              {pos && layer && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={layer} alt="" className="absolute inset-0 size-full object-cover" style={{ clipPath: `circle(22% at ${pos.x}% ${pos.y}%)` }} />
                  <span aria-hidden className="pointer-events-none absolute aspect-square w-[44%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan shadow-[0_0_24px_rgb(var(--cyan)/0.35)]" style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%,-50%)" }} />
                </>
              )}
            </>
          ) : (
            <div className="grid size-full place-items-center"><span className="label animate-blink">Computing residual…</span></div>
          )}
        </div>
      </div>
    </DiagramFrame>
  );
}
