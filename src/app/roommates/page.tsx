import { Suspense } from "react";
import type { Metadata } from "next";
import { RoommatesPage } from "@/components/roommates/roommates-page";
import { LoadingState } from "@/components/states/loading-state";

export const metadata: Metadata = {
  title: "Roommates",
  description:
    "Find a roommate near your college with a similar budget, move-in date and habits.",
};

export default function RoommatesRoute() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <Suspense fallback={<LoadingState message="Loading roommates..." />}>
        <RoommatesPage />
      </Suspense>
    </div>
  );
}
