# Machine Pricing Import/Export Fixes

## Issues Fixed:

### 1. **Merge Logic Not Finding Existing Records** ✅
**Problem:** The bulk import functions were using `getMachineTypes()` and `getWorkHours()` which only return **active** records. If you had inactive records, they wouldn't be found during the merge check, causing duplicates.

**Solution:** 
- Added `getAllMachineTypes()` - fetches ALL machine types including inactive
- Added `getAllWorkHours()` - fetches ALL work hours including inactive
- Updated `bulkImportMachineTypes()` to use `getAllMachineTypes()`
- Updated `bulkImportWorkHours()` to use `getAllWorkHours()`

Now the merge logic properly detects existing records regardless of their active status.

---

## How It Works Now:

### **Template Download:**
1. Click "Download Template"
2. Generates `Machine_Pricing_Template.xlsx` with example data
3. Opens in Excel/Sheets automatically

### **Data Export:**
1. Click "Export Current Data"
2. Generates `Machine_Pricing_Data_YYYY-MM-DD.xlsx`
3. Includes ALL your current machine types and work hours
4. Can edit and re-import

### **Bulk Import:**
1. Click "Bulk Import"
2. Select Excel file
3. System validates all data
4. **Merges intelligently:**
   - If machine/work hour exists → **UPDATES** it
   - If machine/work hour is new → **ADDS** it
   - Sets `isActive = true` on import
5. Shows success message with counts

---

## Testing Steps:

### Test 1: Download Template
```
1. Go to /admin/machine-pricing
2. Click "Download Template"
3. Should download: Machine_Pricing_Template.xlsx
4. Open file - should have 2 sheets with example data
```

### Test 2: Export Data
```
1. Make sure you have some data (add manually if needed)
2. Click "Export Current Data"
3. Should download: Machine_Pricing_Data_2025-12-23.xlsx
4. Open file - should show your actual data
```

### Test 3: Import (New Data)
```
1. Use template or create Excel with:
   - Machine Types sheet: CNC Lathe, 500, TRUE
   - Work Hours sheet: Body, UV-1010, 1", 150#, , 2.5, CNC Lathe, TRUE
2. Click "Bulk Import", select file
3. Should show: "Import successful! Added 1 machine types and 1 work hour entries."
4. Verify data appears in tabs
```

### Test 4: Import (Update Existing)
```
1. Export current data
2. Edit the Excel (change hourly rate)
3. Re-import same file
4. Should update existing records without duplicates
5. Verify changes applied
```

---

## Common Issues & Solutions:

### Issue: "Nothing happens when I click buttons"
**Check:**
- Browser console for errors (F12)
- Network tab - are requests being made?
- Make sure series data is loaded (needed for work hours)

### Issue: "Import shows 0 entries added"
**Likely causes:**
- Validation errors (check console)
- Series not found in database
- Machine type mismatch between sheets
- Missing required fields

### Issue: "Export button does nothing"
**Check:**
- Do you have data? (machineTypes or workHours arrays)
- Check if button is disabled
- Console errors?

### Issue: "File not downloading"
**Try:**
- Check browser download settings
- Look in Downloads folder
- Try different browser
- Check popup blocker

---

## What Changed:

### Files Modified:
1. `lib/firebase/machinePricingService.ts`
   - Added `getAllMachineTypes()` function
   - Added `getAllWorkHours()` function
   - Updated bulk import functions to use new getAll functions

### Why This Matters:
Before: If you had inactive records, re-importing would create duplicates
Now: System properly detects ALL existing records and updates them

---

## Next Steps:

1. Test the download template
2. Test export with your data
3. Test import with template
4. Verify merge logic (import same file twice)

If you still have issues, please share:
- What button you're clicking
- What happens (or doesn't happen)
- Any console errors (F12 → Console tab)
- Network activity (F12 → Network tab)
