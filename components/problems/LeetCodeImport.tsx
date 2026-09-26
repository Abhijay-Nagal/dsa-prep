"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { Bar, cx } from "@/components/ui/bits";
import { useHydrated } from "@/hooks/useNow";
import { useStore } from "@/lib/store/useStore";
import { lcCoverage, parseLcList } from "@/lib/data/lc";
import { LC_SEED } from "@/lib/data/lc-seed";
import { PROBLEMS } from "@/lib/data/problems";

/**
 * Bulk import for a LeetCode solved list. One problem per line; titles, slugs
 * and full URLs all work, and leading numbering is stripped, so whatever shape
 * the list is copied in tends to just work.
 *
 * The preview is computed as you type and nothing is stored until Import is
 * pressed, because "how many of these did it actually recognise" is the only
 * question worth answering before committing 200 rows.
 */

const LC = "#ffa116";

export function LeetCodeImport() {
  const hydrated = useHydrated();
  const lcSolved = useStore((s) => s.lcSolved);
  const importLcList = useStore((s) => s.importLcList);
  const clearLcSolved = useStore((s) => s.clearLcSolved);

  const [text, setText] = useState("");
  const [done, setDone] = useState<{ added: number; matched: number; unmatched: number } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const coverage = useMemo(() => (hydrated ? lcCoverage(lcSolved) : { inBank: 0, total: PROBLEMS.length, keys: 0 }), [lcSolved, hydrated]);

  // Preview only — parseLcList is pure, the store is untouched until Import.
  const preview = useMemo(() => (text.trim() ? parseLcList(text, lcSolved) : null), [text, lcSolved]);

  const run = () => {
    const report = importLcList(text);
    setDone({ added: report.added, matched: report.matched.length, unmatched: report.unmatched.length });
    setText("");
  };

  return (
    <div className="panel overflow-hidden">
      <div className="hairline flex flex-wrap items-center gap-2.5 px-4 py-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ background: `${LC}1f`, color: LC }}>
          <Icon name="BadgeCheck" size={15} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold">LeetCode progress</div>
          <div className="text-[11px] text-faint">
            Problems you have already beaten, so the app stops suggesting them and offers siblings instead.
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-lg font-extrabold" style={{ color: LC }}>
            {coverage.inBank}
          </div>
          <div className="text-[10px] text-faint">of {coverage.total} in the bank</div>
        </div>
      </div>

      <div className="px-4 py-3">
        <Bar value={coverage.total ? coverage.inBank / coverage.total : 0} color={LC} height={6} />
        <p className="mt-2 text-[11px] text-faint">
          {coverage.keys} titles recorded. Titles with no problem here are still kept, so they count and are matched
          automatically if that problem is ever added.
        </p>

        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold">Paste a list, one problem per line</span>
            <button onClick={() => setText(LC_SEED.join("\n"))} className="btn !py-1 !text-[11px]">
              <Icon name="Upload" size={11} /> Load the starter list ({LC_SEED.length})
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setDone(null);
            }}
            rows={7}
            placeholder={"Two Sum\nValid Parentheses\nhttps://leetcode.com/problems/3sum/\n42. Trapping Rain Water"}
            className="input resize-y font-mono !text-xs"
          />

          <AnimatePresence>
            {preview && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-wrap gap-x-4 gap-y-1 rounded-xl border border-line bg-panel-2/40 px-3 py-2 text-[11px]"
              >
                <span>
                  <span className="text-faint">matches a problem here </span>
                  <span className="font-mono font-bold text-easy">{preview.matched.length}</span>
                </span>
                <span>
                  <span className="text-faint">not in the bank </span>
                  <span className="font-mono font-bold text-medium">{preview.unmatched.length}</span>
                </span>
                <span>
                  <span className="text-faint">new to you </span>
                  <span className="font-mono font-bold text-accent">{preview.added}</span>
                </span>
                {preview.skipped.length > 0 && (
                  <span>
                    <span className="text-faint">lines ignored </span>
                    <span className="font-mono font-bold">{preview.skipped.length}</span>
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap gap-2">
            <button onClick={run} disabled={!preview || preview.keys.length === 0} className="btn btn-primary !py-1.5 !text-xs">
              <Icon name="Check" size={12} /> Import
            </button>
            {text && (
              <button onClick={() => setText("")} className="btn !py-1.5 !text-xs">
                Clear box
              </button>
            )}
            {coverage.keys > 0 && (
              <button
                onClick={() => (confirmClear ? (clearLcSolved(), setConfirmClear(false)) : setConfirmClear(true))}
                className={cx("btn !py-1.5 !text-xs", confirmClear && "!border-hard !text-hard")}
              >
                <Icon name="Trash2" size={12} />
                {confirmClear ? "Tap again to erase all marks" : "Clear LeetCode marks"}
              </button>
            )}
          </div>

          <AnimatePresence>
            {done && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[11px] text-easy"
              >
                Imported. {done.added} new, {done.matched} matched a problem here, {done.unmatched} recorded by title
                only.
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <details className="mt-3">
          <summary className="cursor-pointer text-[11px] font-semibold text-dim hover:text-text">
            Where do I get my list from LeetCode?
          </summary>
          <div className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-faint">
            <p>
              Your LeetCode profile page lists your solved problems, and the progress page has a solved tab you can page
              through. Copy the titles and paste them here — the exact menu names move around, so go by what is on the
              page rather than a fixed path.
            </p>
            <p>
              Anything copyable works: titles, problem URLs, or numbered lines like &quot;1. Two Sum&quot;. Import is
              additive, so pasting an updated list later only adds what is new.
            </p>
            <p>
              Faster for one problem: open it here and press <strong>Mark done on LeetCode</strong> on the problem page.
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}
