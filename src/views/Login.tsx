import { useMemo, useState } from "react";
import { SelectionBar } from "../components/SelectionBar";
import type { ExperienceLevel, User } from "../logic/Auth";
import { AuthLogic } from "../logic/Auth";

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

type Mode = "login" | "register";

export function Login({ onLoginSuccess }: LoginProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [experienceLevel, setExperienceLevel] =
    useState<ExperienceLevel>("beginner");
  const [error, setError] = useState("");

  const options = useMemo(
    () => [
      { label: "Beginner", value: "beginner" },
      { label: "Intermediate", value: "intermediate" },
      { label: "Experienced", value: "experienced" },
    ],
    [],
  );

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (mode === "login") {
      const result = AuthLogic.login({ username });
      if (!result.ok || !result.user) {
        setError(result.error?.message ?? "Unable to login.");
        return;
      }
      onLoginSuccess(result.user);
      return;
    }

    const result = AuthLogic.register({
      username,
      displayName,
      experienceLevel,
    });

    if (!result.ok || !result.user) {
      setError(result.error?.message ?? "Unable to create profile.");
      return;
    }

    onLoginSuccess(result.user);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex gap-2 rounded-md bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`w-1/2 rounded px-3 py-2 text-sm font-medium ${
              mode === "login"
                ? "bg-white text-slate-900 shadow"
                : "text-slate-600"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`w-1/2 rounded px-3 py-2 text-sm font-medium ${
              mode === "register"
                ? "bg-white text-slate-900 shadow"
                : "text-slate-600"
            }`}
          >
            Create Profile
          </button>
        </div>

        <h1 className="mb-1 text-2xl font-semibold text-slate-900">
          {mode === "login" ? "Welcome back" : "Create your profile"}
        </h1>
        <p className="mb-6 text-sm text-slate-600">
          {mode === "login"
            ? "Enter your username to continue."
            : "Set up your local profile for the festival planner."}
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="e.g. jess_fest"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {mode === "register" && (
            <>
              <div>
                <label
                  htmlFor="displayName"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="e.g. Jess"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <SelectionBar
                id="experiencelevel"
                label="Experience Level"
                value={experienceLevel}
                options={options}
                onChange={(value) =>
                  setExperienceLevel(value as ExperienceLevel)
                }
              />
            </>
          )}

          {error && (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            {mode === "login" ? "Continue" : "Create and continue"}
          </button>
        </form>
      </section>
    </main>
  );
}
