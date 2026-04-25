import type { User, Session } from "./AuthTypes";

const STORAGE_KEYS = {
  users: "festival.users",
  session: "festival.session",
  version: "festival.auth.version",
} as const;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const AuthStorage = {
  bootstrap(): void {
    if (!localStorage.getItem(STORAGE_KEYS.version)) {
      localStorage.setItem(STORAGE_KEYS.version, "1");
    }
  },

  loadUsers(): User[] {
    return readJson<User[]>(STORAGE_KEYS.users, []);
  },

  saveUsers(users: User[]): void {
    writeJson(STORAGE_KEYS.users, users);
  },

  readSession(): Session | null {
    return readJson<Session | null>(STORAGE_KEYS.session, null);
  },

  writeSession(session: Session): void {
    writeJson(STORAGE_KEYS.session, session);
  },

  clearSession(): void {
    localStorage.removeItem(STORAGE_KEYS.session);
  },

  clearAllAuthData(): void {
    localStorage.removeItem(STORAGE_KEYS.users);
    localStorage.removeItem(STORAGE_KEYS.session);
    localStorage.removeItem(STORAGE_KEYS.version);
  },
};
