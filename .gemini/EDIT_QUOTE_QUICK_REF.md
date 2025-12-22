# 🎯 EDIT-QUOTE PAGE - APPLY SAME CHANGES

## **File:** `app/employee/edit-quote/[id]/page.tsx`

Apply the **exact same changes** you just made to new-quote:

### **1. Line 15 - Import**
Change:
```typescript
  getAvailablePlugTypes,
```
To:
```typescript
  getAvailableSealTypes,
```

### **2. Find and replace state**
Change:
```typescript
const [availablePlugTypes, setAvailablePlugTypes] = useState<string[]>([]);
```
To:
```typescript
const [availableSealTypes, setAvailableSealTypes] = useState<string[]>([]);
```

### **3. Lines 268 and 377 - Remove getAvailablePlugTypes calls**
Remove these lines and their corresponding `setAvailablePlugTypes` calls

### **4. Add seal types loading**
In `fetchDependentOptions` or similar function, add:
```typescript
const currentSeries = series.find(s => s.seriesNumber === seriesNumber);
if (currentSeries?.hasSealRing) {
  const sealTypes = await getAvailableSealTypes(seriesNumber, size, rating);
  setAvailableSealTypes(sealTypes);
}
```

### **5. Remove plugType validation**
Remove any `!currentProduct.plugType` checks

### **6. Update getPlugWeight call**
Remove the 4th parameter (plugType)

### **7. Update plug weight handling**
Change `plugWeightResult.weight` to just `plugWeightResult`

### **8. Update seal ring calculation**
Replace old seal ring logic with new independent seal ring using getSealRingPrice

### **9. Remove plugType from product save**
Delete the `plugType: product.plugType` line

### **10. Remove plug type dropdown UI**
Delete the entire plug type dropdown section

### **11. Replace seal ring display**
Use the same new seal ring section from new-quote page

---

**All the same 11 changes you just made to new-quote!**
