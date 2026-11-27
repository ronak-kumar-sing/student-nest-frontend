import type { Metadata } from "next";
import { HomeHero } from "@/components/home/home-hero";

export const metadata: Metadata = {
  title: "Student Nest: rooms near your college, straight from the owner",
  description:
    "Find rooms and PGs near your college in Indore, Bhopal and Pune, listed directly by their owners. No brokers.",
};

export default function HomePage() {
  return <HomeHero />;
}
