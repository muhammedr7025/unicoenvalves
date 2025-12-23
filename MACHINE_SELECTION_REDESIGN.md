# 🔄 REDESIGN: Machine Selection During Quote Creation

## **New Workflow:**

### **Admin Side:**
1. Define machine types with hourly rates (already exists)
2. Define work hours WITHOUT machine type (needs update)
   - Just: Series, Size, Rating, Trim Type, Component, Hours

### **Employee Side (Quote Creation):**
1. Select product configuration
2. **SELECT which machine to use** (new dropdown)
3. Calculate price:
   - Work Hours (from database) × Selected Machine Rate

---

## **Changes Needed:**

### **1. Update WorkHourData Type**
Remove `machineTypeId` and `machineTypeName`:
```typescript
// OLD
export interface WorkHourData {
  workHours: number;
  machineTypeId: string;     // ← REMOVE
  machineTypeName?: string;  // ← REMOVE
}

// NEW
export interface WorkHourData {
  workHours: number;
  // Machine selected by employee during quote
}
```

### **2. Update QuoteProduct Type**
Add selected machine:
```typescript
export interface QuoteProduct {
  // Add ONE machine selection for all components
  selectedMachineId: string;
  selectedMachineName: string;
  selectedMachineRate: number;
  
  // OR add per-component machine selection
  bodyMachineId?: string;
  bonnetMachineId?: string;
  // ... etc
}
```

### **3. Add Machine Selector in Quote Form**
Add dropdown before or after configuration:
```tsx
<select onChange={(e) => setSelectedMachine(e.target.value)}>
  <option value="">Select Machine</option>
  {machineTypes.map(mt => (
    <option value={mt.id}>{mt.name} - ₹{mt.hourlyRate}/hr</option>
  ))}
</select>
```

### **4. Update Calculation Logic**
```typescript
// Get work hours from database (no machine type)
const workHourData = await getWorkHourData(series, size, rating, component);

// Get selected machine rate
const selectedMachine = machineTypes.find(m => m.id === selectedMachineId);

// Calculate
const machineCost = workHourData.workHours × selectedMachine.hourlyRate;
```

---

## **Questions Before I Implement:**

### **Q1: Machine Selection Level**
Where should employee select machine?

**Option A:** One machine for ALL components
```
[Select Machine: CNC Lathe ▼]
↓
All components use CNC Lathe
```

**Option B:** Different machine per component
```
Body: [CNC Lathe ▼]
Bonnet: [Milling ▼]
Plug: [Grinding ▼]
... (7 dropdowns)
```

**Which do you prefer?**

---

### **Q2: When to Select Machine**
When does employee choose machine?

**Option A:** At the top (before configuration)
**Option B:** After configuration (before calculate)
**Option C:** Separate step

---

### **Q3: Default Machine**
Should there be a default machine selected?

**Option A:** No default (employee must choose)
**Option B:** Default to first/cheapest machine
**Option C:** Remember last used machine

---

## **Recommended Approach:**

I suggest **Option A** (One machine for all):

```
Quote Form:
┌────────────────────────────────┐
│ Product Configuration           │
│ - Series: 92000                │
│ - Size: 1                      │
│ - Rating: 150                  │
│ - Trim Type: Hard Faced        │
│                                │
│ Machine Selection: ← NEW       │
│ [CNC Lathe - ₹500/hr ▼]       │
│                                │
│ [Calculate Price]              │
└────────────────────────────────┘

Result:
Body: 2.5 hr × ₹500 = ₹1,250
Bonnet: 1.5 hr × ₹500 = ₹750
... (all use selected machine)
```

**Advantages:**
- Simple UX
- One decision point
- Most practical for manufacturing

---

## **Please Confirm:**

1. **One machine for all components?** OR separate per component?
2. **Where to place dropdown?** (I suggest after Trim Type)
3. **Work hours NO longer include machine type?** (Just hours only)

Once you confirm, I'll implement this redesign immediately! 🚀
