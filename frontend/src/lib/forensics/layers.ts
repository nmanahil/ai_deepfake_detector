import { clamp } from "@/lib/utils";
import { fitToCanvas, loadImage, makeCanvas, toDataUrl, type Drawable } from "./canvas";
import type { Region } from "@/types";

/* ────────────────────────────────────────────────────────────────────────────
 * Real signal-processing layers computed from the uploaded pixels.
 * These are genuine forensic visualisations (they are what an analyst would
 * inspect), but they do NOT drive the mock verdict.
 * ──────────────────────────────────────────────────────────────────────────── */

type Stop = [number, number, number, number]; // t, r, g, b

function ramp(stops: Stop[], t: number): [number, number, number] {
  const v = clamp(t);
  for (let i = 1; i < stops.length; i++) {
    const a = stops[i - 1];
    const b = stops[i];
    if (v <= b[0]) {
      const k = (v - a[0]) / (b[0] - a[0] || 1);
      return [a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k, a[3] + (b[3] - a[3]) * k];
    }
  }
  const last = stops[stops.length - 1];
  return [last[1], last[2], last[3]];
}

const COOL: Stop[] = [
  [0, 4, 8, 12],
  [0.35, 10, 42, 66],
  [0.7, 56, 226, 255],
  [1, 235, 250, 255],
];

const HEAT: Stop[] = [
  [0, 255, 176, 32],
  [0.55, 255, 120, 40],
  [1, 255, 60, 80],
];

function grayscale(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const { data } = ctx.getImageData(0, 0, w, h);
  const g = new Float32Array(w * h);
  for (let i = 0, p = 0; i < g.length; i++, p += 4) {
    g[i] = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
  }
  return g;
}

/** Noise residual: image minus its 3×3 local mean, amplified. Highlights sensor/generator texture. */
export function noiseResidual(src: Drawable): string {
  const c = fitToCanvas(src, 320);
  const { width: w, height: h } = c;
  const g = grayscale(c.getContext("2d")!, w, h);
  const out = new Float32Array(w * h);
  let max = 1e-6;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let s = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) s += g[(y + dy) * w + x + dx];
      const r = Math.abs(g[y * w + x] - s / 9);
      out[y * w + x] = r;
      if (r > max) max = r;
    }
  }
  // Robust normalisation: use ~99th percentile rather than max.
  const sorted = Float32Array.from(out).sort();
  const hi = Math.max(sorted[Math.floor(sorted.length * 0.99)], 1e-3);
  const res = makeCanvas(w, h);
  const rctx = res.getContext("2d")!;
  const img = rctx.createImageData(w, h);
  for (let i = 0; i < out.length; i++) {
    const [r, gg, b] = ramp(COOL, Math.pow(clamp(out[i] / hi), 0.8));
    img.data[i * 4] = r;
    img.data[i * 4 + 1] = gg;
    img.data[i * 4 + 2] = b;
    img.data[i * 4 + 3] = 255;
  }
  rctx.putImageData(img, 0, 0);
  return toDataUrl(res, "image/jpeg", 0.85);
}

/** Error-level analysis: recompress at a known quality and amplify the difference. */
export async function errorLevel(src: Drawable): Promise<string> {
  const c = fitToCanvas(src, 480);
  const { width: w, height: h } = c;
  const recompressed = await loadImage(c.toDataURL("image/jpeg", 0.75));
  const rc = makeCanvas(w, h);
  const rctx = rc.getContext("2d", { willReadFrequently: true })!;
  rctx.drawImage(recompressed, 0, 0, w, h);
  const a = c.getContext("2d")!.getImageData(0, 0, w, h).data;
  const b = rctx.getImageData(0, 0, w, h).data;
  const diff = new Float32Array(w * h);
  for (let i = 0; i < diff.length; i++) {
    const p = i * 4;
    diff[i] = (Math.abs(a[p] - b[p]) + Math.abs(a[p + 1] - b[p + 1]) + Math.abs(a[p + 2] - b[p + 2])) / 3;
  }
  const sorted = Float32Array.from(diff).sort();
  const hi = Math.max(sorted[Math.floor(sorted.length * 0.995)], 1);
  const out = rctx.createImageData(w, h);
  for (let i = 0; i < diff.length; i++) {
    const [r, g, bl] = ramp(COOL, Math.pow(clamp(diff[i] / hi), 0.7));
    out.data[i * 4] = r;
    out.data[i * 4 + 1] = g;
    out.data[i * 4 + 2] = bl;
    out.data[i * 4 + 3] = 255;
  }
  rctx.putImageData(out, 0, 0);
  return toDataUrl(rc, "image/jpeg", 0.85);
}

/* ── 2D FFT (radix-2) ─────────────────────────────────────────────────────── */

