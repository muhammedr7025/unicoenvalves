# Machine Cost Implementation Plan

## Objective
Implement machine cost calculation for Body Sub-Assembly parts (Body, Bonnet, Plug, Seat, Stem, Cage, Seal Ring).
Formula: `Basic Cost = Material Cost + Machine Cost`
`Machine Cost = Working Hours * Machine Type Rate`

## 1. Data Structures (types/index.ts)
- [ ] Add `MachineRate` interface: `{ id, name, ratePerHour, isActive }`
- [ ] Add `MachiningHour` interface: `{ id, seriesId, size, rating, partType, trimType?, hours, isActive }`
- [ ] Update `QuoteProduct` interface:
    - Add `trimType` (common for internal parts).
    - Add machine cost fields for each component (Body, Bonnet, Plug, Seat, Stem, Cage, Seal Ring):
        - `[component]MachineTypeId`
        - `[component]MachiningHours`
        - `[component]MachineRate`
        - `[component]MachineCost`

## 2. Firebase Services
- [ ] Create/Update `lib/firebase/machineService.ts` (or add to `pricingService.ts`):
    - `getAllMachineRates()`
    - `getMachiningHours(seriesId, size, rating, partType, trimType?)`
- [ ] Update `lib/firebase/pricingService.ts`:
    - Import/Export logic for `Machine Rates` and `Machining Hours` sheets.

## 3. Excel Template (utils/excelTemplate.ts & utils/pricingExport.ts)
- [ ] Add `Machine Rates` sheet: `Machine Name`, `Rate Per Hour`, `Active`
- [ ] Add `Machining Hours` sheet: `Series`, `Size`, `Rating`, `Part Type`, `Trim Type`, `Hours`, `Active`

## 4. UI Implementation (new-quote & edit-quote)
- [ ] **Global Section**: Add `Trim Type` dropdown (options: Standard, Linear, Equal %, etc. - need to define these or fetch them).
    - *Assumption*: I will create a fixed list of Trim Types for now, or allow free text if not specified. User said "trim type will be common", implying it's a known set. I'll stick to a simple text input or predefined list if I find one.
- [ ] **Body/Bonnet Section**:
    - Add `Machine Type` dropdown for Body.
    - Add `Machine Type` dropdown for Bonnet.
    - Fetch hours based on `Series + Size + Rating`.
    - Calculate and display `Machine Cost`.
- [ ] **Internal Parts (Plug, Seat, Stem, Cage, Seal Ring)**:
    - Add `Machine Type` dropdown for each.
    - Fetch hours based on `Series + Size + Rating + Trim Type`.
    - Calculate and display `Machine Cost`.
- [ ] **Totals**: Update total cost calculation to include `Machine Cost`.

## 5. Admin Pricing Page
- [ ] Add tabs for `Machine Rates` and `Machining Hours`.
- [ ] Allow viewing/managing these data types.

## Questions/Assumptions
- **Trim Types**: I will assume standard types like "Linear", "Equal Percentage", "Quick Opening" for now, or check if I can make it dynamic.
- **Machine Types**: These will be managed in the Admin Pricing page like Materials.
