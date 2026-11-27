import { LoadingState } from "@/components/states/loading-state";

export default function RoomDetailLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <LoadingState message="Loading room details..." />
    </div>
  );
}
