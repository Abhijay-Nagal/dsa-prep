"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useMemo } from "react";
import { Icon } from "@/components/ui/Icon";
import { Chip, Ring, SectionTitle } from "@/components/ui/bits";
import { ProblemList } from "@/components/problems/ProblemList";
import { PageNav, useOrigin } from "@/components/ui/PageNav";
import { PATTERNS, PATTERN_MAP } from "@/lib/data/patterns";
import { TOPIC_MAP } from "@/lib/data/topics";
import { byPattern } from "@/lib/data/problems";
import { ALGO_MAP } from "@/lib/algo/registry";
import { getMastery } from "@/lib/engine/recommender";
import { useSnapshot } from "@/hooks/useLearner";
import { masteryColor, masteryLabel } from "@/lib/engine/mastery";

export default function PatternPage() {
  const params = useParams<{ id: string }>();
  const pattern = PATTERN_MAP[params.id];
  useOrigin(`/learn/pattern/${params.id}`, pattern?.name ?? "Learn");
  const snap = useSnapshot();
  const problems = useMemo(() => (pattern ? byPattern(pattern.id) : []), [pattern]);

  if (!pattern) return notFound();

  const topic = TOPIC_MAP[pattern.topic];
  const mastery = getMastery(snap, pattern.id);
  const viz = pattern.viz ? ALGO_MAP[pattern.viz] : undefined;
  const siblings = PATTERNS.filter((p) => p.topic === pattern.topic && p.id !== pattern.id);

  return (
    <div className="mx-auto max-w-[1180px] space-y-7">
      <PageNav
        fallback="/learn"
        crumbs={[
          { label: "Learn", href: "/learn" },
          { label: topic?.name ?? pattern.topic, href: `/learn/${pattern.topic}` },
          { label: pattern.name },
        ]}
      />

      <div className="panel overflow-hidden">
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, var(--accent), transparent)` }} />
        <div className="flex flex-wrap items-center gap-5 p-5">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
            <Icon name="Wand2" size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-extrabold tracking-tight">{pattern.name}</h1>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-dim">{pattern.idea}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Chip color={topic?.color} icon={topic?.icon}>
                {topic?.name}
              </Chip>
              <Chip icon="Clock">{pattern.complexity}</Chip>
              <Chip color={masteryColor(mastery.p)}>{masteryLabel(mastery.p)}</Chip>
              <Chip icon="ListOrdered">{problems.length} problems</Chip>
            </div>
          </div>
          <Ring value={mastery.p} size={84} stroke={7} color={masteryColor(mastery.p)}>
            <div className="text-center leading-none">
              <div className="text-base font-extrabold">{Math.round(mastery.p * 100)}</div>
              <div className="text-[8px] uppercase tracking-wider text-faint">mastery</div>
            </div>
          </Ring>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="panel p-5">
          <SectionTitle icon="Binoculars" title="Trigger phrases" sub="If a problem statement sounds like one of these, try this pattern first." />
          <div className="space-y-2">
            {pattern.triggers.map((t) => (
              <div key={t} className="flex items-start gap-2.5 rounded-xl border border-line-soft bg-panel-2/50 px-3 py-2">
                <Icon name="Search" size={13} className="mt-0.5 shrink-0 text-accent-3" />
                <span className="text-[12.5px] italic leading-snug">{t}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-5">
          <SectionTitle icon="Code2" title="The template" sub="Get this into muscle memory, then adapt the condition per problem." />
          <pre className="overflow-x-auto rounded-xl border border-line-soft bg-panel-2 p-3.5 font-mono text-[11.5px] leading-relaxed">
            {pattern.template}
          </pre>
          {viz && (
            <Link href={`/visualize/${viz.slug}`} className="btn btn-primary mt-3 !py-1.5 !text-xs">
              <Icon name="Play" size={12} /> Watch {viz.name}
            </Link>
          )}
        </div>
      </div>

      <div className="panel p-5">
        <SectionTitle icon="Lightbulb" title="If you are stuck" sub="The generic hint ladder for this pattern, in order." />
        <ol className="space-y-2.5">
          {pattern.hints.map((h, i) => (
            <li key={h} className="flex gap-3">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold/15 text-[10px] font-bold text-gold">
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed">{h}</span>
            </li>
          ))}
        </ol>
      </div>

      <section>
        <SectionTitle title="Drill it" sub="Every problem in the bank that uses this pattern." />
        <ProblemList problems={problems} />
      </section>

      {siblings.length > 0 && (
        <section>
          <SectionTitle title={`Other patterns in ${topic?.name}`} />
          <div className="flex flex-wrap gap-2">
            {siblings.map((p) => (
              <Link key={p.id} href={`/learn/pattern/${p.id}`} className="panel panel-hover px-3 py-2 text-xs font-medium">
                {p.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
