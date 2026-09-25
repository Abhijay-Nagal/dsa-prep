"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { Chip, DiffBadge, SectionTitle } from "@/components/ui/bits";
import { ALGOS } from "@/lib/algo/registry";
import { TOPIC_MAP } from "@/lib/data/topics";
import { useStore } from "@/lib/store/useStore";
import { useHydrated } from "@/components/layout/Shell";

export default function VisualizeIndex() {
  const [q, setQ] = useState("");
  const hydrated = useHydrated();
  const watched = useStore((s) => s.vizWatched);

  const groups = useMemo(() => {
    const filtered = ALGOS.filter(
      (a) =>
        !q ||
        a.name.toLowerCase().includes(q.toLowerCase()) ||
        a.tags.some((t) => t.toLowerCase().includes(q.toLowerCase())) ||
        a.blurb.toLowerCase().includes(q.toLowerCase()),
    );
    const m = new Map<string, typeof ALGOS>();
    for (const a of filtered) {
      if (!m.has(a.topic)) m.set(a.topic, []);
      m.get(a.topic)!.push(a);
    }
    return [...m.entries()].sort((a, b) => (TOPIC_MAP[a[0]]?.order ?? 99) - (TOPIC_MAP[b[0]]?.order ?? 99));
  }, [q]);

  return (
    <div className="mx-auto max-w-[1180px] space-y-7">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-[28px]">
          Watch the <span className="grad-text">mechanism</span>
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-dim">
          {ALGOS.length} visualisers. Every step is narrated, the pseudocode line being executed is highlighted, counters
          update live, and you can edit the input and scrub backwards through the whole run.
        </p>
      </div>

      <div className="panel flex flex-wrap items-center gap-3 p-3">
        <div className="relative min-w-[200px] flex-1">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, tag or idea"
            className="input !pl-9"
          />
        </div>
        <span className="font-mono text-[11px] text-faint">
          {hydrated ? watched.length : 0} of {ALGOS.length} watched
        </span>
      </div>

      {groups.map(([tid, list]) => {
        const topic = TOPIC_MAP[tid];
        return (
          <section key={tid}>
            <SectionTitle
              icon={topic?.icon}
              title={topic?.name ?? tid}
              sub={topic?.blurb}
              right={
                <Link href={`/learn/${tid}`} className="btn !py-1.5 !text-xs">
                  Learn the topic <Icon name="ArrowRight" size={12} />
                </Link>
              }
            />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((a, i) => {
                const seen = hydrated && watched.includes(a.slug);
                return (
                  <motion.div
                    key={a.slug}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(0.25, i * 0.04) }}
                  >
                    <Link
                      href={`/visualize/${a.slug}`}
                      className="panel panel-hover flex h-full flex-col gap-2.5 p-4"
                      style={{ borderTop: `2px solid ${topic?.color ?? "var(--accent)"}` }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-bold leading-snug">{a.name}</span>
                        <div className="flex shrink-0 items-center gap-1.5">
                          {seen && <Icon name="Check" size={12} className="text-easy" />}
                          <DiffBadge d={a.difficulty} small />
                        </div>
                      </div>
                      <p className="text-[11.5px] leading-snug text-dim">{a.blurb}</p>
                      <div className="flex flex-wrap gap-1">
                        {a.tags.slice(0, 3).map((t) => (
                          <Chip key={t} className="!text-[9px]">
                            {t}
                          </Chip>
                        ))}
                      </div>
                      <div className="mt-auto flex items-center gap-3 border-t border-line-soft pt-2 text-[10px] text-faint">
                        <span className="flex items-center gap-1">
                          <Icon name="Clock" size={10} />
                          <span className="font-mono">{a.complexity.time}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="Layers" size={10} />
                          <span className="font-mono">{a.complexity.space}</span>
                        </span>
                        <Icon name="Play" size={12} className="ml-auto text-accent" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </section>
        );
      })}

      {groups.length === 0 && (
        <div className="panel p-10 text-center text-sm text-faint">No visualiser matches that search.</div>
      )}
    </div>
  );
}
