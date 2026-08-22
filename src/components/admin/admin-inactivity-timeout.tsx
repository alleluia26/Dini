"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { logout } from "@/app/actions/auth";
import {
  adminSessionStorageKey,
  publishAdminSessionEvent,
  readAdminSessionEvent,
} from "@/components/admin/admin-session-sync";

const productionTimeoutMs = 3 * 60 * 1000;
const productionWarningMs = 30 * 1000;
const activityBroadcastThrottleMs = 1000;

function readPositiveDuration(value: string | undefined, fallback: number) {
  const duration = Number(value);
  return Number.isFinite(duration) && duration > 0 ? duration : fallback;
}

function getTimeoutConfiguration() {
  const timeoutMs = readPositiveDuration(
    process.env.NEXT_PUBLIC_ADMIN_INACTIVITY_TIMEOUT_MS,
    productionTimeoutMs,
  );
  const configuredWarningMs = readPositiveDuration(
    process.env.NEXT_PUBLIC_ADMIN_INACTIVITY_WARNING_MS,
    productionWarningMs,
  );

  return {
    timeoutMs,
    warningMs: Math.min(configuredWarningMs, Math.max(1000, timeoutMs - 1000)),
  };
}

const timeoutConfiguration = getTimeoutConfiguration();

export function AdminInactivityTimeout() {
  const router = useRouter();
  const lastActivityAtRef = useRef(0);
  const lastBroadcastAtRef = useRef(0);
  const logoutStartedRef = useRef(false);
  const warningOpenRef = useRef(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const logoutFormRef = useRef<HTMLFormElement>(null);
  const staySignedInRef = useRef<HTMLButtonElement>(null);
  const [warningOpen, setWarningOpen] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(
    Math.ceil(timeoutConfiguration.warningMs / 1000),
  );
  const [loggingOut, setLoggingOut] = useState(false);

  function beginLogout() {
    if (logoutStartedRef.current) return;

    logoutStartedRef.current = true;
    setLoggingOut(true);
    publishAdminSessionEvent({ occurredAt: Date.now(), type: "logout" });
    requestAnimationFrame(() => logoutFormRef.current?.requestSubmit());
  }

  function resetTimer(shouldBroadcast = true) {
    const occurredAt = Date.now();
    lastActivityAtRef.current = occurredAt;
    warningOpenRef.current = false;
    setWarningOpen(false);
    setRemainingSeconds(Math.ceil(timeoutConfiguration.warningMs / 1000));

    if (
      shouldBroadcast &&
      occurredAt - lastBroadcastAtRef.current >= activityBroadcastThrottleMs
    ) {
      lastBroadcastAtRef.current = occurredAt;
      publishAdminSessionEvent({ occurredAt, type: "activity" });
    }
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (warningOpen && !dialog.open) {
      dialog.showModal();
      staySignedInRef.current?.focus();
    }
    if (!warningOpen && dialog.open) dialog.close();
  }, [warningOpen]);

  useEffect(() => {
    const { timeoutMs, warningMs } = timeoutConfiguration;
    lastActivityAtRef.current = Date.now();

    function evaluateTimeout() {
      if (logoutStartedRef.current) return;

      const remainingMs = timeoutMs - (Date.now() - lastActivityAtRef.current);
      if (remainingMs <= 0) {
        setRemainingSeconds(0);
        beginLogout();
        return;
      }

      if (remainingMs <= warningMs) {
        warningOpenRef.current = true;
        setWarningOpen(true);
        setRemainingSeconds(Math.ceil(remainingMs / 1000));
      }
    }

    function recordActivity() {
      if (warningOpenRef.current || logoutStartedRef.current) return;
      resetTimer();
    }

    function handleStorage(event: StorageEvent) {
      if (event.key !== adminSessionStorageKey) return;

      const sessionEvent = readAdminSessionEvent(event.newValue);
      if (!sessionEvent) return;

      if (sessionEvent.type === "logout") {
        router.replace("/admin/login");
        return;
      }

      if (sessionEvent.occurredAt > lastActivityAtRef.current) {
        lastActivityAtRef.current = sessionEvent.occurredAt;
        warningOpenRef.current = false;
        setWarningOpen(false);
        setRemainingSeconds(Math.ceil(warningMs / 1000));
      }
    }

    const activityEvents: Array<keyof WindowEventMap> = [
      "click",
      "input",
      "keydown",
      "mousemove",
      "pointerdown",
      "pointermove",
      "scroll",
      "touchstart",
      "wheel",
    ];

    activityEvents.forEach((eventName) =>
      window.addEventListener(eventName, recordActivity, true),
    );
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", evaluateTimeout);
    document.addEventListener("visibilitychange", evaluateTimeout);

    const interval = window.setInterval(evaluateTimeout, 250);
    evaluateTimeout();

    return () => {
      activityEvents.forEach((eventName) =>
        window.removeEventListener(eventName, recordActivity, true),
      );
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", evaluateTimeout);
      document.removeEventListener("visibilitychange", evaluateTimeout);
      window.clearInterval(interval);
    };
  }, [router]);

  return (
    <>
      <dialog
        aria-describedby="inactivity-timeout-description"
        aria-labelledby="inactivity-timeout-title"
        className="m-auto w-[min(100%-2rem,28rem)] rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface)] p-0 text-[var(--color-ink)] shadow-[var(--shadow-elevated)] backdrop:bg-[rgb(23_32_51_/_55%)]"
        onCancel={(event) => event.preventDefault()}
        ref={dialogRef}
      >
        <div className="p-6">
          <p className="text-sm font-extrabold tracking-[0.12em] text-[var(--color-brand-red)]">
            SESSION EXPIRING
          </p>
          <h2 className="mt-2 text-xl font-extrabold" id="inactivity-timeout-title">
            Your session is about to expire
          </h2>
          <p
            className="mt-3 text-sm leading-6 text-[var(--color-muted)]"
            id="inactivity-timeout-description"
          >
            You have {remainingSeconds} second{remainingSeconds === 1 ? "" : "s"}{" "}
            remaining due to inactivity.
          </p>
          <p
            aria-atomic="true"
            aria-live="assertive"
            className="mt-5 text-5xl font-extrabold text-[var(--color-brand-blue)] tabular-nums"
          >
            {remainingSeconds}
          </p>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              className="min-h-11 rounded-[var(--radius-control)] border border-[var(--color-border)] px-4 text-sm font-bold transition hover:border-[var(--color-brand-blue)] disabled:opacity-60"
              disabled={loggingOut}
              onClick={beginLogout}
              type="button"
            >
              {loggingOut ? "Logging out…" : "Log Out"}
            </button>
            <button
              className="min-h-11 rounded-[var(--radius-control)] bg-[var(--color-brand-red)] px-4 text-sm font-extrabold text-white transition hover:bg-[var(--color-brand-red-hover)] disabled:opacity-60"
              disabled={loggingOut}
              onClick={() => resetTimer()}
              ref={staySignedInRef}
              type="button"
            >
              Stay Signed In
            </button>
          </div>
        </div>
      </dialog>
      <form action={logout} ref={logoutFormRef} />
    </>
  );
}
