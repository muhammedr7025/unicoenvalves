# 🎯 **FINAL UI UPDATE GUIDE - NEW QUOTE PAGE**

## **File:** `app/employee/new-quote/page.tsx`

Due to file size (2,326 lines), here are the **exact line-by-line changes** needed:

---

## **CHANGE 1: Update Imports (Line 15)**

**Find:**
```typescript
  getAvailablePlugTypes,
```

**Replace with:**
```typescript
  getAvailableSealTypes,
```

---

## **CHANGE 2: Update State (Line 76)**

**Find:**
```typescript
const [availablePlugTypes, setAvailablePlugTypes] = useState<string[]>([]);
```

**Replace with:**
```typescript
const [availableSealTypes, setAvailableSealTypes] = useState<string[]>([]);
```

---

## **CHANGE 3: Update Validation (Line 401)**

**Find:**
```typescript
      !currentProduct.plugType || !currentProduct.seatType) {
```

**Replace with:**
```typescript
      !currentProduct.seatType) {
```

(Remove the plugType check - plugs no longer have types)

---

## **CHANGE 4: Update Load Options (Line 206)**

**Find:**
```typescript
      getAvailablePlugTypes(seriesNumber, size, rating),
```

**Delete this entire line** (plug types no longer exist)

**Then find line ~212:**
```typescript
    setAvailablePlugTypes(plugs);
```

**Delete this line too**

---

## **CHANGE 5: Update Plug Calculation (Line 434)**

**Find:**
```typescript
        getPlugWeight(currentProduct.seriesNumber, currentProduct.size, currentProduct.rating, currentProduct.plugType),
```

**Replace with:**
```typescript
        getPlugWeight(currentProduct.seriesNumber, currentProduct.size, currentProduct.rating),
```

(Remove the 4th parameter - plugType)

**Then find around line 457:**
```typescript
if (plugWeightResult) {
  plugWeight = plugWeightResult.weight;
  ...
}
```

**Replace with:**
```typescript
if (plugWeight) {
  currentProduct.plugWeight = plugWeight;
  currentProduct.plugTotalCost = plugWeight * plugMaterialPrice;
  bodySubAssemblyTotal += currentProduct.plugTotalCost;
}
```

---

## **CHANGE 6: Update Seal Ring Calculation (Lines 501-510)**

**Find:**
```typescript
if (plugWeightResult.hasSealRing) {
  ...
}
```

**Replace with:**
```typescript
// Seal ring calculation - only if series.hasSealRing && sealType selected
if (selectedSeries?.hasSealRing && currentProduct.hasSealRing && currentProduct.sealType) {
  const sealRingPrice = await getSealRingPrice(
    currentProduct.seriesNumber,
    currentProduct.sealType,
    currentProduct.size,
    currentProduct.rating
  );
  
  if (sealRingPrice) {
    currentProduct.sealRingFixedPrice = sealRingPrice;
    currentProduct.sealRingTotalCost = sealRingPrice;
    bodySubAssemblyTotal += sealRingPrice;
  }
}
```

**Note:** You'll need to add to imports:
```typescript
import { getSealRingPrice, getAvailableSealTypes } from '@/lib/firebase/productConfigHelper';
```

---

## **CHANGE 7: Update Product Add (Line 727)**

**Find:**
```typescript
          plugType: p.plugType,
```

**Delete this entire line** (plugType no longer exists in QuoteProduct)

---

## **CHANGE 8: Remove Plug Type Dropdown (Lines 1054-1070)**

**Find this entire section:**
```tsx
{/* Plug Type */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Plug Type *
  </label>
  <select
    value={currentProduct.plugType || ''}
    onChange={(e) => setCurrentProduct({ ...currentProduct, plugType: e.target.value as any })}
    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
    required
  >
    <option value="">Select plug type...</option>
    {availablePlugTypes.map((type) => (
      <option key={type} value={type}>
        {type}
      </option>
    ))}
  </select>
</div>
```

**Delete the entire section** (Plug no longer has a type dropdown)

