"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/bits";
import { useOnline } from "@/hooks/useNow";

interface PromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

const DISMISS_KEY = "dsa-install-dismissed";

const noopSubscribe = () => () => {};

/** Which install story applies to this browser. "installed" when already running as an app. */
type Platform = "installed" | "ios" | "other";

function detectPlatform(): Platform {
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (standalone) return "installed";
  // iPadOS reports itself as a Mac, so check for touch as well.
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (/macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
  return ios ? "ios" : "other";
}

const usePlatform = (): Platform | null => useSyncExternalStore(noopSubscribe, detectPlatform, () => null);

const wasDismissed = (): boolean => {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return true;
  }
};

const useDismissed = (): boolean => useSyncExternalStore(noopSubscribe, wasDismissed, () => true);

/**
 * Registers the service worker, asks the browser to keep this site's storage,
 * and handles installing:
 *
 * - Chrome, Edge, Brave and Android fire `beforeinstallprompt`; that event is
 *   kept and offered once as a card, and again whenever `open-install` fires.
 * - iPhone and iPad never fire it, so they get a one-time hint to use Share >
 *   Add to Home Screen, which is also the only way their progress is kept long
 *   term (Safari clears storage of sites you have not visited for a week, but
 *   not of home screen apps).
 * - Anything else gets the instructions in a modal.
 */
export function PwaBoot() {
  const [prompt, setPrompt] = useState<PromptEvent | null>(null);
  const [cardOpen, setCardOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [closed, setClosed] = useState(false);
  const online = useOnline();
  const platform = usePlatform();
  const dismissed = useDismissed();

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    // Best effort: marks this origin's storage as persistent, so the browser
    // does not evict progress under storage pressure.
    navigator.storage?.persist?.().catch(() => {});

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as PromptEvent);
      if (!wasDismissed()) setCardOpen(true);
    };
    const onInstalled = () => {
      setPrompt(null);
      setCardOpen(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    const onOpen = async () => {
      if (prompt) {
        await prompt.prompt();
        setPrompt(null);
        setCardOpen(false);
      } else {
        setGuideOpen(true);
      }
    };
    window.addEventListener("open-install", onOpen);
    return () => window.removeEventListener("open-install", onOpen);
  }, [prompt]);

  const dismiss = () => {
    setCardOpen(false);
    setClosed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  };

  const showIosHint = platform === "ios" && !dismissed && !closed;

  return (
    <>
      <AnimatePresence>
        {!online && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            className="fixed left-1/2 top-3 z-[99] -translate-x-1/2 rounded-full border border-medium/50 px-3 py-1.5 text-xs font-semibold"
            style={{ background: "var(--bg-elev)", color: "var(--medium)" }}
          >
            <span className="flex items-center gap-1.5">
              <Icon name="AlertTriangle" size={12} /> Offline. Everything still works, progress saves locally.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {((cardOpen && prompt) || showIosHint) && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="panel fixed bottom-20 left-4 z-[88] w-[min(330px,calc(100vw-2rem))] p-4 shadow-[var(--shadow-lg)] lg:bottom-6 lg:left-auto lg:right-6"
            style={{ background: "var(--bg-elev)" }}
          >
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl grad-bg on-accent">
                <Icon name="Download" size={16} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold">Install DSA Prep</div>
                {showIosHint ? (
                  <p className="mt-0.5 text-xs leading-relaxed text-dim">
                    Tap <Icon name="Share" size={12} className="inline align-[-2px]" /> <strong>Share</strong>, then{" "}
                    <strong>Add to Home Screen</strong>. It opens full screen, works offline, and keeps your progress
                    safe from Safari&apos;s storage clean-up.
                  </p>
                ) : (
                  <p className="mt-0.5 text-xs text-dim">
                    Runs offline, opens like a native app, and always opens the copy that has your progress.
                  </p>
                )}
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              {!showIosHint && prompt && (
                <button
                  className="btn btn-primary flex-1"
                  onClick={async () => {
                    await prompt.prompt();
                    setPrompt(null);
                    dismiss();
                  }}
                >
                  Install
                </button>
              )}
              <button className="btn flex-1" onClick={dismiss}>
                {showIosHint ? "Got it" : "Later"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal open={guideOpen} onClose={() => setGuideOpen(false)} title="Install DSA Prep">
        <InstallGuide platform={platform} />
      </Modal>
    </>
  );
}

const STEPS: { icon: string; title: string; steps: string[] }[] = [
  {
    icon: "Monitor",
    title: "Windows, Mac, Linux — Chrome, Edge or Brave",
    steps: ["Click the install icon at the right end of the address bar.", "Or open the browser menu and choose Install DSA Prep (Brave: Save and share, then Install page as app)."],
  },
  {
    icon: "Smartphone",
    title: "iPhone and iPad — Safari",
    steps: ["Tap the Share button.", "Choose Add to Home Screen, then Add."],
  },
  {
    icon: "Smartphone",
    title: "Android — Chrome",
    steps: ["Open the menu (three dots).", "Choose Install app or Add to Home screen."],
  },
];

/** Platform instructions, with the one that applies here listed first. */
export function InstallGuide({ platform }: { platform: Platform | null }) {
  const order = platform === "ios" ? [1, 0, 2] : [0, 2, 1];
  if (platform === "installed") {
    return (
      <p className="text-sm text-dim">
        You are already using the installed app. Your progress is stored on this device, in this app.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {order.map((i) => {
        const s = STEPS[i];
        return (
          <div key={s.title} className="rounded-xl border border-line-soft bg-panel-2/50 p-3">
            <div className="mb-1.5 flex items-center gap-2 text-sm font-semibold">
              <Icon name={s.icon} size={14} className="text-accent" />
              {s.title}
            </div>
            <ol className="list-decimal space-y-0.5 pl-5 text-xs leading-relaxed text-dim">
              {s.steps.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ol>
          </div>
        );
      })}
      <p className="text-[11px] leading-relaxed text-faint">
        Progress is saved in the browser you install from, at this exact address. Install from the same address you
        practise on, and use Export on the Profile page to move progress between browsers or devices.
      </p>
    </div>
  );
}
