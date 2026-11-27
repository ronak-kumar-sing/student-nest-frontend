import { Suspense } from "react";
import type { Metadata } from "next";
import { SavedRoomsList } from "@/components/saved/saved-rooms-list";
import { LoadingState } from "@/components/states/loading-state";

export const metadata: Metadata = {
  title: "Saved rooms",
  description: "View and manage your saved rooms on Student Nest.",
};

export default function SavedPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <Suspense fallback={<LoadingState message="Loading saved rooms..." />}>
        <SavedRoomsList />
      </Suspense>
    </div>
  );
}
