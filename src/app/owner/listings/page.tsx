import { Suspense } from "react";
import type { Metadata } from "next";
import { OwnerListings } from "@/components/owner/owner-listings";
import { LoadingState } from "@/components/states/loading-state";

export const metadata: Metadata = {
  title: "Your listings",
  description: "Manage your property listings on Student Nest.",
};

export default function OwnerListingsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      <Suspense fallback={<LoadingState message="Loading your listings..." />}>
        <OwnerListings />
      </Suspense>
    </div>
  );
}
