import type { Metadata } from "next";
import { RoomDetail } from "@/components/rooms/room-detail";

export const metadata: Metadata = {
  title: "Room details",
  description: "View room details, rent, amenities and apply directly to the verified owner.",
};

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RoomDetail id={id} />;
}
