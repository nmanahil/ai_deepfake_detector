"use client";

import { useEffect, useState } from "react";
import { frequencySpectrum } from "@/lib/forensics/layers";
import { makeCanvas } from "@/lib/forensics/canvas";
import { renderSpecimen } from "@/lib/specimen";
import { Segmented } from "@/components/ui/segmented";
import { DiagramFrame } from "./diagram-frame";

type Kind = "natural" | "upsampled";

/** Real 2D FFT of a specimen — once untouched, once with a periodic upsampling pattern injected. */
export function FrequencyDiagram() {
  const [imgs, setImgs] = useState<Record<Kind, { spatial: string; spectrum: string }> | null>(null);
  const [kind, setKind] = useState<Kind>("upsampled");

  useEffect(() => {
    let alive = true;
    (async () => {
      const base = await renderSpecimen(5, 400);
      const synth = makeCanvas(base.width, base.height);
      const ctx = synth.getContext("2d", { willReadFrequently: true })!;
      ctx.drawImage(base, 0, 0);
      const d = ctx.getImageData(0, 0, synth.width, synth.height);
      for (let y = 0; y < synth.height; y++) for (let x = 0; x < synth.width; x++) {
        const p = (y * synth.width + x) * 4;
        const n = 7 * Math.sin((2 * Math.PI * x) / 4) * Math.sin((2 * Math.PI * y) / 4) + 3 * Math.sin((2 * Math.PI * (x + y)) / 8);
        d.data[p] += n; d.data[p + 1] += n; d.data[p + 2] += n;
      }
      ctx.putImageData(d, 0, 0);
      if (alive) setImgs({
        natural: { spatial: base.toDataURL("image/jpeg", 0.85), spectrum: frequencySpectrum(base, 256) },
        upsampled: { spatial: synth.toDataURL("image/jpeg", 0.85), spectrum: frequencySpectrum(synth, 256) },
      });
    })();
    return () => { alive = false; };
  }, []);

  const cur = imgs?.[kind];
  return (
    <DiagramFrame label="Frequency signature" meta={<Segmented label="Source" value={kind} onChange={setKind} options={[{ value: "natural", label: "Natural capture" }, { value: "upsampled", label: "Periodic pattern" }]} />} caption="Left: the image. Right: its 2D Fourier spectrum, computed live. A regular pixel-level pattern — like the repeating grid some generators leave behind when upsampling — appears as sharp peaks away from the centre. The pattern here is injected for illustration; resizing and sharpening can also cause peaks.">
      <div className="grid grid-cols-2 gap-px bg-line">
        {(["spatial", "spectrum"] as const).map((k) => (
          <div key={k} className="relative aspect-[4/5] bg-void sm:aspect-square">
            {cur ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cur[k]} alt={k === "spatial" ? "Image" : "Frequency spectrum"} className="size-full object-cover" />
            ) : (
              <div className="grid size-full place-items-center"><span className="label animate-blink">Computing FFT…</span></div>
            )}
            <span className="absolute left-2 top-2 bg-ink/80 px-1.5 py-0.5 font-mono text-[9px] uppercase text-cyan">{k === "spatial" ? "Spatial" : "Spectrum · log |F|"}</span>
          </div>
        ))}
      </div>
    </DiagramFrame>
  );
}
