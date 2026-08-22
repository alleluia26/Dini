const storageKey = "dini-admin-session-event";

export type AdminSessionEvent =
  { occurredAt: number; type: "activity" } | { occurredAt: number; type: "logout" };

export function publishAdminSessionEvent(event: AdminSessionEvent) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(event));
  } catch {
    // Storage can be unavailable in restrictive browser modes. The current tab
    // still enforces its timeout; cross-tab synchronization is best effort.
  }
}

export function readAdminSessionEvent(
  rawValue: string | null,
): AdminSessionEvent | null {
  if (!rawValue) return null;

  try {
    const value: unknown = JSON.parse(rawValue);
    if (!value || typeof value !== "object") return null;

    const event = value as Partial<AdminSessionEvent>;
    if (
      (event.type !== "activity" && event.type !== "logout") ||
      typeof event.occurredAt !== "number"
    ) {
      return null;
    }

    return event as AdminSessionEvent;
  } catch {
    return null;
  }
}

export { storageKey as adminSessionStorageKey };
