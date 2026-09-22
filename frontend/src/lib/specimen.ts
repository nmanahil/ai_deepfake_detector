import { loadImage, makeCanvas } from "./forensics/canvas";
import { mulberry32, pick, range } from "./rng";
import type { Region } from "@/types";

/**
 * Procedurally drawn abstract portraits ("specimens"). No stock imagery: these are
 * used by the landing page, the technology diagrams and the sample archive.
 */

const TONES = [
  ["#c9b8a8", "#8f7d6e", "#4d4038"],
  ["#b89f8a", "#7d6552", "#3f2f26"],
  ["#d6c7b8", "#a08f80", "#5a4d44"],
  ["#9a8271", "#65503f", "#2f231b"],
  ["#c4b0a2", "#86705f", "#43362d"],
] as const;

const BACKDROPS = [
  ["#141b24", "#080b10"],
  ["#12202a", "#070c11"],
  ["#1a1a22", "#0a0a0f"],
  ["#10201f", "#060b0b"],
] as const;

export const SPECIMEN_VIEWBOX = { w: 400, h: 500 };

/** Normalised face region (approximate, for the default un-offset specimen). */
export const SPECIMEN_FACE: Region = { x: 0.29, y: 0.2, w: 0.42, h: 0.46 };

export interface SpecimenOptions {
  /** Timeline position in seconds for video specimens — shifts pose subtly. */
  t?: number;
  /** Scale the head’s apparent size. */
  zoom?: number;
}

export function specimenPose(seed: number, t = 0) {
  const r = mulberry32(seed);
  const baseX = range(r, -14, 14);
  const baseY = range(r, -6, 6);
  return {
    dx: baseX + Math.sin(t * 0.9 + seed) * 9,
    dy: baseY + Math.cos(t * 0.7) * 4,
    rot: Math.sin(t * 0.5 + seed) * 3 + range(r, -3, 3),
  };
}

export function specimenFaceRegion(seed: number, t = 0): Region {
  const p = specimenPose(seed, t);
  return {
    x: SPECIMEN_FACE.x + p.dx / 400,
    y: SPECIMEN_FACE.y + p.dy / 500,
    w: SPECIMEN_FACE.w,
    h: SPECIMEN_FACE.h,
  };
}

