# ✅ **HOW TO UPDATE PRICING - COMPLETE GUIDE**

## **🎯 Your Questions Answered:**

### **Q1: How to update pricing?**
### **Q2: How to view current values in software?**

---

## **📊 3 WAYS TO MANAGE PRICING:**

### **Method 1: Export → Modify → Import** ⭐ **RECOMMENDED**

**Perfect for:** Updating existing prices, bulk changes

**Steps:**
1. **Go to:** Admin → Pricing
2. **Click:** 📊 "Export Current Pricing" button (purple)
3. **Opens:** Excel file with YOUR CURRENT pricing data
4. **Modify:** Change any prices you want
5. **Save:** Excel file
6. **Upload:** Click "Choose Excel File" to upload
7. **Done:** System MERGES changes (updates modified, adds new, keeps rest)

**Example:**
```
You download export with:
- Aluminum AL100: ₹250/kg
- Steel ST200: ₹180/kg
- Brass BS100: ₹420/kg

You change ONLY:
- Aluminum AL100: ₹280/kg (updated)

You re-upload → System updates:
✅ Aluminum: 250 → 280 (UPDATED)
✅ Steel: 180 (UNCHANGED)
✅ Brass: 420 (UNCHANGED)
```

---

### **Method 2: Download Template → Fill → Import**

**Perfect for:** Adding completely new items (new series, new materials)

**Steps:**
1. **Click:** "Download Empty Template" (blue button)
2. **Fill:** Only new items in Excel
3. **Upload:** Click "Choose Excel File"
4. **Done:** New items added, existing unchanged

---

### **Method 3: View in Software** (Coming Soon)

**Perfect for:** Quick lookups, single price edits

**Features:**
- View all current pricing in tables
- Search and filter
- Edit individual prices directly
- No Excel needed

---

## **🔄 HOW MERGE MODE WORKS:**

### **Smart Update Logic:**

```typescript
FOR EACH row in uploaded Excel:
  1. Check if exists (by unique key)
  2. IF EXISTS:
     → UPDATE with new values
     → Status: "Updated"
  3. IF NOT EXISTS:
     → ADD as new record
     → Status: "Added"
  4. IF ERROR:
     → Log error, continue
     → Status: "Error"

FOR EACH existing record NOT in Excel:
  → KEEP unchanged
  → Status: "Unchanged"
```

### **Example Scenario:**

**Your Current Database:**
| Material | Price |
|----------|-------|
| Aluminum | ₹250  |
| Steel    | ₹180  |
| Brass    | ₹420  |

**You Upload Excel With:**
| Material | Price |
|----------|-------|
| Aluminum | ₹280  | ← Changed
| Titanium | ₹950  | ← New

**Final Database:**
| Material | Price | Status |
|----------|-------|---------|
| Aluminum | ₹280  | ✅ Updated |
| Steel    | ₹180  | ✅ Unchanged |
| Brass    | ₹420  | ✅ Unchanged |
| Titanium | ₹950  | ✅ Added |

**Statistics:** 1 added, 1 updated, 0 errors

---

## **📥 EXPORT FEATURES:**

### **What Gets Exported:**

✅ **All 11 data sheets:**
1. Materials (with current prices)
2. Series (with current configurations)
3. Body Weights (all sizes/ratings)
4. Bonnet Weights (all types)
5. Plug Weights (with seal ring data)
6. Seat Weights (with cage data)
7. Stem Fixed Prices
8. Cage Weights
9. Seal Ring Prices
10. Actuator Models (with new structure)
11. Handwheel Prices (with new structure)

✅ **Filename with timestamp:**
```
Unicorn_Valves_Pricing_Export_2025-12-22T15-30-45.xlsx
```

✅ **Ready to modify and re-upload!**

---

## **🎨 UI GUIDE:**

### **Admin → Pricing Page:**

