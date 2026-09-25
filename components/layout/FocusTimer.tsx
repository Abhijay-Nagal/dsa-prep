"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/components/ui/bits";
import { useHydrated } from "@/hooks/useNow";
import { useStore } from "@/lib/store/useStore";
import { buzz, play } from "@/lib/sound";

/**
 * Pomodoro dock. Lives in the root layout so the clock survives navigation,
 * which is the whole point: you can browse problems while a session runs.
 *
 * Remaining time is held in state and driven by an interval that reads the
 * wall clock from a ref. That keeps the countdown accurate across tab throttling
 * without ever reading `Date.now()` during render.
 */

const MODES = [
  { id: "focus25", label: "Focus", minutes: 25, kind: "focus", color: "var(--accent)", icon: "Timer" },
  { id: "focus50", label: "Deep", minutes: 50, kind: "focus", color: "var(--accent-2)", icon: "Hourglass" },
  { id: "break5", label: "Break", minutes: 5, kind: "break", color: "var(--easy)", icon: "Sunrise" },
  { id: "break15", label: "Long break", minutes: 15, kind: "break", color: "var(--accent-3)", icon: "Moon" },
] as const;

type ModeId = (typeof MODES)[number]["id"];

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function FocusTimer() {
  const hydrated = useHydrated();
  const onboarded = useStore((s) => s.onboarded);
  const sessions = useStore((s) => s.focusSessions);
  const focusMinutes = useStore((s) => s.focusMinutes);
  const logFocus = useStore((s) => s.logFocus);
  const pushToast = useStore((s) => s.pushToast);
  const sound = useStore((s) => s.settings.sound);

  const [open, setOpen] = useState(false);
  const [modeId, setModeId] = useState<ModeId>("focus25");
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const endsAt = useRef(0);

  const mode = MODES.find((m) => m.id === modeId)!;

  const pick = useCallback((id: ModeId) => {
    const m = MODES.find((x) => x.id === id)!;
    setModeId(id);
    setRemaining(m.minutes * 60);
    setRunning(false);
    endsAt.current = 0;
  }, []);

  const start = useCallback(() => {
    endsAt.current = Date.now() + remaining * 1000;
    setRunning(true);
    play("start", sound);
  }, [remaining, sound]);

  const pause = useCallback(() => {
    setRunning(false);
    play("click", sound);
  }, [sound]);

  const reset = useCallback(() => {
    setRemaining(mode.minutes * 60);
    setRunning(false);
    endsAt.current = 0;
  }, [mode.minutes]);

  /* The ticker. setState happens inside the interval callback, never in the
     effect body, so this does not trip the set-state-in-effect rule. */
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const left = Math.max(0, Math.round((endsAt.current - Date.now()) / 1000));
      setRemaining(left);
      if (left > 0) return;

      window.clearInterval(id);
      setRunning(false);
      if (mode.kind === "focus") {
        logFocus(mode.minutes);
        play("done", sound);
        buzz([24, 60, 24]);
        pushToast({
          kind: "streak",
          title: `${mode.minutes} minutes logged`,
          body: "Session counted towards today. Take the break.",
          icon: "Timer",
        });
        // Arm a break but do not start it: forced breaks are annoying.
        setModeId(mode.minutes >= 50 ? "break15" : "break5");
        setRemaining((mode.minutes >= 50 ? 15 : 5) * 60);
      } else {
        play("start", sound);
        pushToast({ kind: "info", title: "Break over", body: "Back to it.", icon: "Rocket" });
        setModeId("focus25");
        setRemaining(25 * 60);
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [running, mode.kind, mode.minutes, logFocus, pushToast, sound]);

  /* Opened by the ? shortcut sheet, the command palette and the header button. */
  useEffect(() => {
    const toggle = () => setOpen((o) => !o);
    window.addEventListener("toggle-focus", toggle);
    return () => window.removeEventListener("toggle-focus", toggle);
  }, []);

  if (!hydrated || !onboarded) return null;

  const total = mode.minutes * 60;
  const pct = total > 0 ? 1 - remaining / total : 0;
  const r = 26;
  const circ = 2 * Math.PI * r;

  return (
    <div className="fixed bottom-20 left-4 z-[70] lg:bottom-5">
      <AnimatePresence mode="popLayout">
        {open ? (
          <motion.div
            key="panel"
            layoutId="focus-dock"
            className="panel w-[272px] overflow-hidden p-3.5 shadow-[var(--shadow-lg)]"
            style={{ background: "var(--bg-elev)" }}
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
          >
            <div className="mb-3 flex items-center gap-2">
              <Icon name="Timer" size={14} style={{ color: mode.color }} />
              <span className="text-xs font-bold">Focus session</span>
              <button onClick={() => setOpen(false)} className="btn btn-ghost ml-auto !px-1.5 !py-1" aria-label="Close timer">
                <Icon name="Minimize2" size={13} />
              </button>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="relative shrink-0">
                <svg width={64} height={64} className="-rotate-90">
                  <circle cx={32} cy={32} r={r} fill="none" stroke="var(--panel-2)" strokeWidth={5} />
                  <motion.circle
                    cx={32}
                    cy={32}
                    r={r}
                    fill="none"
                    stroke={mode.color}
                    strokeWidth={5}
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    animate={{ strokeDashoffset: circ * (1 - pct) }}
                    transition={{ duration: 0.3, ease: "linear" }}
                  />
                </svg>
                <div className="absolute inset-0 grid place-items-center">
                  <span className="font-mono text-sm font-bold tabular-nums">{fmt(remaining)}</span>
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex gap-1.5">
                  <button onClick={running ? pause : start} className="btn btn-primary flex-1 !py-1.5 !text-[11px]">
                    <Icon name={running ? "Pause" : "Play"} size={12} />
                    {running ? "Pause" : remaining < total ? "Resume" : "Start"}
                  </button>
                  <button onClick={reset} className="btn !px-2 !py-1.5" aria-label="Reset">
                    <Icon name="RotateCcw" size={12} />
                  </button>
                </div>
                <div className="text-[10px] leading-tight text-faint">
                  {sessions} session{sessions === 1 ? "" : "s"} · {Math.round(focusMinutes / 60)}h {focusMinutes % 60}m
                  logged
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-1">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => pick(m.id)}
                  title={`${m.label} · ${m.minutes} min`}
                  className={cx(
                    "rounded-lg border px-1 py-1.5 text-[10px] font-semibold transition-colors",
                    m.id === modeId ? "border-transparent text-white" : "border-line bg-panel-2 text-dim hover:text-text",
                  )}
                  style={m.id === modeId ? { background: m.color } : undefined}
                >
                  {m.minutes}m
                </button>
              ))}
            </div>

            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="mt-2.5 flex items-center gap-1.5 text-[10px] text-faint hover:text-accent"
            >
              <Icon name="Target" size={10} /> Open today&apos;s plan
            </Link>
          </motion.div>
        ) : (
          <motion.button
            key="pill"
            layoutId="focus-dock"
            onClick={() => setOpen(true)}
            className="panel flex items-center gap-2 py-2 pl-2 pr-3 shadow-[var(--shadow-lg)]"
            style={{ background: "var(--bg-elev)", borderColor: running ? mode.color : undefined }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            whileHover={{ y: -2 }}
            aria-label="Focus timer"
          >
            <span className="relative grid h-7 w-7 place-items-center">
              <svg width={28} height={28} className="-rotate-90 absolute inset-0">
                <circle cx={14} cy={14} r={11} fill="none" stroke="var(--panel-2)" strokeWidth={3} />
                <circle
                  cx={14}
                  cy={14}
                  r={11}
                  fill="none"
                  stroke={mode.color}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 11}
                  strokeDashoffset={2 * Math.PI * 11 * (1 - pct)}
                />
              </svg>
              <Icon name="Timer" size={12} style={{ color: mode.color }} />
            </span>
            <span className="font-mono text-xs font-bold tabular-nums">{fmt(remaining)}</span>
            {running && (
              <motion.span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: mode.color }}
                animate={{ opacity: [1, 0.25, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
