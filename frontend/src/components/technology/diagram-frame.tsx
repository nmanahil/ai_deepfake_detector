import { Panel } from "@/components/ui/panel";

export function DiagramFrame({ label, children, caption, meta }: { label: string; children: React.ReactNode; caption?: string; meta?: React.ReactNode }) {
  return (
    <Panel title={label} meta={meta} flush className="bg-ink-1/60">
      <div className="relative">{children}</div>
      {caption && <p className="border-t border-line px-4 py-3 text-[12px] leading-relaxed text-fg-muted">{caption}</p>}
    </Panel>
  );
}
