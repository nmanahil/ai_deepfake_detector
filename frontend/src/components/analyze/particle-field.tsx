"use client";

import { useReduce } from "@/hooks/use-reduced-motion";
import { useEffect, useRef } from "react";

/**
 * Canvas particle field. When `active`, faint cyan motes are drawn inward toward the
 * centre and expanding signal rings pulse outward. Fades out cleanly when inactive.
 */
export function ParticleField({ active, className }: { active: boolean; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const reduce = useReduce();
  activeRef.current = active;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || reduce) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    type P = { x: number; y: number; v: number; a: number; life: number };
    const parts: P[] = [];
    const rings: { r: number; a: number }[] = [];
    let energy = 0;
    let last = performance.now();
    let ringClock = 0;

    const spawn = () => {
      const ang = Math.random() * Math.PI * 2;
      const rad = Math.max(w, h) * (0.55 + Math.random() * 0.2);
      parts.push({
        x: w / 2 + Math.cos(ang) * rad,
        y: h / 2 + Math.sin(ang) * rad * 0.7,
        v: 40 + Math.random() * 90,
        a: 0,
        life: 0,
      });
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      energy += ((activeRef.current ? 1 : 0) - energy) * Math.min(1, dt * 5);
      ctx.clearRect(0, 0, w, h);
      if (energy > 0.01) {
        if (Math.random() < energy * 1.6) spawn();
        ringClock += dt;
        if (activeRef.current && ringClock > 0.55) {
          ringClock = 0;
          rings.push({ r: 20, a: 0.55 });
        }
      }
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        const dx = w / 2 - p.x;
        const dy = h / 2 - p.y;
        const d = Math.hypot(dx, dy);
        p.life += dt;
        p.x += (dx / d) * p.v * dt;
        p.y += (dy / d) * p.v * dt;
        p.a = Math.min(1, p.life * 2.5) * Math.min(1, d / 120) * energy;
        if (d < 24) parts.splice(i, 1);
        else {
          ctx.fillStyle = `rgba(56,226,255,${p.a * 0.75})`;
          ctx.fillRect(p.x, p.y, 1.6, 1.6);
        }
      }
      for (let i = rings.length - 1; i >= 0; i--) {
        const ring = rings[i];
        ring.r += 210 * dt;
        ring.a -= 0.42 * dt;
        if (ring.a <= 0) rings.splice(i, 1);
        else {
          ctx.strokeStyle = `rgba(56,226,255,${ring.a * 0.5})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(w / 2, h / 2, ring.r, ring.r * 0.72, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [reduce]);

  return <canvas ref={ref} aria-hidden className={className ?? "absolute inset-0 size-full"} />;
}
