"use client";

import { MotionConfig } from "framer-motion";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnalysisSessionProvider } from "@/hooks/use-analysis-session";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <TooltipProvider>
        <AnalysisSessionProvider>{children}</AnalysisSessionProvider>
      </TooltipProvider>
    </MotionConfig>
  );
}
