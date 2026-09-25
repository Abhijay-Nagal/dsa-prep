import type { Metadata } from "next";
import { ALGOS, ALGO_MAP } from "@/lib/algo/registry";
import View from "./view";

export function generateStaticParams() {
  return ALGOS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = ALGO_MAP[slug];
  return a ? { title: `${a.name} visualiser`, description: a.blurb } : { title: "Visualiser" };
}

export default function Page() {
  return <View />;
}
