# 🔍 TROUBLESHOOTING: Machine Costs Not Showing

## 📋 **Step-by-Step Diagnosis:**

### **Step 1: Check Browser Console**
1. Open browser (F12)
2. Go to **Console** tab
3. Create/edit a quote
4. Click "Calculate Price"
5. Look for these messages:

**GOOD SIGNS:**
```
Body machine cost: Hours=2.5, Rate=500, Cost=1250
Bonnet machine cost: Hours=1.5, Rate=500, Cost=750
... etc
```

**BAD SIGNS:**
```
No work hour data found for Body
No work hour data found for Plug
Trim type required for component: Plug
```

---

### **Step 2: Verify Machine Pricing Data Exists**

#### **Check 1: Machine Types**
1. Go to `/admin/machine-pricing`
2. Click **"Machine Types"** tab
3. **Do you see any machine types listed?**
   - ✅ YES → Continue to Check 2
   - ❌ NO → **ADD MACHINE TYPE FIRST**

**How to Add:**
```
1. Fill in form:
   Machine Name: CNC Lathe
   Hourly Rate: 500
2. Click "Add Machine Type"
3. Should see it in the list
```

#### **Check 2: Work Hours Data**
1. Stay on `/admin/machine-pricing`
2. Click **"Work Hours Data"** tab
3. **Do you see any work hour entries listed?**
   - ✅ YES → Check if they match your quote configuration
   - ❌ NO → **ADD WORK HOURS FIRST**

**How to Add:**
```
1. Fill in form:
   Component: Body
   Series: (select from dropdown)
   Size: 1/2
   Rating: 150
   Trim Type: (leave empty for Body/Bonnet)
   Work Hours: 2.5
   Machine Type: CNC Lathe
2. Click "Add Work Hour"
3. Should see it in the list
```

---

### **Step 3: Match Configuration Exactly**

Machine costs will ONLY show if the work hour data **EXACTLY matches** your quote configuration.

**Example:**

**Your Quote:**
- Series: 91000
- Size: 1/2
- Rating: 150
- Trim Type: Metal Seated

**Your Work Hour Data MUST BE:**
```
Component | Series | Size | Rating | Trim Type    | Hours | Machine
Body      | 91000  | 1/2  | 150    | (empty)      | 2.5   | CNC Lathe
Plug      | 91000  | 1/2  | 150    | Metal Seated | 1.0   | CNC Lathe
```

**Common Mismatches:**
- ❌ Series: "91000" vs "UV-1010" → WON'T MATCH
- ❌ Size: "1/2" vs "0.5" → WON'T MATCH
- ❌ Rating: "150" vs "150#" → WON'T MATCH (add # in work hours)
- ❌ Trim Type: "Metal Seated" vs "Metal-Seated" → WON'T MATCH

---

### **Step 4: Verify Trim Type Selection**

**CRITICAL:** Trim Type must be selected for Plug, Seat, Stem, Cage, SealRing

1. Create/edit quote
2. **Before** calculating price
3. **Select Trim Type** from dropdown (required field)
4. Then calculate

**If Trim Type is not selected:**
- Machine costs for Plug/Seat/Stem/Cage/SealRing will be ₹0
- Console will show: "Trim type required for component: Plug"

---

### **Step 5: Check Data Flow**

Run this test:

**Test: Add Minimal Data**
```sql
1. Machine Type:
   Name: TestMachine
   Rate: 999
   
2. Work Hour (Body only):
   Component: Body
   Series: (your actual series)
   Size: (your actual size)
   Rating: (your actual rating)
   Trim Type: (leave empty)
   Hours: 1.0
   Machine: TestMachine
```

**Create Quote:**
```
1. Select SAME series/size/rating
2. Calculate price
3. Look in console for: "Body machine cost"
4. Look in price summary for: "Machine: 1hr × ₹999"
```

**If this works** → Your setup is correct, just need more data
**If this doesn't work** → There's a different issue

---

## 🔧 **Common Issues & Fixes:**

### **Issue 1: "No data in admin section"**
**Fix:**
```
Option A: Add manually in admin
Option B: Use bulk import
  1. Download template
  2. Fill with YOUR series numbers
  3. Import
```

### **Issue 2: "Data exists but costs still ₹0"**
**Fix:** Check exact matching
```
1. Note your quote's series/size/rating
2. Go to work hours tab
3. Filter by component
4. Verify entry exists with EXACT values
5. Check spelling, spacing, capitalization
```

### **Issue 3: "Trim type dropdown not showing"**
**Fix:**
```
1. Hard refresh (Ctrl+Shift+R)
2. Check if field is there before Series dropdown
3. Select a trim type BEFORE calculating
```

### **Issue 4: "Console shows errors"**
**Common Errors:**

**Error:** `No work hour data found`
**Fix:** Add work hour data for that component/configuration

**Error:** `Trim type required`
**Fix:** Select trim type in form

**Error:** `Series not found`
**Fix:** Use actual series number from your database

---

## 📊 **Verification Checklist:**

Run through this checklist:

### **Admin Side:**
- [ ] Firestore rules added for machineTypes and workHours
- [ ] At least 1 machine type exists
- [ ] At least 1 work hour entry exists
- [ ] Series number in work hours matches database

### **Quote Side:**
- [ ] Trim Type field visible in form
- [ ] Trim Type selected before calculating
- [ ] Series/Size/Rating match work hour data exactly
- [ ] Console shows "machine cost" logs

### **Display:**
- [ ] Component breakdown shows "Machine:" line
- [ ] Machine cost value > 0
- [ ] Total includes machine cost

---

## 🧪 **Debug Script:**

Copy this to browser console while on quote page:

```javascript
// Check if machine pricing is loaded
console.log('Available Trim Types:', availableTrimTypes);

// After calculating, check product data
console.log('Body Machine Cost:', currentProduct.bodyMachineCost);
console.log('Body Work Hours:', currentProduct.bodyWorkHours);
console.log('Body Machine Rate:', currentProduct.bodyMachineRate);
console.log('Body Machine Type:', currentProduct.bodyMachineTypeName);
```

---

## 🆘 **Still Not Working?**

If after all this machine costs still don't show, provide:

1. **Screenshot of admin section** showing:
   - Machine Types tab (with data)
   - Work Hours tab (with data)

2. **Screenshot of quote form** showing:
   - Selected Trim Type
   - Selected Series/Size/Rating

3. **Console output** after calculating price:
   - Any errors?
   - Any "machine cost" logs?

4. **Price summary screenshot**:
   - What does it show?

---

## 🎯 **Quick Test Data:**

If you want to test RIGHT NOW, use this minimal setup:

```
Admin → Machine Pricing:

Machine Type:
- Name: Test
- Rate: 999
- Active: TRUE

Work Hour:
- Component: Body
- Series: [YOUR SERIES NUMBER]
- Size: [YOUR SIZE]
- Rating: [YOUR RATING]
- Trim Type: (empty)
- Hours: 1.0
- Machine: Test
- Active: TRUE
```

Then create quote with exact same series/size/rating.
Calculate price.
Should see: "Machine: 1hr × ₹999 (Test) ₹999"

If you see this → Machine pricing is working!
If not → Share console errors.

---

**Let's find out what's blocking the machine costs!** 🔍
