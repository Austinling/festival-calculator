import type { ExperienceLevel, AuthResult } from "./AuthTypes";

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function isValidExperienceLevel(
  value: string,
): value is ExperienceLevel {
  return (
    value === "beginner" || value === "intermediate" || value === "experienced"
  );
}

export function validateUsername(username: string): {
  valid: boolean;
  message: string;
} {
  const normalized = normalizeUsername(username);
  if (!normalized || normalized.length < 3) {
    return {
      valid: false,
      message: "Username must be at least 3 characters.",
    };
  }
  return { valid: true, message: "" };
}

export function validateDisplayName(displayName: string): {
  valid: boolean;
  message: string;
} {
  const trimmed = displayName.trim();
  if (!trimmed || trimmed.length < 2) {
    return {
      valid: false,
      message: "Display name must be at least 2 characters.",
    };
  }
  return { valid: true, message: "" };
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function invalidInputResult(message: string): AuthResult {
  return {
    ok: false,
    user: null,
    error: { code: "INVALID_INPUT", message },
  };
}
