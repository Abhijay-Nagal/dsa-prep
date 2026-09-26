"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { VizPlayer } from "@/components/viz/VizPlayer";
import { PageNav } from "@/components/ui/PageNav";
import { ALGO_MAP, ALGOS, algosForTopic } from "@/lib/algo/registry";
import { TOPIC_MAP } from "@/lib/data/topics";

export default function VisualizeDetail() {
  const params = useParams<{ slug: string }>();
  const algo = ALGO_MAP[params.slug];
  if (!algo) return notFound();

  const siblings = algosForTopic(algo.topic).filter((a) => a.slug !== algo.slug);
  const idx = ALGOS.findIndex((a) => a.slug === algo.slug);
  const next = ALGOS[(idx + 1) % ALGOS.length];

  return (
    <div className="mx-auto max-w-[1180px] space-y-6">
      <PageNav
        fallback="/visualize"
        crumbs={[
          { label: "Visualise", href: "/visualize" },
          { label: TOPIC_MAP[algo.topic]?.name ?? algo.topic, href: `/learn/${algo.topic}` },
          { label: algo.name },
        ]}
      />

      <VizPlayer key={algo.slug} algo={algo} />

      {siblings.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
            <Icon name={TOPIC_MAP[algo.topic]?.icon ?? "PlayCircle"} size={14} style={{ color: TOPIC_MAP[algo.topic]?.color }} />
            More in {TOPIC_MAP[algo.topic]?.name}
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {siblings.map((a) => (
              <Link key={a.slug} href={`/visualize/${a.slug}`} className="panel panel-hover p-3">
                <div className="text-xs font-semibold">{a.name}</div>
                <div className="mt-0.5 font-mono text-[10px] text-faint">{a.complexity.time}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Link href={`/visualize/${next.slug}`} className="panel panel-hover flex items-center justify-between gap-3 p-4">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-faint">Next visualiser</div>
          <div className="text-sm font-bold">{next.name}</div>
        </div>
        <Icon name="ArrowRight" size={16} className="text-accent" />
      </Link>
    </div>
  );
}
