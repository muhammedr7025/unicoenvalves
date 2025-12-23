# 🔍 Machine Costs Not Showing - Quick Diagnosis

## **Follow These Steps:**

### **1. Open Browser Console (F12)**
- Press **F12** key
- Click **Console** tab
- Keep it open

### **2. Add Test Data**

Go to `/admin/machine-pricing` and add:

**Machine Type:**
```
Name: TestMachine
Rate: 999
Click "Add Machine Type"
```

**Work Hour Entry:**
```
Component: Body
Series: (Select YOUR series from dropdown)
Size: (Type YOUR size, e.g., "1/2")
Rating: (Type YOUR rating, e.g., "150")
Trim Type: (Leave EMPTY for Body)
Work Hours: 1.0
Machine Type: TestMachine
Click "Add Work Hour"
```

### **3. Create Quote**

Go to `/employee/new-quote`:

**Fill form:**
```
1. Product Tag: Test
2. Trim Type: (Select any, e.g., "Metal Seated") ← IMPORTANT!
3. Series: (Select SAME series from step 2)
4. Size: (Type SAME size from step 2)
5. Rating: (Type SAME rating from step 2)
6. Materials: (Select any)
```

**Click "Calculate Price"**

### **4. Check Console**

Look for these messages:

**✅ SUCCESS - You should see:**
```
Fetching work hour data for Body...
Series ID: abc123, Size: 1/2, Rating: 150
✅ Body machine cost: 999 (1 hr × ₹999/hr - TestMachine)
```

**And in price summary:**
```
Body
Material: Xkg × ₹Y/kg          ₹Z
Machine: 1hr × ₹999/hr (TestMachine)   ₹999  ← Should appear!
```

**❌ PROBLEM - If you see:**
```
Fetching work hour data for Body...
Series ID: abc123, Size: 1/2, Rating: 150
❌ No work hour data found for Body
```

**This means:**
- Series/Size/Rating don't match
- Check the exact Series ID being used
- Verify work hour entry has same values

---

## **Common Issues:**

### **Issue: Console shows nothing**
**Cause:** Code not running
**Fix:** 
1. Hard refresh (Ctrl+Shift+R)
2. Check if you're on the right page
3. Make sure you clicked "Calculate Price"

### **Issue: "No work hour data found"**
**Cause:** Mismatch between quote and work hour data
**Fix:**
1. Check console for the exact Series ID being queried
2. Go to Firebase Console → workHours collection
3. Find the work hour entry
4. Verify `seriesId` matches exactly
5. Verify `size` and `rating` match exactly

### **Issue: "Trim type required"**
**Cause:** Trim type not selected
**Fix:**
1. Select trim type BEFORE calculating
2. It's a dropdown after "Product Tag"

### **Issue: Machine cost shows in console but not in UI**
**Cause:** Display logic issue
**Fix:**
1. Check if `bodyMachineCost > 0`
2. Look in component breakdown section
3. Make sure you scrolled to "Price Summary"

---

## **What Should You See:**

### **In Console:**
```
Calculating price for product: Test
Fetching work hour data for Body...
Series ID: xyz, Size: 1/2, Rating: 150
✅ Body machine cost: 999 (1 hr × ₹999/hr - TestMachine)

Fetching work hour data for Bonnet...
❌ No work hour data found for Bonnet
(This is OK - you only added Body)

... etc for other components

Total machine costs: ₹999
```

### **In UI (Price Summary):**
```
Body Sub-Assembly Breakdown:

Body
Material: 5kg × ₹200/kg                    ₹1,000
Machine: 1hr × ₹999/hr (TestMachine)      ₹999     ← THIS LINE
─────────────────────────────────────────────────
Body Total:                                ₹1,999

────

Manufacturing Cost Breakdown:
• Material Costs (Body Sub-Assembly)      ₹1,000
• Machine Costs (Body Sub-Assembly)       ₹999     ← AND THIS
• Actuator + Tubing + Testing              ₹X,XXX
```

---

## **If Still Not Working:**

**Share these with me:**

1. **Console output** (copy all text after clicking Calculate)
2. **Screenshot of work hours tab** in admin
3. **Screenshot of quote form** before calculating
4. **What series/size/rating** you're using

I'll help debug the specific issue!

---

## **Most Likely Causes (90% of issues):**

1. ❌ **No machine pricing data added** → Add test data above
2. ❌ **Series number mismatch** → Use exact same series
3. ❌ **Trim type not selected** → Select before calculating
4. ❌ **Size/Rating format mismatch** → Match exactly (e.g., "1/2" not "0.5")

**Try the test data above and report back what you see in console!** 🔍
