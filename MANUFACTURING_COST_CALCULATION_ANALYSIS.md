# Manufacturing Cost Calculation - Complete Analysis

## 🔍 Current Calculation Flow

### How Manufacturing Cost is Calculated

The calculation happens in `hooks/useProductConfig.ts` in the `calculateProductPrice()` function.

#### Step-by-Step Breakdown:

```typescript
// STEP 1: Calculate Each Component's Total Cost
// Each component total = Material Cost + Machine Cost

Body Total Cost = (Body Weight × Material Price/kg) + (Work Hours × Machine Rate/hr)
Bonnet Total Cost = (Bonnet Weight × Material Price/kg) + (Work Hours × Machine Rate/hr)
Plug Total Cost = (Plug Weight × Material Price/kg) + (Work Hours × Machine Rate/hr)
Seat Total Cost = (Seat Weight × Material Price/kg) + (Work Hours × Machine Rate/hr)
Stem Total Cost = Stem Fixed Price + (Work Hours × Machine Rate/hr)
Cage Total Cost = (Cage Weight × Material Price/kg) + (Work Hours × Machine Rate/hr)  [if applicable]
Seal Ring Total Cost = Seal Ring Fixed Price + (Work Hours × Machine Rate/hr)  [if applicable]

// STEP 2: Calculate Body Sub-Assembly Total
Body Sub-Assembly Total = Body Total + Bonnet Total + Plug Total + Seat Total + 
                          Stem Total + Cage Total + Seal Ring Total

// STEP 3: Calculate Manufacturing Cost
Manufacturing Cost = Body Sub-Assembly Total + 
                    Actuator Sub-Assembly Total + 
                    Tubing & Fitting Total + 
                    Testing Total

// STEP 4: Add Profit
Manufacturing Profit Amount = Manufacturing Cost × (Profit % / 100)
Manufacturing Cost With Profit = Manufacturing Cost + Manufacturing Profit Amount

// STEP 5: Calculate Final Unit Cost
Unit Cost = Manufacturing Cost With Profit + Boughtout Cost With Profit
```

## ✅ Machine Costs ARE INCLUDED

### Code Evidence (from useProductConfig.ts):

**Body Component (Lines 259-297):**
```typescript
const materialCost = weight * material.pricePerKg;
const workHourData = await getWorkHourForBody(...);
const selectedMachineRate = p.bodyMachineRate || 0;
const machineCost = workHourData.workHours * selectedMachineRate;
updatedProduct.bodyTotalCost = materialCost + machineCost;  // ← Machine cost IS added
```

**Body Sub-Assembly Total (Lines 523-529):**
```typescript
updatedProduct.bodySubAssemblyTotal = 
    (updatedProduct.bodyTotalCost || 0) +        // ← Includes body machine cost
    (updatedProduct.bonnetTotalCost || 0) +      // ← Includes bonnet machine cost
    (updatedProduct.plugTotalCost || 0) +        // ← Includes plug machine cost
    (updatedProduct.seatTotalCost || 0) +        // ← Includes seat machine cost
    (updatedProduct.stemTotalCost || 0) +        // ← Includes stem machine cost
    (updatedProduct.cageTotalCost || 0) +        // ← Includes cage machine cost
    (updatedProduct.sealRingTotalCost || 0);     // ← Includes seal ring machine cost
```

**Manufacturing Cost (Lines 573-576):**
```typescript
updatedProduct.manufacturingCost = 
    (updatedProduct.bodySubAssemblyTotal || 0) +  // ← ALL machine costs already included here
    (updatedProduct.actuatorSubAssemblyTotal || 0) +
    (updatedProduct.tubingAndFittingTotal || 0) +
    (updatedProduct.testingTotal || 0);
```

## 🎯 The Calculation is CORRECT!

### If Machine Costs Appear Zero, Here's Why:

1. **Machine Not Selected**: If no machine is selected for a component, machine rate = 0
2. **Work Hours Not Found**: If work hour data doesn't exist in DB, machine cost = 0
3. **Data Not Saved**: Machine selection must be saved when quote is created/edited

## 📋 How It Works in Each Page

### **CREATE PAGE** (`/employee/new-quote`)

**Flow:**
1. User fills product configuration form
2. User selects machines for each component (Body, Bonnet, Plug, Seat, Stem, etc.)
3. Machine selection sets:
   - `bodyMachineTypeId` (machine ID)
   - `bodyMachineTypeName` (machine name)
   - `bodyMachineRate` (hourly rate)
4. User clicks "Calculate Price" button
5. `calculateProductPrice()` runs:
   - Fetches work hours for each component
   - Multiplies work hours × selected machine rate
   - Adds machine cost to material cost
   - Sums everything into manufacturing cost
6. User saves quote
7. All data (including machine costs) saved to Firestore

**Machine Selection Code (ProductConfigurationForm.tsx):**
```tsx
<select onChange={(e) => {
    const machine = machineTypes.find(m => m.id === e.target.value);
    setCurrentProduct({
        ...currentProduct,
        bodyMachineTypeId: machine?.id,
        bodyMachineTypeName: machine?.name,
        bodyMachineRate: machine?.hourlyRate,  // ← This is used in calculation
    });
}}>
```

### **EDIT PAGE** (`/employee/edit-quote/[id]`)

**Flow:**
1. Loads existing quote from Firestore
2. Initializes form with saved data including:
   - All machine IDs, names, and rates
   - All calculated costs
3. User can modify any values
4. User clicks "Recalculate Price" if needed
5. `calculateProductPrice()` runs again with current selections
6. User saves changes
7. Updated data saved to Firestore

