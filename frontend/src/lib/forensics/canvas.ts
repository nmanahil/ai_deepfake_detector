export type Drawable = HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap;

export function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}

export function sourceSize(src: Drawable): { w: number; h: number } {
  if (src instanceof HTMLVideoElement) return { w: src.videoWidth, h: src.videoHeight };
  if (src instanceof HTMLImageElement) return { w: src.naturalWidth, h: src.naturalHeight };
  return { w: (src as HTMLCanvasElement | ImageBitmap).width, h: (src as HTMLCanvasElement | ImageBitmap).height };
}

/** Draw any source into a new canvas whose longest side is at most `maxSide`. */
export function fitToCanvas(src: Drawable, maxSide: number): HTMLCanvasElement {
  const { w, h } = sourceSize(src);
  const scale = Math.min(1, maxSide / Math.max(w, h));
  const c = makeCanvas(w * scale, h * scale);
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(src, 0, 0, c.width, c.height);
  return c;
}

export function toDataUrl(c: HTMLCanvasElement, type: "image/jpeg" | "image/png" = "image/jpeg", quality = 0.82) {
  return c.toDataURL(type, quality);
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image decode failed"));
    img.src = src;
  });
}

/** Yield to the browser so long computations don't freeze animation. */
export const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));
