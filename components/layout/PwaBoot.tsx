"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { useOnline } from "@/hooks/useNow";

interface PromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

const DISMISS_KEY = "dsa-install-dismissed";

/** Registers the service worker and offers the install prompt once. */
export function PwaBoot() {
  const [prompt, setPrompt] = useState<PromptEvent | null>(null);
  const online = useOnline();

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      let dismissed = true;
      try {
        dismissed = localStorage.getItem(DISMISS_KEY) === "1";
      } catch {
        dismissed = true;
      }
      if (!dismissed) setPrompt(e as PromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const close = () => {
    setPrompt(null);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  };

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
        {prompt && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="panel fixed bottom-20 left-4 z-[88] w-[min(320px,calc(100vw-2rem))] p-4 shadow-[var(--shadow-lg)] lg:bottom-6"
            style={{ background: "var(--bg-elev)" }}
          >
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl grad-bg text-white">
                <Icon name="Download" size={16} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold">Install DSA Prep</div>
                <p className="mt-0.5 text-xs text-dim">
                  Runs offline, opens like a native app, keeps your streak on the home screen.
                </p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                className="btn btn-primary flex-1"
                onClick={async () => {
                  await prompt.prompt();
                  close();
                }}
              >
                Install
              </button>
              <button className="btn" onClick={close}>
                Later
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
