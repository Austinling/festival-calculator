# Running the Festival Planner

## What this app is

A local-only React + TypeScript + Vite app for designing, simulating, saving, and reviewing festival setups. It runs entirely in the browser and uses `localStorage` for persistence.

## Requirements

- Node.js installed
- npm installed

## Install

From the `festival` folder:

```bash
npm install
```

## Run locally

Start the dev server:

```bash
npm run dev
```

Then open the local URL printed by Vite, usually `http://localhost:5173`.

## Build for production

```bash
npm run build
```

## Preview the production build

```bash
npm run preview
```

## Lint

```bash
npm run lint
```

## What gets saved locally

The app stores data in your browser:

- users and sessions
- the current festival config
- simulation results

If you clear browser storage, the saved profile and festival setup are removed.

## Main user flow

1. Log in or register.
2. Edit your profile if needed.
3. Open the configurator.
4. Add stages, artists, vendors, toilets, security, and amenities.
5. Adjust budget and capacity.
6. Run the simulation.
7. Review results and export them.