export function specimenSvg(seed: number, opts: SpecimenOptions = {}): string {
  const r = mulberry32(seed);
  const [skinHi, skinMid, skinLo] = pick(r, TONES);
  const [bgHi, bgLo] = pick(r, BACKDROPS);
  const light = r() > 0.5 ? 1 : -1; // key light side
  const hairStyle = Math.floor(r() * 3);
  const hairCol = pick(r, ["#12100f", "#1d1612", "#2a211a", "#0c0c0e"]);
  const pose = specimenPose(seed, opts.t ?? 0);
  const zoom = opts.zoom ?? 1;
  const lx = light > 0 ? 30 : 70;

  const hair = [
    `<path d="M112 175 C104 96 152 66 205 66 C262 66 300 104 290 178 C280 138 250 112 205 110 C160 112 128 134 112 175Z" fill="${hairCol}"/>`,
    `<path d="M110 190 C96 100 160 58 214 64 C270 70 306 116 290 190 C286 150 262 118 204 118 C150 118 118 146 110 190Z" fill="${hairCol}"/>`,
    `<path d="M120 150 C124 108 160 92 204 92 C246 92 280 112 282 150 C262 128 240 122 204 122 C168 122 140 130 120 150Z" fill="${hairCol}"/>`,
  ][hairStyle];

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
<defs>
<radialGradient id="bg" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="${bgHi}"/><stop offset="1" stop-color="${bgLo}"/></radialGradient>
<radialGradient id="face" cx="${lx}%" cy="38%" r="80%"><stop offset="0" stop-color="${skinHi}"/><stop offset=".55" stop-color="${skinMid}"/><stop offset="1" stop-color="${skinLo}"/></radialGradient>
<linearGradient id="neck" x1="0" x2="1"><stop offset="0" stop-color="${skinLo}"/><stop offset=".5" stop-color="${skinMid}"/><stop offset="1" stop-color="${skinLo}"/></linearGradient>
<linearGradient id="shoulder" x1="0" x2="1"><stop offset="0" stop-color="#10151c"/><stop offset=".5" stop-color="#1b2430"/><stop offset="1" stop-color="#0d1218"/></linearGradient>
<radialGradient id="rim" cx="${light > 0 ? 100 : 0}%" cy="40%" r="55%"><stop offset="0" stop-color="#7fdcff" stop-opacity=".22"/><stop offset="1" stop-color="#7fdcff" stop-opacity="0"/></radialGradient>
<filter id="soft"><feGaussianBlur stdDeviation="3"/></filter>
<filter id="soft2"><feGaussianBlur stdDeviation="7"/></filter>
</defs>
<rect width="400" height="500" fill="url(#bg)"/>
<circle cx="200" cy="200" r="190" fill="url(#rim)"/>
<g transform="translate(${pose.dx.toFixed(1)} ${pose.dy.toFixed(1)}) rotate(${pose.rot.toFixed(2)} 200 260) translate(200 260) scale(${zoom}) translate(-200 -260)">
<path d="M28 500 C40 430 100 402 152 392 L248 392 C300 402 360 430 372 500Z" fill="url(#shoulder)"/>
<path d="M165 300 L165 400 C180 412 220 412 235 400 L235 300Z" fill="url(#neck)"/>
<path d="M165 330 C190 352 212 352 235 330 L235 360 C210 372 190 372 165 360Z" fill="#000" opacity=".28" filter="url(#soft)"/>
<ellipse cx="121" cy="222" rx="10" ry="22" fill="${skinMid}"/><ellipse cx="279" cy="222" rx="10" ry="22" fill="${skinMid}"/>
<path d="M118 195 C118 120 156 100 200 100 C244 100 282 120 282 195 C282 262 262 326 200 326 C138 326 118 262 118 195Z" fill="url(#face)"/>
${hair}
<path d="M118 230 C126 296 158 326 200 326 C242 326 274 296 282 230 C270 292 244 316 200 316 C156 316 130 292 118 230Z" fill="#000" opacity=".22" filter="url(#soft)"/>
<ellipse cx="163" cy="200" rx="21" ry="10" fill="#000" opacity=".28" filter="url(#soft)"/><ellipse cx="237" cy="200" rx="21" ry="10" fill="#000" opacity=".28" filter="url(#soft)"/>
<ellipse cx="163" cy="201" rx="14" ry="5.6" fill="#e6e0d8"/><ellipse cx="237" cy="201" rx="14" ry="5.6" fill="#e6e0d8"/>
<circle cx="${light > 0 ? 165 : 161}" cy="201" r="4.6" fill="#1a1512"/><circle cx="${light > 0 ? 239 : 235}" cy="201" r="4.6" fill="#1a1512"/>
<path d="M142 184 Q163 174 186 182" stroke="${hairCol}" stroke-width="5" stroke-linecap="round" fill="none"/>
<path d="M214 182 Q237 174 258 184" stroke="${hairCol}" stroke-width="5" stroke-linecap="round" fill="none"/>
<path d="M198 208 C194 232 190 246 186 258 C194 266 206 266 214 258 C210 246 206 232 202 208Z" fill="${skinLo}" opacity=".32" filter="url(#soft)"/>
<ellipse cx="189" cy="262" rx="4" ry="2.4" fill="#000" opacity=".35"/><ellipse cx="211" cy="262" rx="4" ry="2.4" fill="#000" opacity=".35"/>
<path d="M170 293 Q186 286 200 289 Q214 286 230 293 Q214 309 200 309 Q186 309 170 293Z" fill="${skinLo}" opacity=".85"/>
<path d="M170 293 Q200 300 230 293" stroke="#000" stroke-opacity=".35" stroke-width="1.4" fill="none"/>
<ellipse cx="${light > 0 ? 150 : 250}" cy="248" rx="26" ry="34" fill="#fff" opacity=".07" filter="url(#soft2)"/>
</g>
</svg>`;
}

/** Facial landmark polylines for the forensic overlay, in specimen viewBox space. */
export const SPECIMEN_LANDMARKS = {
  jaw: "M118 214 C118 270 146 326 200 326 C254 326 282 270 282 214",
  browL: "M142 184 Q163 174 186 182",
  browR: "M214 182 Q237 174 258 184",
  eyeL: "M149 201 Q163 192 177 201 Q163 209 149 201Z",
  eyeR: "M223 201 Q237 192 251 201 Q237 209 223 201Z",
  nose: "M199 208 L188 258 Q200 266 212 258 L201 208",
  mouth: "M170 293 Q186 286 200 289 Q214 286 230 293 Q214 309 200 309 Q186 309 170 293Z",
  contour: "M118 195 C118 120 156 100 200 100 C244 100 282 120 282 195",
};

/** Points used to draw a "mesh" of landmark nodes. */
export const SPECIMEN_POINTS: [number, number][] = [
  [118, 195], [120, 240], [136, 285], [165, 316], [200, 326], [235, 316], [264, 285], [280, 240], [282, 195],
  [142, 184], [163, 176], [186, 182], [214, 182], [237, 176], [258, 184],
  [149, 201], [163, 193], [177, 201], [163, 208], [223, 201], [237, 193], [251, 201], [237, 208],
  [199, 208], [188, 258], [200, 266], [212, 258], [170, 293], [200, 289], [230, 293], [200, 309],
  [150, 120], [200, 100], [250, 120],
];

const grainCache = new Map<string, HTMLCanvasElement>();

/** Rasterise a specimen to a canvas, with sensor-like grain so forensic layers look natural. */
export async function renderSpecimen(seed: number, width = 480, opts: SpecimenOptions = {}): Promise<HTMLCanvasElement> {
  const key = `${seed}:${width}:${opts.t ?? 0}:${opts.zoom ?? 1}`;
  const hit = grainCache.get(key);
  if (hit) return hit;
  const svg = specimenSvg(seed, opts);
  const img = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
  const h = Math.round((width * 500) / 400);
  const c = makeCanvas(width, h);
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, width, h);
  const data = ctx.getImageData(0, 0, width, h);
  const r = mulberry32(seed ^ 0xabcdef);
  for (let i = 0; i < data.data.length; i += 4) {
    const n = (r() - 0.5) * 12 + (r() - 0.5) * 6;
    data.data[i] += n;
    data.data[i + 1] += n;
    data.data[i + 2] += n;
  }
  ctx.putImageData(data, 0, 0);
  if (grainCache.size > 40) grainCache.clear();
  grainCache.set(key, c);
  return c;
}

export function specimenDataUrl(seed: number, opts: SpecimenOptions = {}) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(specimenSvg(seed, opts))}`;
}
