"use client";

import { useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/Icon";
import { SectionTitle } from "@/components/ui/bits";

const noopSubscribe = () => () => {};

/**
 * Where progress lives, and the button to install. Showing the origin matters:
 * localhost:3000, localhost:3001 and the deployed site are three different
 * places to the browser, and an app installed from one of them never sees the
 * progress saved in another.
 */
export function InstallPanel() {
  const origin = useSyncExternalStore(noopSubscribe, () => window.location.origin, () => "");
  const standalone = useSyncExternalStore(
    noopSubscribe,
    () => window.matchMedia("(display-mode: standalone)").matches,
    () => false,
  );

  return (
    <div className="panel p-5">
      <SectionTitle
        icon="HardDrive"
        title="Install and your data"
        sub="Everything is saved on this device, in this browser, for this exact address."
      />
      <div className="rounded-xl border border-line-soft bg-panel-2/50 p-3 text-xs leading-relaxed">
        <div className="text-faint">Your progress is stored for</div>
        <div className="mt-0.5 break-all font-mono text-sm font-semibold">{origin || "…"}</div>
        <p className="mt-2 text-dim">
          Open the app from this same address every time, and install it from here, so the icon on your desktop or home
          screen opens the copy with your progress. A different address, browser or private window starts empty; use
          Export below to carry progress across.
        </p>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {standalone ? (
          <span className="chip !text-xs" style={{ color: "var(--easy)" }}>
            <Icon name="CheckCircle2" size={12} /> Running as an installed app
          </span>
        ) : (
          <button className="btn btn-primary" onClick={() => window.dispatchEvent(new CustomEvent("open-install"))}>
            <Icon name="Download" size={14} /> Install the app
          </button>
        )}
      </div>
    </div>
  );
}
