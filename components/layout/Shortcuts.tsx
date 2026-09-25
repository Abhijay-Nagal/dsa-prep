"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/components/ui/bits";
import { useStore } from "@/lib/store/useStore";
import { play } from "@/lib/sound";

/**
 * Global keyboard layer. Two-key "g then x" jumps follow the convention used by
 * GitHub and Linear, so the muscle memory transfers. Single letters are reserved
 * for things that are safe to trigger by accident.
 */

const JUMPS: { key: string; href: string; label: string }[] = [
  { key: "d", href: "/", label: "Dashboard" },
  { key: "s", href: "/sheets", label: "Sheets" },
  { key: "c", href: "/companies", label: "Companies" },
  { key: "p", href: "/problems", label: "Problem bank" },
  { key: "v", href: "/visualize", label: "Visualisers" },
  { key: "l", href: "/learn", label: "Learn" },
  { key: "m", href: "/roadmap", label: "Roadmap" },
  { key: "r", href: "/revise", label: "Revise" },
  { key: "a", href: "/arena", label: "Arena" },
  { key: "n", href: "/notebook", label: "Notebook" },
  { key: "y", href: "/stats", label: "Analytics" },
  { key: "u", href: "/profile", label: "Profile" },
];

const ACTIONS: { keys: string; label: string }[] = [
  { keys: "Ctrl K", label: "Search everything" },
  { keys: "/", label: "Search everything" },
  { keys: "f", label: "Focus timer" },
  { keys: "t", label: "Light or dark theme" },
  { keys: "?", label: "This cheat sheet" },
  { keys: "Esc", label: "Close anything open" },
];

const VIZ_KEYS: { keys: string; label: string }[] = [
  { keys: "Space", label: "Play or pause the animation" },
  { keys: "← →", label: "Step one frame" },
  { keys: "R", label: "Replay from the first frame" },
];

/** True when the keystroke belongs to whatever the user is typing into. */
function isTyping(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

export function Shortcuts() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const theme = useStore((s) => s.settings.theme);
  const setSetting = useStore((s) => s.setSetting);
  const sound = useStore((s) => s.settings.sound);
  const armed = useRef<number | null>(null);

  useEffect(() => {
    const disarm = () => {
      if (armed.current) window.clearTimeout(armed.current);
      armed.current = null;
      setPending(false);
    };

    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      if (e.key === "Escape") {
        disarm();
        setOpen(false);
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toLowerCase();

      // second half of a "g then x" jump
      if (armed.current !== null) {
        const jump = JUMPS.find((j) => j.key === k);
        disarm();
        if (jump) {
          e.preventDefault();
          play("click", sound);
          router.push(jump.href);
        }
        return;
      }

      if (k === "g") {
        e.preventDefault();
        setPending(true);
        armed.current = window.setTimeout(disarm, 1600);
        return;
      }
      if (e.key === "?") {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (k === "/") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("open-palette"));
        return;
      }
      if (k === "f") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("toggle-focus"));
        return;
      }
      if (k === "t") {
        e.preventDefault();
        setSetting("theme", theme === "dark" ? "light" : "dark");
      }
    };

    const show = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-shortcuts", show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-shortcuts", show);
      if (armed.current) window.clearTimeout(armed.current);
    };
  }, [router, setSetting, theme, sound]);

  return (
    <>
      {/* "g" was pressed: show what can follow it */}
      <AnimatePresence>
        {pending && (
          <motion.div
            className="pointer-events-none fixed bottom-24 left-1/2 z-[100] -translate-x-1/2 lg:bottom-8"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
          >
            <div className="panel flex max-w-[92vw] flex-wrap items-center justify-center gap-1.5 px-3 py-2 shadow-[var(--shadow-lg)]" style={{ background: "var(--bg-elev)" }}>
              <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-faint">Go to</span>
              {JUMPS.map((j) => (
                <span key={j.key} className="flex items-center gap-1 rounded-lg bg-panel-2 px-1.5 py-1">
                  <kbd className="font-mono text-[10px] font-bold text-accent">{j.key}</kbd>
                  <span className="text-[10px] text-dim">{j.label}</span>
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[110] grid place-items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div
              className="panel relative w-full max-w-2xl overflow-hidden shadow-2xl"
              style={{ background: "var(--bg-elev)" }}
              initial={{ scale: 0.95, y: 12, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.97, y: 8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
            >
              <div className="hairline flex items-center gap-2 px-5 py-3">
                <Icon name="Keyboard" size={16} className="text-accent" />
                <h3 className="font-semibold">Keyboard shortcuts</h3>
                <button onClick={() => setOpen(false)} className="btn btn-ghost ml-auto !px-2 !py-1">
                  <Icon name="X" size={15} />
                </button>
              </div>
              <div className="grid max-h-[70vh] gap-5 overflow-y-auto p-5 sm:grid-cols-2">
                <Group title="Jump to a page" hint="Press g, then the letter">
                  {JUMPS.map((j) => (
                    <Row key={j.key} label={j.label} keys={["g", j.key]} />
                  ))}
                </Group>
                <div className="space-y-5">
                  <Group title="Anywhere">
                    {ACTIONS.map((a) => (
                      <Row key={a.keys + a.label} label={a.label} keys={a.keys.split(" ")} />
                    ))}
                  </Group>
                  <Group title="While a visualiser is open">
                    {VIZ_KEYS.map((a) => (
                      <Row key={a.keys} label={a.label} keys={[a.keys]} />
                    ))}
                  </Group>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Group({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2">
        <div className="text-xs font-bold uppercase tracking-wider text-faint">{title}</div>
        {hint && <div className="text-[10px] text-faint">{hint}</div>}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, keys }: { label: string; keys: string[] }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg px-1 py-1 hover:bg-panel-2/60">
      <span className="text-xs text-dim">{label}</span>
      <span className="flex shrink-0 items-center gap-1">
        {keys.map((k, i) => (
          <kbd
            key={`${k}-${i}`}
            className={cx("rounded border border-line bg-panel-2 px-1.5 py-0.5 font-mono text-[10px] font-semibold", k.length > 3 && "px-2")}
          >
            {k}
          </kbd>
        ))}
      </span>
    </div>
  );
}
