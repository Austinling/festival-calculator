# Calculation Logic

This document explains the main math used by the festival planner so you can edit the formulas yourself.

## Where the math lives

- Live configurator estimates: [`src/components/Configurator.tsx`](../../src/components/Configurator.tsx)
- Simulation engine: [`src/logic/Simulation.ts`](../../src/logic/Simulation.ts)

## Live estimator math

The configurator sidebar shows real-time estimates based on the current setup.

### CAPEX

Current live CAPEX is:

- sum of all stage setup costs
- parking fixed cost (if Parking is enabled, auto-calculated by event size)
- WiFi setup/flat cost (if WiFi is enabled, auto-calculated by event size)
- medical zone flat setup cost when medical resources are configured
- `toilet quantity × 2000` for each toilet group

### Projected attendance

The live turnout estimate is based on:

- festival capacity
- average artist draw factor
- how many artists you booked relative to stages
- support features like vendors, security, amenities, and toilets
- support features like vendors, security, parking, WiFi, medical, and toilets

In code, the estimate is calculated from a mix of:

- average artist draw
- stage coverage
- support boost
- a base capacity multiplier

This is no longer a fixed 60% value.

### Live OPEX

The configurator estimate includes:

- security hourly costs (`quantity × hourly rate × hours/day`)
- toilet maintenance from weekly rates converted to daily (`weekly / 7`)
- medical staff and units (`quantity × hourly rate × hours/day`, plus ambulance mileage)
- artist set costs (`sum of artist set costs`, fixed 45-min set model)
- WiFi cost auto-calculated by event size if WiFi section is enabled
- parking variable cost auto-calculated by event size if Parking section is enabled
- electricity subtotal shown separately and included in OPEX
- a logistics charge only when the festival has actual operational infrastructure

### Resource recommendations

The live estimate sidebar also shows recommended targets based on your current setup:

- security staff
- toilets
- medical resources
- total operations staff

Recommendations are derived from projected attendance plus stage/artist scale.

The logistics charge is currently:

- `ceil(projectedAttendance / 1000) × 250 × durationDays`

## Simulation math

The actual simulation uses more detailed formulas.

### Attendance

`calculateAttendance()` uses:

- festival capacity
- marketing budget multiplier
- reputation multiplier
- weather multiplier
- artist draw multiplier

Current factors:

- marketing: `0.4` to `1.0`
- reputation: `0.7` to `1.0`
- weather multipliers:
  - sunny: `1.0`
  - cloudy: `0.95`
  - rainy: `0.75`
  - extreme: `0.5`

### Revenue

Revenue is:

- ticket revenue = `attendance × ticketPrice`
- vendor commission = attendance-based vendor spend × vendor commission rate
- sponsor profit = direct sponsorship tier profit entries

Current ticket price: `$50`.

### Artist set model

- Artists are added as fixed **45-minute sets**
- Start times are auto-assigned in scheduling order
- Each artist has a **cost per set**
- This set cost is added into OPEX

### OPEX

Simulation OPEX includes:

- security costs over the full event (hourly model)
- toilet maintenance with weather impact (weekly rates converted to daily)
- medical staffing and resources over the full event
- artist set costs over the event
- **electricity costs for all stages** (calculated based on tier)
- **WiFi cost by event size tier** (if WiFi is enabled)
- **Parking variable daily cost by event size tier** (if Parking is enabled)
- logistics charge only when there are actual vendors, toilets, security, or amenities

The logistics charge is currently:

- `ceil(attendance / 1000) × 250 × durationDays`

### Stage Tier System

The festival planner includes three standard stage tiers with predefined specifications for power consumption, fixed costs, variable costs, and recommended staffing.

#### Stage Tier Specifications

| Tier   | Name            | Capacity | Power (kW) | Fixed Cost (£) | Variable Cost (£/hr) | Recommended Staff       |
| ------ | --------------- | -------- | ---------- | -------------- | -------------------- | ----------------------- |
| Small  | Small Stage     | 300      | 20         | 300            | 50                   | 1 Junior Tech           |
| Medium | Secondary Stage | 1,500    | 120        | 750            | 140                  | 2 Engineers + 2 Crew    |
| Large  | Main Stage      | 20,000   | 800        | 3,500          | 550                  | 4 Senior Techs + 4 Crew |

#### Electricity Calculation

