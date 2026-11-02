import type { Metadata } from "next";
import { SadhanaDashboard } from "@/components/SadhanaDashboard";

export const metadata: Metadata = { title: "Sadhana — Śrī Lalitā Sahasranāma" };
export default function SadhanaPage() {
  return <SadhanaDashboard />;
}
