import { useMemo, useState } from "react";
import { AuthLogic, type User } from "./logic/Auth";
import { Login } from "./views/Login";
import { Configurator } from "./components/Configurator";
import { Results } from "./components/Results";
import { simulateFestival } from "./logic/Simulation";
import type {
  Amenity,
  Artist,
  FestivalConfig,
  SimulationResult,
  SimulationModifiers,
  SecurityStaff,
  Toilet,
} from "./types/festival";
import type { ExperienceLevel } from "./logic/AuthTypes";

AuthLogic.bootstrap();

type LegacyFestivalConfig = Partial<FestivalConfig> & {
  festival?: Partial<FestivalConfig["festival"]>;
  artists?: Array<Partial<Artist>>;
  amenities?: Array<Partial<Amenity>>;
  toilets?: Array<Partial<Toilet> & { maintenanceCostPerDay?: number }>;
  security?: Array<
    Partial<SecurityStaff> & { costPerDay?: number; role?: string }
  >;
};

function normalizeFestivalConfig(config: LegacyFestivalConfig): FestivalConfig {
  const durationDays =
    typeof config?.festival?.durationDays === "number" &&
    config.festival.durationDays > 0
      ? config.festival.durationDays
      : 1;

  const normalizedArtists = Array.isArray(config?.artists)
    ? config.artists.map((artist) => ({
        ...artist,
        id: artist.id ?? `art-${Math.random()}`,
        name: artist.name ?? "Unknown Artist",
        stageId: artist.stageId ?? "",
        genre: artist.genre ?? "TBD",
        startTime: artist.startTime ?? "00:00",
        ticketRevenue: artist.ticketRevenue ?? 0,
        drawFactor: artist.drawFactor ?? 1,
        performanceDay:
          typeof artist.performanceDay === "number" &&
          artist.performanceDay >= 1 &&
          artist.performanceDay <= durationDays
            ? artist.performanceDay
            : 1,
        duration: 45,
        setCost:
          typeof artist.setCost === "number"
            ? artist.setCost
            : 1500 + Math.round((artist.drawFactor ?? 1) * 800),
      }))
    : [];

  const normalizedAmenities = Array.isArray(config?.amenities)
    ? config.amenities.filter(
        (amenity) => amenity.type === "parking" || amenity.type === "wifi",
      )
    : [];

  const normalizedToilets = Array.isArray(config?.toilets)
    ? config.toilets.map((toilet) => ({
        ...toilet,
        id: toilet.id ?? `wc-${Math.random()}`,
        quantity: toilet.quantity ?? 0,
        type:
          (toilet.type as string) === "accessible"
            ? "disabled"
            : (toilet.type ?? "standard"),
        maintenanceCostPerWeek:
          typeof toilet.maintenanceCostPerWeek === "number"
            ? toilet.maintenanceCostPerWeek
            : Math.round((toilet.maintenanceCostPerWeek ?? 0) * 7),
      }))
    : [];

  const normalizedSecurity = Array.isArray(config?.security)
    ? config.security.map((staff) => {
        const mappedRole =
          staff.role === "perimeter"
            ? "general-officer"
            : staff.role === "crowd-control"
              ? "door-supervisor"
              : "traffic-management";

        return {
          ...staff,
          id: staff.id ?? `sec-${Math.random()}`,
          quantity: staff.quantity ?? 0,
          role: mappedRole as SecurityStaff["role"],
          costPerHour:
            typeof staff.costPerHour === "number"
              ? staff.costPerHour
              : Math.round((staff.costPerHour ?? 0) / 10),
          hoursPerDay:
            typeof staff.hoursPerDay === "number" ? staff.hoursPerDay : 10,
        };
      })
    : [];

  return {
    // 1. Explicitly reconstruct the festival object to avoid 'undefined'
    festival: {
      id: config.festival?.id ?? `fest-${Date.now()}`,
      name: config.festival?.name ?? "My Festival",
      capacity: config.festival?.capacity ?? 10000,
      budget: config.festival?.budget ?? 500000,
      dates: config.festival?.dates ?? {
        start: "2025-06-01",
        end: "2025-06-03",
      },
      location: config.festival?.location ?? "Venue TBD",
      durationDays: durationDays,
    },
    // 2. Cast normalized arrays to their strict types
    stages: (config.stages as FestivalConfig["stages"]) ?? [],
    artists: normalizedArtists as Artist[],
    vendors: (config.vendors as FestivalConfig["vendors"]) ?? [],
    sponsors: (config.sponsors as FestivalConfig["sponsors"]) ?? [],
    medicalStaff: (config.medicalStaff as FestivalConfig["medicalStaff"]) ?? [],
    amenities: normalizedAmenities as Amenity[],
    toilets: normalizedToilets as Toilet[],
    security: normalizedSecurity as SecurityStaff[],
  };
}

function createDefaultConfig(): FestivalConfig {
  return {
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
}

function readStoredConfig(): FestivalConfig | null {
  const saved = localStorage.getItem("festival-config");
  return saved
    ? normalizeFestivalConfig(JSON.parse(saved) as LegacyFestivalConfig)
    : null;
}

function App() {
  const restoredSession = useMemo(() => AuthLogic.restoreSession(), []);
  const [user, setUser] = useState<User | null>(restoredSession.user);
  const [editingName, setEditingName] = useState(
    restoredSession.user?.displayName ?? "",
  );
  const [editingLevel, setEditingLevel] = useState<ExperienceLevel>(
    restoredSession.user?.experienceLevel ?? "beginner",
  );
  const [message, setMessage] = useState("");

  // Festival state
  const [currentConfig, setCurrentConfig] = useState<FestivalConfig | null>(
    () => readStoredConfig() ?? createDefaultConfig(),
  );
  const [simulationResult, setSimulationResult] =
    useState<SimulationResult | null>(null);
  const [simulationModifiers, setSimulationModifiers] =
    useState<SimulationModifiers>({
      weatherByDay: ["sunny"],
      marketingBudget: 30000,
      eventReputation: 50,
      ticketPrice: [50],
    });
  const [view, setView] = useState<"profile" | "configurator" | "results">(
    restoredSession.user ? "configurator" : "profile",
  );

  const loadConfig = () => {
    setCurrentConfig(readStoredConfig() ?? createDefaultConfig());
  };

  const saveConfig = (config: FestivalConfig) => {
    setCurrentConfig(config);
    localStorage.setItem("festival-config", JSON.stringify(config));
  };

  const handleSimulate = () => {
    if (!currentConfig) return;

    const metrics = simulateFestival(
      currentConfig,
      simulationModifiers,
      user?.experienceLevel ?? "beginner",
    );
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
      experienceLevel: editingLevel,
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
                onChange={(event) =>
                  setEditingLevel(event.target.value as ExperienceLevel)
                }
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
          experienceLevel={user.experienceLevel}
          onSimulate={handleSimulate}
        />
      )}
    </div>
  );
}

export default App;
