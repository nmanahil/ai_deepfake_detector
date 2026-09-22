"use client";

import { motion } from "framer-motion";
import { SectionLabel } from "@/components/ui/section-label";

export function PageHeader({
  index,
  eyebrow,
  title,
  description,
  actions,
}: {
  index: string;
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="relative flex flex-col gap-6 border-b border-line px-4 pb-8 pt-8 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:pt-12">
      <div className="max-w-2xl">
        <SectionLabel index={index}>{eyebrow}</SectionLabel>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="display mt-4 text-[44px] sm:text-6xl"
        >
          {title}
        </motion.h1>
        {description && <p className="text-pretty mt-4 max-w-xl text-[15px] leading-relaxed text-fg-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}
