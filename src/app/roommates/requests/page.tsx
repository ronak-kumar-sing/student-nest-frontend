import { Suspense } from "react";
import type { Metadata } from "next";
import { RoommateRequests } from "@/components/roommates/roommate-requests";
import { LoadingState } from "@/components/states/loading-state";

export const metadata: Metadata = {
  title: "Roommate requests",
  description: "Manage your incoming and outgoing roommate requests.",
};

export default function RoommateRequestsRoute() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <Suspense
        fallback={<LoadingState message="Loading roommate requests..." />}
      >
        <RoommateRequests />
      </Suspense>
    </div>
  );
}
