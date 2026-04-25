import type {
  User,
  AuthResult,
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
} from "./AuthTypes";
import { AuthStorage } from "./AuthStorage";
import {
  normalizeUsername,
  isValidExperienceLevel,
  validateUsername,
  validateDisplayName,
  nowIso,
  invalidInputResult,
} from "./AuthValidation";

export * from "./AuthTypes";

export const AuthLogic = {
  bootstrap(): void {
    AuthStorage.bootstrap();
  },

  register(input: RegisterInput): AuthResult {
    const username = normalizeUsername(input.username);
    const displayName = input.displayName.trim();
    const level = input.experienceLevel;

    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      return invalidInputResult(usernameValidation.message);
    }

    const displayNameValidation = validateDisplayName(displayName);
    if (!displayNameValidation.valid) {
      return invalidInputResult(displayNameValidation.message);
    }

    if (!isValidExperienceLevel(level)) {
      return invalidInputResult("Experience level is invalid.");
    }

    const users = AuthStorage.loadUsers();
    const exists = users.some((u) => u.username === username);

    if (exists) {
      return {
        ok: false,
        user: null,
        error: {
          code: "USERNAME_TAKEN",
          message: "That username already exists. Try logging in.",
        },
      };
    }

    const timestamp = nowIso();
    const newUser: User = {
      id: crypto.randomUUID(),
      username,
      displayName,
      experienceLevel: level,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    users.push(newUser);
    AuthStorage.saveUsers(users);
    AuthStorage.writeSession({ userId: newUser.id, issuedAt: timestamp });

    return { ok: true, user: newUser, error: null };
  },

  login(input: LoginInput): AuthResult {
    const username = normalizeUsername(input.username);

    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      return invalidInputResult("Enter a valid username.");
    }

    const users = AuthStorage.loadUsers();
    const user = users.find((u) => u.username === username) ?? null;

    if (!user) {
      return {
        ok: false,
        user: null,
        error: {
          code: "USER_NOT_FOUND",
          message: "No profile found with that username.",
        },
      };
    }

    AuthStorage.writeSession({ userId: user.id, issuedAt: nowIso() });
    return { ok: true, user, error: null };
  },

  restoreSession(): AuthResult {
    const session = AuthStorage.readSession();
    if (!session) {
      return { ok: false, user: null, error: null };
    }

    const users = AuthStorage.loadUsers();
    const user = users.find((u) => u.id === session.userId) ?? null;

    if (!user) {
      AuthStorage.clearSession();
      return {
        ok: false,
        user: null,
        error: {
          code: "STORAGE_CORRUPTED",
          message: "Session was invalid and has been cleared.",
        },
      };
    }

    return { ok: true, user, error: null };
  },

  getCurrentUser(): User | null {
    const result = this.restoreSession();
    return result.user;
  },

  updateProfile(patch: UpdateProfileInput): AuthResult {
    const current = this.getCurrentUser();
    if (!current) {
      return {
        ok: false,
        user: null,
        error: {
          code: "USER_NOT_FOUND",
          message: "No active user session.",
        },
      };
    }

    const users = AuthStorage.loadUsers();
    const index = users.findIndex((u) => u.id === current.id);

    if (index < 0) {
      AuthStorage.clearSession();
      return {
        ok: false,
        user: null,
        error: {
          code: "STORAGE_CORRUPTED",
          message: "Current user no longer exists.",
        },
      };
    }

    const nextDisplayName =
      patch.displayName !== undefined
        ? patch.displayName.trim()
        : users[index].displayName;

    const nextExperienceLevel =
      patch.experienceLevel !== undefined
        ? patch.experienceLevel
        : users[index].experienceLevel;

    const displayNameValidation = validateDisplayName(nextDisplayName);
    if (!displayNameValidation.valid) {
      return invalidInputResult(displayNameValidation.message);
    }

    if (!isValidExperienceLevel(nextExperienceLevel)) {
      return invalidInputResult("Experience level is invalid.");
    }

    const updated: User = {
      ...users[index],
      displayName: nextDisplayName,
      experienceLevel: nextExperienceLevel,
      updatedAt: nowIso(),
    };

    users[index] = updated;
    AuthStorage.saveUsers(users);

    return { ok: true, user: updated, error: null };
  },

  logout(): void {
    AuthStorage.clearSession();
  },

  clearAllAuthData(): void {
    AuthStorage.clearAllAuthData();
  },
};
