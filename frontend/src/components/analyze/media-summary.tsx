"use client";

import { Panel } from "@/components/ui/panel";
import { Tag } from "@/components/ui/badge";
import type { Media } from "@/types";
import { mediaFields } from "./media-meta";
import { clampAspect, FitBox } from "./fit-box";

/** LEFT column: the evidence item and its ingest metadata. */
export function MediaSummary({ media, id, thumb }: { media: Media; id?: string; thumb?: string }) {
  const src = thumb ?? media.thumbnail;
  return (
    <Panel title="Evidence item" meta={<Tag tone="cyan">{media.kind}</Tag>} flush>
      <FitBox aspect={clampAspect(media.width, media.height)} className="h-[220px] bg-void" innerClassName="overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={`Preview of ${media.filename}`} className="absolute inset-0 size-full object-cover" />
        <div aria-hidden className="scanlines absolute inset-0 opacity-50" />
      </FitBox>
      <div className="space-y-4 p-4">
        <p className="break-all font-mono text-[13px] leading-snug text-fg" title={media.filename}>
          {media.filename}
        </p>
        <dl className="divide-y divide-line border-y border-line">
          {mediaFields(media).map((f) => (
            <div key={f.label} className="flex items-center justify-between gap-4 py-2">
              <dt className="label">{f.label}</dt>
              <dd className="tabular truncate font-mono text-xs text-fg">{f.value}</dd>
            </div>
          ))}
          {id && (
            <div className="flex items-center justify-between gap-4 py-2">
              <dt className="label">Analysis ID</dt>
              <dd className="font-mono text-xs text-cyan">{id}</dd>
            </div>
          )}
        </dl>
      </div>
    </Panel>
  );
}