function fft1d(re: Float64Array, im: Float64Array) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang);
    const wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1;
      let ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k;
        const b = a + len / 2;
        const tr = re[b] * cr - im[b] * ci;
        const ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr;
        im[b] = im[a] - ti;
        re[a] += tr;
        im[a] += ti;
        const ncr = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = ncr;
      }
    }
  }
}

/** Log-magnitude spectrum of a Hann-windowed grayscale image, DC-centred. */
export function fftMagnitude(g: Float32Array, size: number): Float32Array {
  const re = new Float64Array(size * size);
  const im = new Float64Array(size * size);
  for (let y = 0; y < size; y++) {
    const wy = 0.5 - 0.5 * Math.cos((2 * Math.PI * y) / (size - 1));
    for (let x = 0; x < size; x++) {
      const wx = 0.5 - 0.5 * Math.cos((2 * Math.PI * x) / (size - 1));
      re[y * size + x] = (g[y * size + x] - 128) * wx * wy;
    }
  }
  const rr = new Float64Array(size);
  const ri = new Float64Array(size);
  for (let y = 0; y < size; y++) {
    rr.set(re.subarray(y * size, (y + 1) * size));
    ri.set(im.subarray(y * size, (y + 1) * size));
    fft1d(rr, ri);
    re.set(rr, y * size);
    im.set(ri, y * size);
  }
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      rr[y] = re[y * size + x];
      ri[y] = im[y * size + x];
    }
    fft1d(rr, ri);
    for (let y = 0; y < size; y++) {
      re[y * size + x] = rr[y];
      im[y * size + x] = ri[y];
    }
  }
  const mag = new Float32Array(size * size);
  const half = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const sy = (y + half) % size;
      const sx = (x + half) % size;
      mag[sy * size + sx] = Math.log1p(Math.hypot(re[y * size + x], im[y * size + x]));
    }
  }
  return mag;
}

export function frequencySpectrum(src: Drawable, size = 256): string {
  const sq = makeCanvas(size, size);
  const sctx = sq.getContext("2d", { willReadFrequently: true })!;
  sctx.imageSmoothingQuality = "high";
  // Centre-crop to a square so the spectrum isn't skewed by aspect ratio.
  const w = (src as HTMLCanvasElement).width ?? (src as HTMLImageElement).naturalWidth;
  const h = (src as HTMLCanvasElement).height ?? (src as HTMLImageElement).naturalHeight;
  const side = Math.min(w, h);
  sctx.drawImage(src, (w - side) / 2, (h - side) / 2, side, side, 0, 0, size, size);
  const mag = fftMagnitude(grayscale(sctx, size, size), size);
  let lo = Infinity;
  let hi = -Infinity;
  for (const v of mag) {
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  const out = sctx.createImageData(size, size);
  for (let i = 0; i < mag.length; i++) {
    const [r, g, b] = ramp(COOL, Math.pow((mag[i] - lo) / (hi - lo || 1), 1.35));
    out.data[i * 4] = r;
    out.data[i * 4 + 1] = g;
    out.data[i * 4 + 2] = b;
    out.data[i * 4 + 3] = 255;
  }
  sctx.putImageData(out, 0, 0);
  return toDataUrl(sq, "image/jpeg", 0.88);
}

/* ── Simulated heat overlay ───────────────────────────────────────────────── */

export interface HeatBlob {
  x: number;
  y: number;
  r: number;
  strength: number;
}

/** Render Gaussian blobs into a transparent amber→red PNG overlay. */
export function renderHeatmap(blobs: HeatBlob[], aspect: number, width = 256): { dataUrl: string; peak: number; width: number; height: number } {
  const w = width;
  const h = Math.max(8, Math.round(width / aspect));
  const field = new Float32Array(w * h);
  let peak = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = 0;
      for (const b of blobs) {
        const dx = (x / w - b.x) * aspect;
        const dy = y / h - b.y;
        v += b.strength * Math.exp(-(dx * dx + dy * dy) / (2 * b.r * b.r));
      }
      field[y * w + x] = v;
      if (v > peak) peak = v;
    }
  }
  const c = makeCanvas(w, h);
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(w, h);
  for (let i = 0; i < field.length; i++) {
    const t = clamp(field[i]);
    const [r, g, b] = ramp(HEAT, t);
    img.data[i * 4] = r;
    img.data[i * 4 + 1] = g;
    img.data[i * 4 + 2] = b;
    img.data[i * 4 + 3] = Math.round(clamp((t - 0.06) / 0.7) * 215);
  }
  ctx.putImageData(img, 0, 0);
  return { dataUrl: c.toDataURL("image/png"), peak: clamp(peak), width: w, height: h };
}

export function regionCentre(r: Region) {
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
}
