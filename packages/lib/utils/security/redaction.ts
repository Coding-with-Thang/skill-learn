const REDACTED_VALUE = "[REDACTED]";
const MAX_REDACTION_DEPTH = 8;

const SENSITIVE_FIELD_FRAGMENTS = [
  "password",
  "passwd",
  "secret",
  "token",
  "authorization",
  "cookie",
  "session",
  "api_key",
  "apikey",
  "private_key",
  "privatekey",
  "access_key",
  "client_secret",
] as const;

function isSensitiveFieldName(fieldName: string): boolean {
  const lowered = fieldName.toLowerCase();
  return SENSITIVE_FIELD_FRAGMENTS.some((fragment) => lowered.includes(fragment));
}

function redactStringValue(value: string): string {
  const lowered = value.toLowerCase();
  if (
    lowered.includes("bearer ") ||
    lowered.includes("sk_live_") ||
    lowered.includes("pk_live_") ||
    lowered.includes("whsec_")
  ) {
    return REDACTED_VALUE;
  }
  return value;
}

export function redactSensitiveData<T>(value: T, depth = 0): T {
  if (depth > MAX_REDACTION_DEPTH) {
    return "[TRUNCATED]" as T;
  }

  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === "string") {
    return redactStringValue(value) as T;
  }

  if (typeof value !== "object") {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString() as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveData(item, depth + 1)) as T;
  }

  const result: Record<string, unknown> = {};
  for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
    if (isSensitiveFieldName(key)) {
      result[key] = REDACTED_VALUE;
      continue;
    }
    result[key] = redactSensitiveData(nestedValue, depth + 1);
  }

  return result as T;
}

export const REDACTION_CONSTANTS = {
  REDACTED_VALUE,
  SENSITIVE_FIELD_FRAGMENTS,
};
