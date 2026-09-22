const ITEMS = ["SIGNAL 04", "FRAME HASH VERIFIED", "LATENCY 142ms", "MODEL v0.4.2", "ANALYSIS NODE EU-CENTRAL", "TEMPORAL CONSISTENCY: ANALYZING", "FREQUENCY SIGNATURE: SCANNING", "FACIAL REGION DETECTED", "EVIDENCE CHAIN INTACT", "CONFIDENCE ≠ CERTAINTY"];

export function Ticker() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div aria-hidden className="relative overflow-hidden border-y border-line bg-ink-1/60 py-3">
      <div className="flex w-max animate-ticker gap-10 whitespace-nowrap font-mono text-2xs uppercase tracking-[0.14em] text-fg-dim">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10">
            {t}
            <span className="size-1 rotate-45 bg-cyan/60" />
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ink to-transparent" />
    </div>
  );
}
