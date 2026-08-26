import "server-only";

const maxAttempts = 5;
const windowMs = 15 * 60 * 1000;

type AttemptRecord = {
  count: number;
  resetAt: number;
};

const attempts = new Map<string, AttemptRecord>();

function activeRecord(key: string) {
  const record = attempts.get(key);

  if (!record || record.resetAt <= Date.now()) {
    attempts.delete(key);
    return null;
  }

  return record;
}

export function isSensitiveActionRateLimited(key: string) {
  return (activeRecord(key)?.count ?? 0) >= maxAttempts;
}

export function recordSensitiveActionFailure(key: string) {
  const record = activeRecord(key);

  attempts.set(key, {
    count: (record?.count ?? 0) + 1,
    resetAt: record?.resetAt ?? Date.now() + windowMs,
  });
}

export function clearSensitiveActionFailures(key: string) {
  attempts.delete(key);
}
