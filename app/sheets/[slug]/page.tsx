import type { Metadata } from "next";
import { SHEETS, SHEET_MAP } from "@/lib/data/sheets";
import View from "./view";

export function generateStaticParams() {
  return SHEETS.map((s) => ({ slug: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = SHEET_MAP[slug];
  return s ? { title: s.name, description: s.blurb } : { title: "Sheet" };
}

export default function Page() {
  return <View />;
}
