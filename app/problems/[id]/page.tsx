import type { Metadata } from "next";
import { PROBLEMS, PROBLEM_MAP } from "@/lib/data/problems";
import { topicName } from "@/lib/data/topics";
import View from "./view";

export function generateStaticParams() {
  return PROBLEMS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = PROBLEM_MAP[id];
  if (!p) return { title: "Problem" };
  return {
    title: p.title,
    description: `${p.difficulty} ${topicName(p.topic)} problem. ${p.approach ?? "Hints, approach, complexity and where to practise it."}`,
  };
}

export default function Page() {
  return <View />;
}
