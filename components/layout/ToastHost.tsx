"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import confetti from "canvas-confetti";
import { Icon } from "@/components/ui/Icon";
import { useStore } from "@/lib/store/useStore";

const KIND: Record<string, { icon: string; color: string }> = {
  xp: { icon: "Zap", color: "#6d5efc" },
  achievement: { icon: "Trophy", color: "#ffcc4d" },
  levelup: { icon: "TrendingUp", color: "#2fd48f" },
  streak: { icon: "Flame", color: "#ff8a3d" },
  info: { icon: "Info", color: "#34d3ff" },
};

export function ToastHost() {
  const toasts = useStore((s) => s.toasts);
  const dismiss = useStore((s) => s.dismissToast);
  const reduceMotion = useStore((s) => s.settings.reduceMotion);

  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((t) => setTimeout(() => dismiss(t.id), t.kind === "achievement" ? 5200 : 3600));
    return () => timers.forEach(clearTimeout);
  }, [toasts, dismiss]);

  useEffect(() => {
    const big = toasts.find((t) => t.kind === "achievement" || t.kind === "levelup");
    if (!big || reduceMotion) return;
    confetti({
      particleCount: big.kind === "levelup" ? 130 : 80,
      spread: 75,
      origin: { y: 0.75 },
      colors: ["#6d5efc", "#b15cff", "#34d3ff", "#2fd48f", "#ffcc4d"],
      disableForReducedMotion: true,
    });
  }, [toasts, reduceMotion]);

  return (
    <div className="pointer-events-none fixed bottom-20 right-4 z-[90] flex w-[min(340px,calc(100vw-2rem))] flex-col gap-2 lg:bottom-6">
      <AnimatePresence>
        {toasts.map((t) => {
          const meta = KIND[t.kind] ?? KIND.info;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 40, scale: 0.94 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              onClick={() => dismiss(t.id)}
              className="panel pointer-events-auto cursor-pointer overflow-hidden p-3 shadow-[var(--shadow-lg)]"
              style={{ background: "var(--bg-elev)", borderColor: `${meta.color}55` }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                  style={{ background: `${meta.color}22`, color: meta.color }}
                >
                  <Icon name={t.icon ?? meta.icon} size={17} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold" style={{ color: meta.color }}>
                    {t.title}
                  </div>
                  {t.body && <div className="mt-0.5 text-xs leading-snug text-dim">{t.body}</div>}
                </div>
              </div>
              <motion.div
                className="mt-2 h-0.5 rounded-full"
                style={{ background: meta.color }}
                initial={{ width: "100%" }}
                animate={{ width: 0 }}
                transition={{ duration: t.kind === "achievement" ? 5.2 : 3.6, ease: "linear" }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