- **Rate**: £0.2467 per kWh
- **Formula**: `Power (kW) × 24 hours × Duration (days) × £0.2467/kWh`
- **Examples**:
  - Small Stage (20kW) for 3 days: 20 × 24 × 3 × 0.2467 = **£355.39**
  - Medium Stage (120kW) for 3 days: 120 × 24 × 3 × 0.2467 = **£2,132.35**
  - Large Stage (800kW) for 3 days: 800 × 24 × 3 × 0.2467 = **£14,215.68**

#### Tier Usage

- When you select a preset tier in the Stages tab, the form auto-fills with recommended values
- You can customize any stage after selecting a tier
- The tier reference is stored on each stage for documentation purposes
- Electricity costs are automatically calculated and included in total OPEX based on actual power consumption

### Toilet Cost Assumptions

Only two toilet types are used in the model:

| Type            | Cost                  |
| --------------- | --------------------- |
| Standard toilet | £30 per week per unit |
| Disabled toilet | £50 per week per unit |

Notes:

- Weekly rates are converted into daily rates inside the simulation using `weekly / 7`
- Weather multiplier is applied to toilet upkeep

### Security Cost Assumptions

Only three security roles are used:

| Role                          | Hourly Rate                          |
| ----------------------------- | ------------------------------------ |
| General security officer      | £15/hour                             |
| Door supervisor               | £19-£21/hour (defaulted to £20/hour) |
| Car park / traffic management | £15/hour                             |

Simulation formula:

- `quantity × costPerHour × hoursPerDay × festivalDays`

### Medical Staff Assumptions

Medical staffing and support are configured in a dedicated Medical tab.

| Resource        | Cost                  |
| --------------- | --------------------- |
| Paramedic       | £34/hour              |
| Nurse           | £27/hour              |
| First responder | £21/hour              |
| Ambulance / 4x4 | £19/hour + £0.40/mile |
| Gazebo          | £14/hour              |

Simulation formula:

- Base: `quantity × costPerHour × hoursPerDay × festivalDays`
- Ambulance/4x4 extra mileage: `quantity × mileagePerDay × 0.40 × festivalDays`

### Vendor and Sponsor Assumptions

- Vendors are limited to two categories: `food` and `merchandise`
- Sponsorship is in a separate Sponsors tab
- Sponsor tiers are treated as direct event profit entries:
  - Community: £5,000
  - Regional: £25,000
  - Headline: £100,000

### Event Size Tiering (for WiFi and Parking)

Event size is derived from number of stages:

- Small event: `1-2` stages
- Medium event: `3-5` stages
- Large event: `6+` stages

### WiFi Cost Assumptions

If at least one WiFi amenity exists, WiFi is auto-priced by event size:

| Event Size | WiFi Cost |
| ---------- | --------- |
| Small      | £2,500    |
| Medium     | £10,000   |
| Large      | £100,000  |

### Parking Cost Assumptions

If Parking is enabled, parking costs are auto-calculated by event size.

Fixed parking cost (CAPEX):

| Tier                      | Fixed Cost Applied |
| ------------------------- | ------------------ |
| Small (about 150 cars)    | £500               |
| Medium (about 2,000 cars) | £4,500             |
| Large (about 15,000 cars) | £40,000            |

Variable parking cost (OPEX per day):

| Tier   | Variable Cost Per Day |
| ------ | --------------------- |
| Small  | £120/day              |
| Medium | £1,600/day            |
| Large  | £11,000/day           |

### CAPEX

Simulation CAPEX includes:

- stage setup costs (£300–£3,500 per stage depending on tier)
- parking fixed cost by event size (when Parking is enabled)
- WiFi flat cost by event size (when WiFi is enabled)
- medical zone flat setup cost: **£15,000** (when any medical resources are present)
- `toilet quantity × 2000`

### Crowd quality

The simulation also calculates:

- toilet wait time from attendance-to-toilet ratio
- crowd satisfaction from waits, staffing, and vendor capacity
- security incidents from satisfaction and staffing
- safety rating from incidents, staffing, and amenities

### Grade

The final grade combines:

- profit score
- satisfaction score
- safety score

Grades are assigned from `A+` to `F`.

## How to change the math

If you want to tune the app:

- change live preview math in `Configurator.tsx`
- change final simulation math in `Simulation.ts`
- keep both files aligned if you want the preview and simulation to behave similarly

## Notes

- The app is designed to work locally only.
- All persistent data lives in browser storage.
- If you want a single source of truth for formulas later, you can move the shared math into a separate utility module.