---

## **CHANGE 9: Update Seal Ring Display (Line 1176)**

**Find:**
```tsx
{currentProduct.hasSealRing && currentProduct.plugType && (
```

**Replace with:**
```tsx
{currentProduct.hasSealRing && currentProduct.sealType && (
```

---

## **CHANGE 10: Add Seal Ring Section UI**

**After the Cage section** (around line 1300-1400, after cage checkbox/inputs), **add:**

```tsx
{/* Seal Ring Section - Only shows if series.hasSealRing */}
{selectedSeries?.hasSealRing && (
  <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
    <div className="flex items-center gap-3 mb-4">
      <input
        type="checkbox"
        id="hasSealRing"
        checked={currentProduct.hasSealRing || false}
        onChange={(e) => {
          setCurrentProduct({
            ...currentProduct,
            hasSealRing: e.target.checked,
            sealType: e.target.checked ? currentProduct.sealType : undefined,
            sealRingFixedPrice: e.target.checked ? currentProduct.sealRingFixedPrice : undefined,
            sealRingTotalCost: e.target.checked ? currentProduct.sealRingTotalCost : undefined,
          });
        }}
        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
      />
      <label htmlFor="hasSealRing" className="text-sm font-medium text-gray-900">
        Include Seal Ring
      </label>
    </div>

    {currentProduct.hasSealRing && (
      <div className="space-y-4">
        {/* Seal Type Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Seal Type *
          </label>
          <select
            value={currentProduct.sealType || ''}
            onChange={async (e) => {
              const sealType = e.target.value;
              setCurrentProduct({ ...currentProduct, sealType });
              
              // Auto-fetch seal ring price
              if (sealType && currentProduct.seriesNumber && currentProduct.size && currentProduct.rating) {
                const price = await getSealRingPrice(
                  currentProduct.seriesNumber,
                  sealType,
                  currentProduct.size,
                  currentProduct.rating
                );
                
                if (price) {
                  setCurrentProduct(prev => ({
                    ...prev,
                    sealRingFixedPrice: price,
                    sealRingTotalCost: price,
                  }));
                }
              }
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            required={currentProduct.hasSealRing}
          >
            <option value="">Select seal type...</option>
            {availableSealTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Display Seal Ring Price */}
        {currentProduct.sealRingFixedPrice && (
          <div className="flex justify-between items-center p-3 bg-purple-100 rounded">
            <span className="text-sm font-medium text-gray-700">Fixed Price:</span>
            <span className="text-sm font-semibold text-purple-700">
              ₹{currentProduct.sealRingFixedPrice.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    )}
  </div>
)}
```

---

## **CHANGE 11: Load Seal Types When Needed**

**Add to your useEffect or options loading section (around line 200-220):**

```typescript
// Load seal types if series has seal ring
if (selectedSeries?.hasSealRing && seriesNumber && size && rating) {
  const sealTypes = await getAvailableSealTypes(seriesNumber, size, rating);
  setAvailableSealTypes(sealTypes);
}
```

---

## **✅ SUMMARY OF CHANGES:**

1. ✅ Import: `getAvailablePlugTypes` → `getAvailableSealTypes`
2. ✅ State: `availablePlugTypes` → `availableSealTypes`
3. ✅ Validation: Remove plugType check
4. ✅ Load options: Remove getAvailablePlugTypes call
5. ✅ Plug calculation: Remove plugType parameter  
6. ✅ Seal ring calculation: Use sealType + getSealRingPrice
7. ✅ Product add: Remove plugType field
8. ✅ UI: Remove plug type dropdown
9. ✅ UI: Update seal ring condition
10. ✅ UI: Add seal ring section
11. ✅ Logic: Load seal types when needed

---

## **🎯 AFTER ALL CHANGES:**

- Plug: No type, just select material
- Seal Ring: Separate section with checkbox + type dropdown
- Only shows if series.hasSealRing = true
- Independent pricing

---

**Copy each change and apply systematically. Test after major sections!**
