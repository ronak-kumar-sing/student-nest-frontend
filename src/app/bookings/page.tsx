import { Suspense } from "react";
import type { Metadata } from "next";
import { BookingsList } from "@/components/bookings/bookings-list";
import { LoadingState } from "@/components/states/loading-state";

export const metadata: Metadata = {
  title: "Your bookings",
  description: "View and manage your room applications on Student Nest.",
};

export default function BookingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <Suspense fallback={<LoadingState message="Loading your applications..." />}>
        <BookingsList />
      </Suspense>
    </div>
  );
}
