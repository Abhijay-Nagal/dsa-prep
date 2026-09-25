import type { Metadata } from "next";
import { PATTERNS, PATTERN_MAP } from "@/lib/data/patterns";
import View from "./view";

export function generateStaticParams() {
  return PATTERNS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = PATTERN_MAP[id];
  return p ? { title: p.name, description: p.idea } : { title: "Pattern" };
}

export default function Page() {
  return <View />;
}
