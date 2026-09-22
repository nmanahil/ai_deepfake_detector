"use client";

import { Reveal, SectionHead } from "./reveal";

const PRINCIPLES = [
  ["Probabilistic, never absolute", "Every result is a confidence, not a verdict of fact. We say “likely manipulated” and “low evidence of manipulation” — never “definitely fake”."],
  ["Show the work", "Each assessment ships with the signals, regions and frames behind it, so a person can judge the evidence rather than trust a number."],
  ["Errors happen both ways", "False positives flag authentic media; false negatives miss manipulated media. Heavy compression, filters and new generators all increase the risk."],
  ["A human decides", "Automated output is one input to review — alongside provenance, context and the original source."],
];

const MATRIX = [
  { k: "TP", t: "Correctly flagged", tone: "text-signal border-signal/40" },
  { k: "FP", t: "Authentic media flagged", tone: "text-amber border-amber/40" },
  { k: "FN", t: "Manipulation missed", tone: "text-alert border-alert/40" },
  { k: "TN", t: "Correctly cleared", tone: "text-signal border-signal/40" },
];

export function Trust() {
  return (
    <section id="trust" aria-labelledby="trust-t" className="relative border-b border-line py-24 sm:py-32">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-8">
        <SectionHead index="06" label="Trust & limitations" title={<span id="trust-t">Honest about what<br />a detector can say.</span>} />
        <div className="mt-16 grid gap-16 lg:grid-cols-[1.3fr_1fr] lg:gap-24">
          <ul className="divide-y divide-line border-y border-line">
            {PRINCIPLES.map(([t, d], i) => (
              <Reveal as="li" key={t} delay={i * 0.06} className="grid gap-3 py-7 sm:grid-cols-[48px_1fr]">
                <span className="font-mono text-xs text-cyan">0{i + 1}</span>
                <div><h3 className="display text-[30px]">{t}</h3><p className="text-pretty mt-2 max-w-xl text-[14.5px] leading-relaxed text-fg-muted">{d}</p></div>
              </Reveal>
            ))}
          </ul>
          <Reveal delay={0.1}>
            <p className="label mb-4">Outcome matrix</p>
            <div className="grid grid-cols-2 gap-px border border-line bg-line">
              {MATRIX.map((m) => (
                <div key={m.k} className="bg-ink-1 p-5">
                  <span className={`inline-block border px-2 py-0.5 font-mono text-2xs ${m.tone}`}>{m.k}</span>
                  <p className="mt-6 text-[13px] leading-snug text-fg-muted">{m.t}</p>
                </div>
              ))}
            </div>
            <p className="text-pretty mt-6 text-[13px] leading-relaxed text-fg-dim">Confidence represents the model’s assessment based on the available forensic signals. It is not a guarantee of authenticity.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
