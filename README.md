# Festival Planner

Local-only festival planning and simulation app built with React, TypeScript, and Vite.

## Documentation

- [How to run the app](docs/running/README.md)
- [Calculation logic](docs/calculations/README.md)

## Cost Assumptions Included

The simulation now includes explicit assumptions for:

- stage tiers (small/secondary/main), stage electricity, and stage staffing
- toilets (standard and disabled weekly pricing)
- security roles with hourly rates
- medical staff and ambulance/4x4 mileage pricing
- vendor scope (food and merchandise only) with separate sponsor profit tiers
- WiFi pricing by event size tier
- parking fixed and variable pricing by event size tier

See [Calculation logic](docs/calculations/README.md) for full formulas and values.

## Project Overview

The app runs entirely in the browser and stores data in `localStorage`.
Use the configurator to build a festival, then run the simulation to see turnout, costs, revenue, safety, and final grade.
