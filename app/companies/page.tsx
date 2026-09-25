"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { Bar, Chip, SectionTitle, Segmented, cx } from "@/components/ui/bits";
import { BUCKET_LABEL, BUCKET_ORDER, COMPANIES } from "@/lib/data/companies";
import { byCompany } from "@/lib/data/problems";
import { companySheet } from "@/lib/engine/readiness";
import { useSnapshot } from "@/hooks/useLearner";
import { companyReadiness } from "@/lib/engine/readiness";
import { useStore } from "@/lib/store/useStore";
import { useHydrated } from "@/components/layout/Shell";

export default function CompaniesPage() {
  const [q, setQ] = useState("");
  const [bucket, setBucket] = useState<"all" | (typeof BUCKET_ORDER)[number]>("all");
  const snap = useSnapshot();
  const hydrated = useHydrated();
  const target = useStore((s) => s.settings.targetCompany);
  const setSetting = useStore((s) => s.setSetting);

  const rows = useMemo(
    () =>
      COMPANIES.map((c) => {
        const list = companySheet(c);
        const reported = byCompany(c.id).length;
        const solved = hydrated ? list.filter((p) => snap.progress[p.id]?.status === "solved").length : 0;
        return {
          company: c,
          reported,
          total: list.length,
          solved,
          score: hydrated ? companyReadiness(snap, c).score : 0,
        };
      }),
    [snap, hydrated],
  );

  const filtered = rows.filter(
    (r) =>
      (bucket === "all" || r.company.bucket === bucket) &&
      (!q || r.company.name.toLowerCase().includes(q.toLowerCase())),
  );

  const grouped = BUCKET_ORDER.map((b) => ({
    bucket: b,
    items: filtered.filter((r) => r.company.bucket === b),
  })).filter((g) => g.items.length);

  return (
    <div className="mx-auto max-w-[1180px] space-y-7">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-[28px]">
          Prepare for <span className="grad-text">one company</span> at a time
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-dim">
          Each company gets its own ordered list, its real round structure, what their bar actually is, and a readiness
          score that weighs the topics they lean on. Pick a target and the dashboard reorders around it.
        </p>
      </div>

      <div className="panel flex flex-wrap items-center gap-3 p-3">
        <div className="relative min-w-[180px] flex-1">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a company" className="input !pl-9" />
        </div>
        <Segmented
          size="sm"
          value={bucket}
          onChange={setBucket}
          options={[
            { value: "all", label: "All" },
            { value: "faang", label: "Big Tech" },
            { value: "product", label: "Product" },
            { value: "fintech", label: "Finance" },
            { value: "service", label: "Service" },
          ]}
        />
      </div>

      {target && (
        <div className="panel flex flex-wrap items-center gap-3 p-4">
          <Icon name="Target" size={16} className="text-accent" />
          <span className="text-sm">
            Current target is <b>{COMPANIES.find((c) => c.id === target)?.name}</b>. The planner boosts their tagged
            problems and their focus topics.
          </span>
          <button className="btn btn-ghost ml-auto !py-1 !text-[11px]" onClick={() => setSetting("targetCompany", undefined)}>
            <Icon name="X" size={11} /> Clear target
          </button>
        </div>
      )}

      {grouped.map((group) => (
        <section key={group.bucket}>
          <SectionTitle title={BUCKET_LABEL[group.bucket]} sub={`${group.items.length} companies`} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map(({ company: c, total, reported, solved, score }, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(0.3, i * 0.03) }}
              >
                <Link
                  href={`/companies/${c.id}`}
                  className={cx("panel panel-hover flex h-full flex-col gap-3 p-4", target === c.id && "ring-1")}
                  style={target === c.id ? { boxShadow: `0 0 0 1px ${c.color}, var(--shadow-glow)` } : undefined}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-extrabold"
                      style={{ background: `${c.color}22`, color: c.color }}
                    >
                      {c.short}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold">{c.name}</div>
                      <div className="text-[11px] text-faint">
                        {total} problems{reported > 0 ? `, ${reported} reported` : ""} · {c.dsaRounds} DSA round
                        {c.dsaRounds === 1 ? "" : "s"}
                      </div>
                    </div>
                    {hydrated && score > 0 && (
                      <span className="font-mono text-xs font-bold" style={{ color: c.color }}>
                        {score}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-[10px] text-faint">
                      <span>readiness</span>
                      <span className="font-mono">
                        {solved}/{total} solved
                      </span>
                    </div>
                    <Bar value={score / 100} color={c.color} height={5} />
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {Object.entries(c.focus)
                      .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
                      .slice(0, 3)
                      .map(([t]) => (
                        <Chip key={t} className="!text-[9px]">
                          {t.replace(/-/g, " ")}
                        </Chip>
                      ))}
                  </div>

                  <div className="mt-auto flex items-center gap-2 text-[10px] text-faint">
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-easy" /> {c.mix.easy}%
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-medium" /> {c.mix.medium}%
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-hard" /> {c.mix.hard}%
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
