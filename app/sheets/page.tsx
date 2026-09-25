"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { Bar, Chip, SectionTitle, cx } from "@/components/ui/bits";
import { SHEETS } from "@/lib/data/sheets";
import { PROBLEMS } from "@/lib/data/problems";
import { useSheetStats } from "@/hooks/useLearner";
import { useStore } from "@/lib/store/useStore";
import { useHydrated } from "@/components/layout/Shell";

export default function SheetsPage() {
  const stats = useSheetStats();
  const hydrated = useHydrated();
  const activeSheet = useStore((s) => s.settings.activeSheet);
  const setSetting = useStore((s) => s.setSetting);

  return (
    <div className="mx-auto max-w-[1100px] space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-[28px]">
          Phases, <span className="grad-text">strictly nested</span>
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-dim">
          Every problem in Blind 75 is also in Top 150, which sits inside SDE 250, inside DSA 450, inside the Vault.
          Solve something once and it stays solved in every larger phase, marked as carried over.
        </p>
      </div>

      {/* nesting diagram */}
      <div className="panel overflow-hidden p-5">
        <div className="relative grid place-items-center">
          <svg viewBox="0 0 420 200" className="h-[200px] w-full max-w-xl">
            {SHEETS.slice()
              .reverse()
              .map((s, i) => {
                const inset = i * 26;
                const stat = stats.find((x) => x.sheet.id === s.id)!;
                return (
                  <g key={s.id}>
                    <motion.rect
                      x={10 + inset}
                      y={10 + inset * 0.42}
                      width={400 - inset * 2}
                      height={180 - inset * 0.84}
                      rx={16}
                      fill={`${s.color}10`}
                      stroke={s.color}
                      strokeWidth={s.id === activeSheet ? 2 : 1}
                      strokeDasharray={s.id === activeSheet ? undefined : "4 4"}
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.07 }}
                    />
                    <text
                      x={18 + inset}
                      y={26 + inset * 0.42}
                      fontSize={9}
                      fontWeight={700}
                      fill={s.color}
                    >
                      {s.name} · {stat.total}
                    </text>
                  </g>
                );
              })}
          </svg>
        </div>
        <p className="mt-2 text-center text-[11px] text-faint">
          {PROBLEMS.length} distinct problems across five containers
        </p>
      </div>

      <section>
        <SectionTitle icon="ListChecks" title="Choose your phase" sub="The active phase drives the daily planner and the recommendation engine." />
        <div className="grid gap-4 md:grid-cols-2">
          {stats.map(({ sheet, solved, total, pct }, i) => {
            const prev = SHEETS[i - 1];
            const prevStat = prev ? stats.find((s) => s.sheet.id === prev.id) : undefined;
            const carried = prevStat?.solved ?? 0;
            const newHere = total - (prevStat?.total ?? 0);
            const isActive = sheet.id === activeSheet;
            const perWeek = Math.ceil(total / Math.max(1, sheet.weeks));
            return (
              <motion.div
                key={sheet.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cx("panel panel-hover overflow-hidden", isActive && "ring-1")}
                style={isActive ? { boxShadow: `0 0 0 1px ${sheet.color}, var(--shadow-glow)` } : undefined}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="grid h-9 w-9 place-items-center rounded-xl text-sm font-extrabold"
                          style={{ background: `${sheet.color}1f`, color: sheet.color }}
                        >
                          {sheet.short}
                        </span>
                        <div>
                          <div className="text-base font-bold">{sheet.name}</div>
                          <div className="text-[11px] text-faint">
                            {total} problems · {sheet.weeks} weeks at {sheet.hoursPerDay}h/day
                          </div>
                        </div>
                      </div>
                    </div>
                    {isActive && <Chip color={sheet.color} icon="Check">active</Chip>}
                  </div>

                  <p className="mt-3 text-sm leading-snug text-dim">{sheet.blurb}</p>

                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between text-[11px]">
                      <span className="text-faint">{Math.round(pct * 100)}% complete</span>
                      <span className="font-mono">
                        {solved} / {total}
                      </span>
                    </div>
                    <Bar value={pct} color={sheet.color} height={7} />
                  </div>

                  {prev && hydrated && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg border border-line-soft bg-panel-2/60 px-2.5 py-2 text-[11px]">
                      <Icon name="CheckCheck" size={13} className="shrink-0 text-easy" />
                      <span className="text-dim">
                        <b className="text-easy">{carried}</b> already done from {prev.name}, so only{" "}
                        <b>{Math.max(0, newHere - (solved - carried))}</b> of the {newHere} new ones remain.
                      </span>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Link href={`/sheets/${sheet.id}`} className="btn btn-primary !py-1.5 !text-xs">
                      Open sheet <Icon name="ArrowRight" size={12} />
                    </Link>
                    {!isActive && (
                      <button
                        className="btn !py-1.5 !text-xs"
                        onClick={() => {
                          setSetting("activeSheet", sheet.id);
                          setSetting("activeTier", sheet.tier);
                        }}
                      >
                        <Icon name="Target" size={12} /> Make active
                      </button>
                    )}
                    <span className="ml-auto text-[10px] text-faint">{perWeek} per week to finish on time</span>
                  </div>
                </div>
                <div className="border-t border-line-soft bg-panel-2/30 px-4 py-2 text-[10px] leading-snug text-faint">
                  {sheet.origin}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section>
        <SectionTitle icon="Info" title="How the phases work" />
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: "Layers3",
              title: "Nested, not parallel",
              body: "Each phase contains the previous one whole. Moving up never resets anything or asks you to redo work.",
            },
            {
              icon: "CheckCheck",
              title: "Carried over is labelled",
              body: "In a larger phase, problems you cleared earlier show a badge naming the phase where you solved them.",
            },
            {
              icon: "Wand2",
              title: "The planner respects your phase",
              body: "Problems inside your active phase get a large scoring boost, so the daily plan stays on the sheet you chose.",
            },
          ].map((c) => (
            <div key={c.title} className="panel p-4">
              <Icon name={c.icon} size={16} className="text-accent" />
              <div className="mt-2 text-sm font-bold">{c.title}</div>
              <p className="mt-1 text-xs leading-relaxed text-dim">{c.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