**Data Loading (edit-quote/[id]/page.tsx):**
```tsx
// Loads all existing data including machine selections
setCurrentProduct({
    ...loadedProduct,
    bodyMachineTypeId: loadedProduct.bodyMachineTypeId,
    bodyMachineTypeName: loadedProduct.bodyMachineTypeName,
    bodyMachineRate: loadedProduct.bodyMachineRate,
    // ... same for all other components
});
```

### **VIEW PAGE** (`/employee/quotes/[id]`)

**Flow:**
1. Loads quote from Firestore
2. Displays all data in ProductDetailedView component
3. Shows:
   - Manufacturing Cost (includes all machine costs)
   - Machine Costs Breakdown section (shows details)
   - All totals

**Display Code (ProductDetailedView.tsx):**
```tsx
// Manufacturing Cost Card
<p>Manufacturing: ₹{product.manufacturingCost}</p>

// Machine Costs Section (NEW)
{product.bodyMachineCost && (
    <div>
        Body Machining: {product.bodyWorkHours} hrs × ₹{product.bodyMachineRate}/hr
        = ₹{product.bodyMachineCost}
    </div>
)}
```

## 🔬 Verification Steps

### To Verify Machine Costs Are Included:

1. **In CREATE/EDIT:**
   - Open browser console (F12)
   - Click "Calculate Price"
   - Look for console logs:
     ```
     ✅ Body machine cost: 1250 (2.5 hr × ₹500/hr - CNC Lathe)
     ✅ Body total: ₹5250 (Material: ₹4000 + Machine: ₹1250)
     💰 Body Sub-Assembly Total: 25000
     ```

2. **In VIEW PAGE:**
   - Check "Manufacturing Cost" in summary cards
   - Scroll to "Machine Costs Breakdown" section
   - Verify individual machine costs are shown
   - Sum all machine costs manually
   - Compare with "Body Sub-Assembly Total"

3. **Check Product Cost Summary:**
   ```
   Manufacturing Cost (Base): ₹XX,XXX  ← Should include all machine costs
   └─ Body Sub-Assembly: ₹XX,XXX      ← Includes machine costs
   └─ Actuator Sub-Assembly: ₹XX,XXX
   └─ Tubing & Fitting: ₹XX,XXX
   └─ Testing: ₹XX,XXX
   ```

## 🐛 If Machine Costs Still Appear Zero

### Possible Issues:

#### 1. **Machine Not Selected During Quote Creation**
**Solution:** Make sure to select a machine for each component before calculating price

#### 2. **Work Hours Data Missing in Database**
**Check:** Admin > Machine Pricing > Work Hours Data
**Solution:** Add work hour data for the series/size/rating combination

#### 3. **Machine Rate Not Saved**
**Check:** In Firestore, verify the saved quote has:
- `bodyMachineRate: 500` (not 0 or null)
- `bodyMachineTypeId: "abc123"`
- `bodyMachineTypeName: "CNC Lathe"`

#### 4. **Calculation Not Run After Machine Selection**
**Solution:** Always click "Calculate Price" after selecting machines

## 📊 Example Calculation

### Sample Product:
```
Body:
- Material Cost: ₹4,000 (10kg × ₹400/kg)
- Machine Cost: ₹1,250 (2.5hr × ₹500/hr)
- Body Total: ₹5,250

Bonnet:
- Material Cost: ₹2,000 (5kg × ₹400/kg)
- Machine Cost: ₹900 (2hr × ₹450/hr)
- Bonnet Total: ₹2,900

Plug:
- Material Cost: ₹3,000 (6kg × ₹500/kg)
- Machine Cost: ₹1,200 (3hr × ₹400/hr)
- Plug Total: ₹4,200

Seat:
- Material Cost: ₹2,500 (5kg × ₹500/kg)
- Machine Cost: ₹800 (2hr × ₹400/hr)
- Seat Total: ₹3,300

Stem:
- Fixed Price: ₹1,500
- Machine Cost: ₹600 (1.5hr × ₹400/hr)
- Stem Total: ₹2,100

Body Sub-Assembly Total: ₹17,750
(₹5,250 + ₹2,900 + ₹4,200 + ₹3,300 + ₹2,100)

Actuator: ₹5,000
Tubing & Fitting: ₹2,000
Testing: ₹1,000

Manufacturing Cost: ₹25,750
(₹17,750 + ₹5,000 + ₹2,000 + ₹1,000)

Manufacturing Profit (20%): ₹5,150
Manufacturing Cost With Profit: ₹30,900

Accessories: ₹3,000
Boughtout Profit (15%): ₹450
Boughtout Cost With Profit: ₹3,450

UNIT COST: ₹34,350
```

### Machine Costs Breakdown:
```
Body Machining: ₹1,250
Bonnet Machining: ₹900
Plug Machining: ₹1,200
Seat Machining: ₹800
Stem Machining: ₹600
─────────────────────
Total Machine Costs: ₹4,750
```

This ₹4,750 is INCLUDED in the ₹25,750 Manufacturing Cost!

## ✅ Conclusion

**The calculation is mathematically correct and machine costs ARE included in manufacturing cost.**

If machine costs appear as zero, it means:
1. No machine was selected for that component, OR
2. Work hour data doesn't exist in the database, OR
3. The quote was created before machine selection was implemented

**To fix existing quotes:** Edit the quote, select machines for each component, recalculate price, and save.

**For new quotes:** Make sure to select machines before clicking "Calculate Price".

---

**Calculation Status:** ✅ CORRECT
**Machine Costs:** ✅ PROPERLY INCLUDED
**Pages Verified:** ✅ Create, Edit, View
