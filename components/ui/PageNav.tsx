"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/components/ui/bits";
import { useStore } from "@/lib/store/useStore";

/**
 * Back navigation for detail pages.
 *
 * The breadcrumb on its own was not enough: it describes a *category* path, so
 * on a problem opened from Blind 75 the middle crumb is its topic, and clicking
 * it lands you in Learn — a different section entirely. There was no way back to
 * the list you came from, which matters most in the installed PWA where there is
 * no browser chrome at all.
 *
 * So there are two separate affordances, and neither lies about where it goes:
 *   - Back uses real history, so it restores your scroll position in the list.
 *   - The origin chip is an explicit link to the list that sent you here, named.
 */

export interface Crumb {
  label: string;
  href?: string;
}

/**
 * Records the current list page as the origin for anything opened from it.
 * Call it from pages that link out to problems.
 */
export function useOrigin(href: string, label: string) {
  const setOrigin = useStore((s) => s.setOrigin);
  useEffect(() => {
    setOrigin({ href, label });
  }, [href, label, setOrigin]);
}

export function PageNav({
  crumbs,
  fallback,
  showOrigin = false,
  className,
}: {
  crumbs: Crumb[];
  /** Where Back goes when there is no history to pop, e.g. a fresh tab. */
  fallback: string;
  /** Show a link back to the list that sent the user here. */
  showOrigin?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const origin = useStore((s) => s.origin);

  const back = () => {
    // history.length is 1 on a cold open (a shared link, or a PWA shortcut),
    // where router.back() would leave the app entirely.
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push(fallback);
  };

  const showChip = showOrigin && origin && origin.href !== fallback;

  return (
    <div className={cx("flex flex-wrap items-center gap-2", className)}>
      <button onClick={back} className="btn !py-1.5 !text-xs" aria-label="Go back">
        <Icon name="ArrowLeft" size={14} />
        Back
      </button>

      {showChip && (
        <Link
          href={origin.href}
          className="flex items-center gap-1.5 rounded-xl border border-line bg-panel-2 px-2.5 py-1.5 text-xs font-medium text-dim transition-colors hover:border-accent hover:text-text"
          title={`Return to ${origin.label}`}
        >
          <Icon name="ListChecks" size={13} className="text-accent" />
          <span className="max-w-[160px] truncate">{origin.label}</span>
        </Link>
      )}

      <nav aria-label="Breadcrumb" className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs text-faint">
        {crumbs.map((c, i) => (
          <span key={`${c.label}-${i}`} className="flex min-w-0 items-center gap-1.5">
            {i > 0 && <Icon name="ChevronRight" size={12} className="shrink-0" />}
            {c.href ? (
              <Link href={c.href} className="truncate transition-colors hover:text-accent">
                {c.label}
              </Link>
            ) : (
              <span className="max-w-[220px] truncate text-dim sm:max-w-none">{c.label}</span>
            )}
          </span>
        ))}
      </nav>
    </div>
  );
}
