import { useEffect, useState } from "react";
import { AuthLogic, type User } from "./logic/Auth";
import { Login } from "./views/Login";
import { Configurator } from "./components/Configurator";
import { Results } from "./components/Results";
import { simulateFestival } from "./logic/Simulation";
import type {
  FestivalConfig,
  SimulationResult,
  SimulationModifiers,
} from "./types/festival";

function normalizeFestivalConfig(config: any): FestivalConfig {
  const normalizedArtists = Array.isArray(config?.artists)
    ? config.artists.map((artist: any) => ({
        ...artist,
        duration: 45,
        setCost:
          typeof artist.setCost === "number"
            ? artist.setCost
            : 1500 + Math.round((artist.drawFactor ?? 1) * 800),
      }))
    : [];

  const normalizedAmenities = Array.isArray(config?.amenities)
    ? config.amenities.filter(
        (amenity: any) => amenity.type === "parking" || amenity.type === "wifi",
      )
    : [];

  const normalizedToilets = Array.isArray(config?.toilets)
    ? config.toilets.map((toilet: any) => ({
        ...toilet,
        type: toilet.type === "accessible" ? "disabled" : toilet.type,
        maintenanceCostPerWeek:
          typeof toilet.maintenanceCostPerWeek === "number"
            ? toilet.maintenanceCostPerWeek
            : Math.round((toilet.maintenanceCostPerDay ?? 0) * 7),
      }))
    : [];

  const normalizedSecurity = Array.isArray(config?.security)
    ? config.security.map((staff: any) => {
        const mappedRole =
          staff.role === "perimeter"
            ? "general-officer"
            : staff.role === "crowd-control"
              ? "door-supervisor"
              : "traffic-management";

        return {
          ...staff,
          role: mappedRole,
          costPerHour:
            typeof staff.costPerHour === "number"
              ? staff.costPerHour
              : Math.round((staff.costPerDay ?? 0) / 10),
          hoursPerDay:
            typeof staff.hoursPerDay === "number" ? staff.hoursPerDay : 10,
        };
      })
    : [];

  return {
    ...config,
    artists: normalizedArtists,
    sponsors: Array.isArray(config?.sponsors) ? config.sponsors : [],
    medicalStaff: Array.isArray(config?.medicalStaff)
      ? config.medicalStaff
      : [],
    amenities: normalizedAmenities,
    toilets: normalizedToilets,
    security: normalizedSecurity,
  };
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingLevel, setEditingLevel] = useState("beginner");
  const [message, setMessage] = useState("");

  // Festival state
  const [currentConfig, setCurrentConfig] = useState<FestivalConfig | null>(
    null,
  );
  const [simulationResult, setSimulationResult] =
    useState<SimulationResult | null>(null);
  const [simulationModifiers, setSimulationModifiers] =
    useState<SimulationModifiers>({
      weather: "sunny",
      marketingBudget: 50,
      eventReputation: 50,
      ticketPrice: 50,
    });
  const [view, setView] = useState<"profile" | "configurator" | "results">(
    "profile",
  );

  // Initialize auth and load config
  useEffect(() => {
    AuthLogic.bootstrap();
    const result = AuthLogic.restoreSession();
    if (result.user) {
      setUser(result.user);
      setEditingName(result.user.displayName);
      setEditingLevel(result.user.experienceLevel);
      loadConfig();
      setView("configurator");
    }
  }, []);

  const loadConfig = () => {
    const saved = localStorage.getItem("festival-config");
    if (saved) {
      setCurrentConfig(normalizeFestivalConfig(JSON.parse(saved)));
    } else {
      // Create default config
      const defaultConfig: FestivalConfig = {
        festival: {
          id: `festival-${Date.now()}`,
          name: "My Festival",
          capacity: 10000,
          budget: 500000,
          dates: { start: "2025-06-01", end: "2025-06-03" },
          location: "Venue TBD",
          durationDays: 3,
        },
        stages: [],
        artists: [],
        vendors: [],
        sponsors: [],
        toilets: [],
        security: [],
        medicalStaff: [],
        amenities: [],
      };
      setCurrentConfig(defaultConfig);
    }
  };

  const saveConfig = (config: FestivalConfig) => {
    setCurrentConfig(config);
    localStorage.setItem("festival-config", JSON.stringify(config));
  };

  const handleSimulate = () => {
    if (!currentConfig) return;

    const metrics = simulateFestival(currentConfig, simulationModifiers);
    const result: SimulationResult = {
      id: `result-${Date.now()}`,
      festivalId: currentConfig.festival.id,
      config: currentConfig,
      modifiers: simulationModifiers,
      metrics,
      timestamp: new Date().toISOString(),
    };

    setSimulationResult(result);
    setView("results");
  };

  const onLoginSuccess = (nextUser: User) => {
    setUser(nextUser);
    setEditingName(nextUser.displayName);
    setEditingLevel(nextUser.experienceLevel);
    setMessage("");
    loadConfig();
    setView("configurator");
  };

  const onLogout = () => {
    AuthLogic.logout();
    setUser(null);
    setMessage("");
    setView("profile");
  };

  const onSaveProfile = (event: React.FormEvent) => {
    event.preventDefault();
    const result = AuthLogic.updateProfile({
      displayName: editingName,
      experienceLevel: editingLevel as any,
    });

    if (!result.ok || !result.user) {
      setMessage(result.error?.message ?? "Unable to update profile.");
      return;
    }

    setUser(result.user);
    setMessage("Profile updated.");
  };

  // Auth View
  if (!user) {
    return <Login onLoginSuccess={onLoginSuccess} />;
  }

  // Profile View
  if (view === "profile") {
    return (
      <main className="min-h-screen bg-slate-100 p-6">
        <section className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Welcome, {user.displayName}
              </h1>
              <p className="text-sm text-slate-600">
                Username: {user.username} | Level: {user.experienceLevel}
              </p>
            </div>

            <button
              onClick={onLogout}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Logout
            </button>
          </div>

          <form onSubmit={onSaveProfile} className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Edit Profile
            </h2>

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
                value={editingName}
                onChange={(event) => setEditingName(event.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label
                htmlFor="experienceLevel"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Experience Level
              </label>
              <select
                id="experienceLevel"
                value={editingLevel}
                onChange={(event) => setEditingLevel(event.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="experienced">Experienced</option>
              </select>
            </div>

            {message && (
              <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                {message}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Save Profile
              </button>
              <button
                type="button"
                onClick={() => setView("configurator")}
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Go to Configurator
              </button>
            </div>
          </form>
        </section>
      </main>
    );
  }

  // Results View
  if (view === "results" && simulationResult) {
    return (
      <Results
        result={simulationResult}
        onBack={() => setView("configurator")}
      />
    );
  }

  // Configurator View
  return (
    <div className="bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Festival Planner
            </h1>
            <p className="text-sm text-slate-600">
              {user.displayName} •{" "}
              {currentConfig?.festival.name || "New Festival"}
            </p>
          </div>
          <button
            onClick={() => setView("profile")}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Profile
          </button>
        </div>
      </header>

      {currentConfig && (
        <Configurator
          config={currentConfig}
          onConfigChange={saveConfig}
          modifiers={simulationModifiers}
          onModifiersChange={setSimulationModifiers}
          onSimulate={handleSimulate}
        />
      )}
    </div>
  );
}

export default App;
