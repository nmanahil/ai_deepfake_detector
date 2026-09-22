"use client";

import { useEffect, useState } from "react";
import { BRAND } from "@/lib/constants";
import { StatusDot } from "@/components/ui/telemetry";
import { detection } from "@/services/detection";

/** Sidebar footer: system status, model version, and a drifting latency readout. */
export function LiveStatus() {
  const [latency, setLatency] = useState(142);
  useEffect(() => {
    const t = window.setInterval(() => setLatency(128 + Math.round(Math.random() * 34)), 2400);
    return () => window.clearInterval(t);
  }, []);
  return (
    <div className="space-y-3 border-t border-line px-5 py-4">
      <div className="flex items-center gap-2 font-mono text-2xs uppercase tracking-[0.12em] text-fg-muted">
        <StatusDot tone="signal" />
        System online
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 font-mono text-2xs uppercase">
        <dt className="text-fg-dim">Model</dt>
        <dd className="text-right text-fg">{BRAND.modelVersion}</dd>
        <dt className="text-fg-dim">Node</dt>
        <dd className="text-right text-fg">{BRAND.node}</dd>
        <dt className="text-fg-dim">Latency</dt>
        <dd className="tabular text-right text-fg">{latency}ms</dd>
        <dt className="text-fg-dim">Engine</dt>
        <dd className={detection.simulated ? "text-right text-amber" : "text-right text-signal"}>{detection.simulated ? "Simulated" : "Live"}</dd>
      </dl>
    </div>
  );
}
