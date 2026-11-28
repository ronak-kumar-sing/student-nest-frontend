import { Suspense } from "react";
import type { Metadata } from "next";
import { ProfileView } from "@/components/profile/profile-view";
import { LoadingState } from "@/components/states/loading-state";

export const metadata: Metadata = {
  title: "Your profile",
  description: "View and edit your profile details, verification status, and account settings.",
};

export default function ProfilePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <Suspense fallback={<LoadingState message="Loading your profile..." />}>
        <ProfileView />
      </Suspense>
    </div>
  );
}
