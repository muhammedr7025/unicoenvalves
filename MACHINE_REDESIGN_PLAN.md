# 🚀 IMPLEMENTATION PLAN: Separate Machine Selection Per Component

## **Changes Needed:**

### **1. Update WorkHourData Interface**
```typescript
// Remove machineTypeId and machineTypeName
export interface WorkHourData {
  id: string;
  seriesId: string;
  size: string;
  rating: string;
  trimType?: string;
  component: ComponentType;
  workHours: number;  // ← ONLY THIS (no machine info)
  isActive: boolean;
}
```

### **2. Update QuoteProduct Interface**
```typescript
// Add machine selection for each component
export interface QuoteProduct {
  // Body
  bodyMaterial?: string;
  bodyMachineId?: string;        // ← NEW
  bodyMachineName?: string;      // ← NEW
  bodyMachineRate?: number;      // ← NEW
  
  // Bonnet
  bonnetMaterial?: string;
  bonnetMachineId?: string;      // ← NEW
  bonnetMachineName?: string;    // ← NEW
  bonnetMachineRate?: number;    // ← NEW
  
  // ... same for all 7 components
}
```

### **3. Update Admin Work Hours Form**
```typescript
// Remove machine type dropdown from work hours form
// Keep only: Component, Series, Size, Rating, Trim Type, Hours
```

### **4. Update Quote Form**
```typescript
// Add machine dropdown for each component
// Next to material dropdown

<div>
  <label>Body Material</label>
  <select>...</select>
</div>
<div>
  <label>Body Machine</label>  ← NEW
  <select>
    {machineTypes.map(m => (
      <option value={m.id}>{m.name} - ₹{m.hourlyRate}/hr</option>
    ))}
  </select>
</div>
```

### **5. Update Calculation**
```typescript
// Get work hours (no machine)
const bodyWorkHours = await getWorkHourData(...);

// Get selected machine
const bodyMachine = machineTypes.find(m => m.id === selectedBodyMachineId);

// Calculate
const bodyMachineCost = bodyWorkHours.workHours × bodyMachine.hourlyRate;
```

---

## **Files to Modify:**

1. `/types/index.ts` - Update interfaces
2. `/lib/firebase/machinePricingService.ts` - Remove machine from work hours
3. `/app/admin/machine-pricing/page.tsx` - Update work hours form
4. `/utils/machinePricingExcel.ts` - Remove machine column
5. `/components/quotes/ProductConfigurationForm.tsx` - Add 7 machine dropdowns
6. `/hooks/useProductConfig.ts` - Update calculation logic

---

Starting implementation now...
