export type ExperienceLevel = "beginner" | "intermediate" | "experienced";

export interface User {
  id: string;
  username: string;
  displayName: string;
  experienceLevel: ExperienceLevel;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  userId: string;
  issuedAt: string;
}

export type AuthErrorCode =
  | "USER_NOT_FOUND"
  | "USERNAME_TAKEN"
  | "INVALID_INPUT"
  | "STORAGE_CORRUPTED";

export interface AuthError {
  code: AuthErrorCode;
  message: string;
}

export interface AuthResult {
  ok: boolean;
  user: User | null;
  error: AuthError | null;
}

export interface RegisterInput {
  username: string;
  displayName: string;
  experienceLevel: ExperienceLevel;
}

export interface LoginInput {
  username: string;
}

export interface UpdateProfileInput {
  displayName?: string;
  experienceLevel?: ExperienceLevel;
}
