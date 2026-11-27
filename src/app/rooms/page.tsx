import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchResults } from "@/components/rooms/search-results";
import { LoadingState } from "@/components/states/loading-state";

export const metadata: Metadata = {
  title: "Browse rooms",
  description:
    "Find student rooms, flats, and PGs near college gates in Indore, Bhopal and Pune directly from owners.",
};

export default function RoomsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <LoadingState message="Loading room search" rows={5} />
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
