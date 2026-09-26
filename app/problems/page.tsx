"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Bar, SectionTitle, Stat } from "@/components/ui/bits";
import { ProblemList } from "@/components/problems/ProblemList";
import { PROBLEMS, mustDo } from "@/lib/data/problems";
import { useTotals } from "@/hooks/useLearner";
import { TOPICS } from "@/lib/data/topics";

import { useOrigin } from "@/components/ui/PageNav";

export default function ProblemsPage() {
  useOrigin("/problems", "Problem bank");
  const totals = useTotals();
  const critical = useMemo(() => mustDo(), []);

  return (
    <div className="mx-auto max-w-[1180px] space-y-7">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-[28px]">
          The <span className="grad-text">problem bank</span>
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-dim">
          {PROBLEMS.length} curated problems across {TOPICS.length} topics, each tagged with its pattern, the companies
          that ask it, an interview frequency and where to find it on other platforms.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total" value={PROBLEMS.length} sub={`${critical.length} flagged must-do`} icon="ListOrdered" />
        <Stat
          label="Easy"
          value={`${totals.byDiff.Easy} / ${totals.totals.Easy}`}
          sub={<Bar value={totals.totals.Easy ? totals.byDiff.Easy / totals.totals.Easy : 0} color="var(--easy)" height={4} />}
          icon="Circle"
          color="var(--easy)"
        />
        <Stat
          label="Medium"
          value={`${totals.byDiff.Medium} / ${totals.totals.Medium}`}
          sub={<Bar value={totals.totals.Medium ? totals.byDiff.Medium / totals.totals.Medium : 0} color="var(--medium)" height={4} />}
          icon="CircleDot"
          color="var(--medium)"
        />
        <Stat
          label="Hard"
          value={`${totals.byDiff.Hard} / ${totals.totals.Hard}`}
          sub={<Bar value={totals.totals.Hard ? totals.byDiff.Hard / totals.totals.Hard : 0} color="var(--hard)" height={4} />}
          icon="Mountain"
          color="var(--hard)"
        />
      </div>

      <div className="panel flex flex-wrap items-center gap-3 p-4">
        <Icon name="Star" size={16} className="text-gold" />
        <span className="text-sm">
          <b>{critical.length} problems</b> are flagged as non-negotiable. If you are short on time, filter to must-do
          and work down that list.
        </span>
        <Link href="/sheets/blind-75" className="btn ml-auto !py-1.5 !text-xs">
          Start with Blind 75 <Icon name="ArrowRight" size={12} />
        </Link>
      </div>

      <SectionTitle title="Browse and filter" sub="Combine topic, pattern, company, difficulty and status filters." />
      <ProblemList problems={PROBLEMS} />
    </div>
  );
}
