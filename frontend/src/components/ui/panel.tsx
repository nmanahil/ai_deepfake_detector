import * as React from "react";
import { cn } from "@/lib/utils";
import { Corners } from "./corners";

interface PanelProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  as?: "div" | "section" | "aside" | "article";
  corners?: boolean;
  /** Mono label rendered in the header strip. */
  title?: React.ReactNode;
  /** Right-aligned content in the header strip. */
  meta?: React.ReactNode;
  bodyClassName?: string;
  flush?: boolean;
}

export const Panel = React.forwardRef<HTMLElement, PanelProps>(function Panel(
  { as: Tag = "section", corners = true, title, meta, className, bodyClassName, flush, children, ...rest },
  ref,
) {
  const Comp = Tag as React.ElementType;
  return (
    <Comp ref={ref} className={cn("relative border border-line bg-ink-1/80", className)} {...rest}>
      {corners && <Corners />}
      {(title || meta) && (
        <header className="flex min-h-9 items-center justify-between gap-3 border-b border-line px-4 py-2">
          <h2 className="label-strong flex items-center gap-2">{title}</h2>
          {meta && <div className="label flex items-center gap-3">{meta}</div>}
        </header>
      )}
      <div className={cn(!flush && "p-4", bodyClassName)}>{children}</div>
    </Comp>
  );
});
