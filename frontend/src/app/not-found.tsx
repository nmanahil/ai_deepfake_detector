import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ForensicGrid } from "@/components/states/empty-state";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" className="grid min-h-dvh place-items-center px-4">
      <div className="flex flex-col items-center text-center">
        <Logo />
        <ForensicGrid className="mt-10" />
        <p className="label -mt-4">Error 404</p>
        <h1 className="display mt-4 text-5xl sm:text-7xl">NO SIGNAL AT THIS ADDRESS</h1>
        <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-fg-muted">The page you requested does not exist or has moved.</p>
        <Button variant="primary" className="mt-8" asChild><Link href="/">Return to overview</Link></Button>
      </div>
    </main>
  );
}
