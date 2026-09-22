"use client";

import Link from "next/link";
import { ErrorPanel } from "@/components/states/error-panel";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main" className="grid min-h-dvh place-items-center px-4">
      <ErrorPanel
        className="w-full max-w-2xl"
        title="SYSTEM FAULT"
        detail="Something went wrong while rendering this view. Your archive is unaffected."
        code={error.digest ?? "RENDER_ERROR"}
        actions={<><Button variant="primary" onClick={reset}>Try again</Button><Button variant="secondary" asChild><Link href="/">Return home</Link></Button></>}
      />
    </main>
  );
}
