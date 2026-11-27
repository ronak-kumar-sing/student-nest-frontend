import { LoadingState } from "@/components/states/loading-state";

export default function RootLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <LoadingState message="Loading Student Nest..." />
    </div>
  );
}
