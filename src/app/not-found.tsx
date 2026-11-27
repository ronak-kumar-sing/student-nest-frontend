import Link from "next/link";
import { Handbill } from "@/components/handbill/handbill";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RiHomeLine, RiSearchLine } from "@remixicon/react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Handbill tone="marigold" tilt={-1}>
          <div className="space-y-4 text-center">
            <span className="font-heading text-display font-bold text-ink">404</span>
            <h1 className="font-heading text-title font-semibold text-ink">
              Page not found
            </h1>
            <p className="text-body text-ink">
              The link you followed may be broken or the room listing may have been
              removed by its owner.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full sm:w-auto border-ink/40 text-ink bg-transparent hover:bg-ink/10 inline-flex items-center gap-1.5"
                )}
              >
                <RiHomeLine className="size-4" />
                Home
              </Link>
              <Link
                href="/rooms?city=indore"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "w-full sm:w-auto bg-ballpoint text-[var(--ballpoint-foreground)] hover:bg-ballpoint/90 inline-flex items-center gap-1.5"
                )}
              >
                <RiSearchLine className="size-4" />
                Browse rooms
              </Link>
            </div>
          </div>
        </Handbill>
      </div>
    </div>
  );
}
