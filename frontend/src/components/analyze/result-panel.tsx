"use client";

import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { Meter, toneForScore } from "@/components/ui/meter";
import { Panel } from "@/components/ui/panel";
import { SimulatedTag, VerdictBadge } from "@/components/ui/badge";
import { DEMO_NOTICE, VERDICTS } from "@/lib/constants";
import { pct } from "@/lib/utils";
import type { Analysis } from "@/types";
import { FindingsList } from "./findings-list";

/** RIGHT column: detection results, confidence, explanation, findings. */
export function ResultPanel({ analysis, selectedId, onSelect }: { analysis: Analysis; selectedId: string | null; onSelect: (id: string) => void }) {
  const { result, evidence, media } = analysis;
  const v = VERDICTS[result.verdict];
  const signals = result.signals.filter((s) => s.applicable);
  const na = result.signals.filter((s) => !s.applicable);

  return (
    <div className="space-y-4">
      <Panel title="Detection result" meta={result.simulated && <SimulatedTag />}>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <VerdictBadge verdict={result.verdict} />
            <p className="max-w-[220px] text-[13px] leading-snug text-fg-muted">{result.headline}</p>
          </div>
          <div className="text-right">
            <p className="label">Model confidence</p>
            <p className={`tabular font-mono text-3xl font-medium ${v.text}`}>{pct(result.confidence)}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-px border border-line bg-line">
          <div className="bg-ink-1 p-3">
            <p className="label">Manipulation score</p>
            <p className="tabular mt-1 font-mono text-sm text-fg">{result.manipulationScore.toFixed(3)}</p>
          </div>
          <div className="bg-ink-1 p-3">
            <p className="label">Evidence items</p>
            <p className="tabular mt-1 font-mono text-sm text-fg">{String(evidence.length).padStart(2, "0")}</p>
          </div>
        </div>
      </Panel>

      <Panel title="Why this result?">
        <p className="label mb-3">Primary signals</p>
        <ul className="space-y-3.5">
          {signals.map((s, i) => (
            <li key={s.key}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3 font-mono text-2xs uppercase">
                <span className="text-fg-muted">{s.label}</span>
                <span className="tabular text-fg">{pct(s.score, 0)}</span>
              </div>
              <Meter value={s.score} tone={toneForScore(s.score)} delay={0.1 + i * 0.12} segments={20} />
            </li>
          ))}
          {na.map((s) => (
            <li key={s.key} className="flex items-baseline justify-between gap-3 font-mono text-2xs uppercase text-fg-dim">
              <span>{s.label}</span>
              <span>N/A · still image</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 space-y-3 border-t border-line pt-4">
          {result.explanation.map((p, i) => (
            <motion.p key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.15 }} className="text-pretty text-[13px] leading-relaxed text-fg-muted">
              {p}
            </motion.p>
          ))}
        </div>
      </Panel>

      <Panel title="Forensic findings" meta={<span className="tabular">{String(evidence.length).padStart(2, "0")}</span>} flush>
        {evidence.length ? (
          <>
            <FindingsList evidence={evidence} selectedId={selectedId} onSelect={onSelect} isVideo={media.kind === "video"} />
            <p className="border-t border-line px-4 py-3 text-[12px] leading-relaxed text-fg-dim">
              Individual signals do not prove manipulation. Each is one contribution to the overall assessment.
            </p>
          </>
        ) : (
          <p className="px-4 py-8 text-center font-mono text-2xs uppercase text-fg-dim">No notable findings recorded</p>
        )}
      </Panel>

      <div className="flex gap-3 border border-line bg-ink-1/60 p-4">
        <Info className="mt-0.5 size-4 shrink-0 text-fg-dim" strokeWidth={1.5} />
        <div className="space-y-2 text-[12px] leading-relaxed text-fg-muted">
          <p>
            <span className="text-fg">Detection is probabilistic.</span> Systems like this can produce false positives and false negatives. Treat results as one input to human review.
          </p>
          {result.simulated && <p className="text-amber">{DEMO_NOTICE}</p>}
        </div>
      </div>
    </div>
  );
}
