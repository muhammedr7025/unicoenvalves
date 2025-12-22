# 🎯 **UI UPDATE GUIDE - EDIT QUOTE PAGE**

## **File:** `app/employee/edit-quote/[id]/page.tsx`

**Good News:** This file needs the **same changes** as new-quote!

---

## **APPROACH:**

Apply the **exact same 11 changes** from `NEW_QUOTE_CHANGES.md` to this file.

The line numbers may be slightly different, but the changes are identical:

1. ✅ Import: Change to `getAvailableSealTypes`
2. ✅ State: Change to `availableSealTypes`
3. ✅ Validation: Remove plugType check
4. ✅ Load options: Remove getAvailablePlugTypes
5. ✅ Plug calculation: Remove plugType parameter
6. ✅ Seal ring calculation: Use sealType
7. ✅ Product update: No plugType
8. ✅ UI: Remove plug type dropdown
9. ✅ UI: Update seal conditions
10. ✅ UI: Add seal ring section  
11. ✅ Logic: Load seal types

---

## **QUICK REFERENCE:**

Use Find & Replace for these simple ones:

- `getAvailablePlugTypes` → `getAvailableSealTypes` (in imports)
- `availablePlugTypes` → `availableSealTypes` (state and usage)
- Remove all `plugType` references from product object
- Remove plug type dropdown UI
- Add seal ring section UI (same as new-quote)

---

## **DIFFERENCE FROM NEW-QUOTE:**

- Loading existing quote data: Just don't set `plugType` anymore
- Everything else is identical

---

**After editing both files, your refactoring will be 100% complete!**
