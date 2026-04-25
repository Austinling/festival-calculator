import { useState } from "react";
import { SelectionBar } from "../components/SelectionBar";
import type { User } from "../logic/Auth";
import { AuthLogic } from "../logic/Auth";

interface LoginProp {
  onLoginSuccess: (user: User) => void;
}

export function Login({ onLoginSuccess }: LoginProp) {
  const experienceLevelOptions = [
    { label: "Beginner", value: "beginner" },
    { label: "Intermediate", value: "intermediate" },
    { label: "Experienced", value: "experienced" },
  ];

  const [username, setUsername] = useState("");
  const [experienceLevel, setExperienceLevel] = useState(
    experienceLevelOptions[0].value,
  );

  const submitLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !experienceLevel) alert("Please fill in both fields");

    const user = AuthLogic.login(username, experienceLevel);

    onLoginSuccess(user);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-2xl font-semibold text-slate-900">Login</h1>
        <p className="mb-6 text-sm text-slate-600">
          Enter your username and select your experience level.
        </p>

        <form onSubmit={submitLogin} className="space-y-4">
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
              placeholder="Enter username"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <SelectionBar
            id="experiencelevel"
            label="Experience Level"
            value={experienceLevel}
            options={experienceLevelOptions}
            onChange={setExperienceLevel}
          />

          <button
            type="submit"
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Continue
          </button>
        </form>
      </section>
    </main>
  );
}
