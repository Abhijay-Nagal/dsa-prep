import type { Metadata } from "next";
import { TOPICS, TOPIC_MAP } from "@/lib/data/topics";
import View from "./view";

export function generateStaticParams() {
  return TOPICS.map((t) => ({ topic: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const { topic } = await params;
  const t = TOPIC_MAP[topic];
  return t ? { title: t.name, description: t.blurb } : { title: "Topic" };
}

export default function Page() {
  return <View />;
}
