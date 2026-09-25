"use client";

import { useSyncExternalStore } from "react";

/* ============================================================
   Two tiny external stores.

   Reading the clock or checking for hydration during render is impure and
   makes results change between renders. useSyncExternalStore is the sanctioned
   way to read a value that lives outside React, with an explicit server
   snapshot so the first paint matches the server HTML.
   ============================================================ */

const noopSubscribe = () => () => {};

/** false while rendering on the server and during hydration, true afterwards. */
export const useHydrated = (): boolean =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

const BUCKET = 60_000;

const subscribeMinute = (onChange: () => void) => {
  const id = setInterval(onChange, BUCKET);
  return () => clearInterval(id);
};

const minuteNow = () => Math.floor(Date.now() / BUCKET) * BUCKET;

/**
 * Current time, bucketed to the minute so downstream memos stay stable,
 * and 0 before hydration so server and client agree on the first render.
 */
export const useNow = (): number =>
  useSyncExternalStore(
    subscribeMinute,
    minuteNow,
    () => 0,
  );

const subscribeOnline = (onChange: () => void) => {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
};

/** Live network status, assumed online on the server. */
export const useOnline = (): boolean =>
  useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  );