```
┌─────────────────────────────────────────────────────┐
│  📊 Pricing Data Management                         │
├─────────────────────────────────────────────────────┤
│                                                      │
│  STATISTICS:                                         │
│  ┌──────────┬──────────┬──────────┐                │
│  │Materials │ Series   │ Body Wts  │                │
│  │   25     │    8     │    120    │                │
│  └──────────┴──────────┴──────────┘                │
│                                                      │
│  ACTIONS:                                            │
│  ┌──────────────────┬──────────────────┬─────────┐ │
│  │ Empty Template   │ Export Current   │ Upload  │ │
│  │ (Sample data)    │ (YOUR data) ⭐   │ (Merge) │ │
│  │                  │                  │         │ │
│  │ [Download]       │ [Export Excel]   │ [Choose]│ │
│  └──────────────────┴──────────────────┴─────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## **💡 COMMON USE CASES:**

### **1. Update Material Prices (Annual Increase)**

**Scenario:** Material costs increased by 10%

**Solution:**
1. Export current pricing
2. Open in Excel
3. Update Material sheet prices
4. Re-upload
5. ✅ Only materials updated, all else unchanged

---

### **2. Add New Series**

**Scenario:** Introducing Series 96000

**Solution:**
1. Export current pricing OR download template
2. Add row in Series sheet: `SV, 96000, SV Series 96000, TRUE, TRUE, TRUE`
3. Add corresponding weights in Body/Bonnet/Plug/Seat sheets
4. Upload
5. ✅ New series added, existing series unchanged

---

### **3. Update Single Actuator Price**

**Scenario:** Pneumatic PA-100 standard cost changed

**Solution:**
1. Export current pricing
2. Find in Actuator Models sheet
3. Change: `Pneumatic, Series A, PA-100, standard, 18000` (was 15000)
4. Upload
5. ✅ Only that actuator updated

---

### **4. Add Handwheel Options**

**Scenario:** New handwheel for Electric EB-300

**Solution:**
1. Export current pricing
2. Add in Handwheel Prices sheet: `Electric, Series B, EB-300, standard, 4500, TRUE`
3. Upload
4. ✅ Handwheel added, existing unchanged

---

## **⚠️ IMPORTANT NOTES:**

### **✅ Safe Operations:**
- Export doesn't modify database
- Upload merges (doesn't delete)
- Statistics show what changed
- Errors don't break everything

### **❌ NO Automatic Deletions:**
- Merge mode NEVER deletes records
- Items not in Excel stay in database
- To "delete": Set `Active = FALSE`

### **💾 Best Practices:**
1. **Always export before modifying** (get current state)
2. **Keep backup Excel files** (versioning)
3. **Test with small changes first** (verify merge works)
4. **Check statistics after upload** (confirm changes)
5. **Use descriptive filenames** (e.g., `Pricing_AfterQ4Update_2025.xlsx`)

---

## **🚀 QUICK WORKFLOWS:**

### **Update Prices Workflow:**
```
Export → Modify in Excel → Upload → Check Stats → Done!
   ↓          ↓                ↓          ↓
  2min      5min             1min       30sec    = 8.5 min total
```

### **Add New Items Workflow:**
```
Template → Fill New Rows → Upload → Verify → Done!
    ↓           ↓             ↓        ↓
   1min       10min          1min    1min    = 13 min total
```

---

## **📈 COMING SOON:**

### **In-App Pricing Viewer:**
- ✅ View all pricing in tables
- ✅ Search & filter
- ✅ Edit single values
- ✅ No Excel needed for quick changes

### **Backup & Rollback:**
- ✅ Auto-backup before import
- ✅ Rollback to previous version
- ✅ Version history

### **Validation:**
- ✅ Price range checking
- ✅ Duplicate detection
- ✅ Relationship validation

---

## **✅ SYSTEM STATUS:**

✅ **Export Functionality** - WORKING  
✅ **Smart Merge Import** - WORKING  
✅ **Statistics Tracking** - WORKING  
✅ **Error Handling** - WORKING  
✅ **UI Integration** - COMPLETE  

**READY TO USE!** 🎉

---

## **📞 SUPPORT SCENARIOS:**

### **"I need to update all material prices"**
→ Export → Modify Materials sheet → Upload

### **"I want to add a new actuator"**
→ Export → Add row in Actuator Models → Upload

### **"How do I see current prices?"**
→ Export → Open in Excel

### **"I made a mistake in my upload"**
→ Just export and upload correct version (merges fix)

### **"Will uploading delete my data?"**
→ NO! Merge mode only updates & adds

---

**Your pricing management is now SIMPLE, SAFE, and POWERFUL!** ✨
