# 🔄 **PLUG & SEAL REFACTORING - COMPLETE IMPLEMENTATION GUIDE**

## **📋 OVERVIEW:**

This document provides step-by-step instructions to complete the plug and seal ring refactoring.

---

## **✅ ALREADY COMPLETED:**

### **1. Data Models** (`types/index.ts`) ✅
- Removed `plugType` from `QuoteProduct`
- Added `sealType?: string` to `QuoteProduct`
- Updated `SealRingPrice` interface: `plugType` → `sealType`

### **2. Helper Functions** (`lib/firebase/productConfigHelper.ts`) ✅
- **Removed:** `PlugWeightResult` interface
- **Updated:** `getPlugWeight(series, size, rating)` - 3 params, returns `number | null`
- **Updated:** `getSealRingPrice(series, sealType, size, rating)` - uses `sealType`
- **Removed:** `getAvailablePlugTypes()`
- **Added:** `getAvailableSealTypes(series, size, rating)`

### **3. Excel Template** (`utils/excelTemplate.ts`) ✅
- **Plug Weights sheet:** Removed Plug Type, Has Seal Ring, Seal Ring Price columns
  - Now: `['Series Number', 'Size', 'Rating', 'Weight (kg)', 'Active']`
- **Seal Ring Prices sheet:** Created new separate sheet with Seal Type
  - Columns: `['Series Number', 'Seal Type', 'Size', 'Rating', 'Fixed Price', 'Active']`

---

## **⏳ REMAINING TASKS:**

### **TASK 1: Update Pricing Import** (`lib/firebase/pricingService.ts`)

#### **A. Plug Weights Import (Line ~390-433)**

**Find this section:**
```typescript
console.log('Importing plug weights...');
// Import plug weights (unique key: seriesId + size + rating + plugType)
```

**Replace with:**
```typescript
console.log('Importing plug weights...');
// Import plug weights (unique key: seriesId + size + rating)
for (const item of data.plugWeights) {
  try {
    const seriesId = String(item['Series Number']).trim();
    const size = String(item.Size).trim();
    const rating = String(item.Rating).trim();
    
    const existingQuery = query(
      collection(db, 'plugWeights'),
      where('seriesId', '==', seriesId),
      where('size', '==', size),
      where('rating', '==', rating)
    );
    const existingDocs = await getDocs(existingQuery);
    
    const newData = {
      seriesId,
      size,
      rating,
      weight: parseFloat(item['Weight (kg)']) || 0,
      isActive: String(item.Active).toUpperCase() === 'TRUE',
    };
    
    if (!existingDocs.empty) {
      const docRef = doc(db, 'plugWeights', existingDocs.docs[0].id);
      await updateDoc(docRef, newData);
      stats.updated++;
    } else {
      await addDoc(collection(db, 'plugWeights'), newData);
      stats.added++;
    }
  } catch (error) {
    console.error('Error processing plug weight:', error);
    stats.errors++;
  }
}
```

**Key Changes:**
- ❌ Remove `plugType` extraction
- ❌ Remove `hasSealRing` extraction
- ❌ Remove `sealRingPrice` extraction
- ❌ Remove `plugType` from query
- ✅ Keep only: seriesId, size, rating, weight, isActive

---

#### **B. Seal Ring Prices Import (Line ~570-610)**

**Find this section:**
```typescript
console.log('Importing seal ring prices...');
// Import seal ring prices (unique key: seriesId + plugType + size + rating)
```

**Replace with:**
```typescript
console.log('Importing seal ring prices...');
// Import seal ring prices (unique key: seriesId + sealType + size + rating)
if (data.sealRingPrices && data.sealRingPrices.length > 0) {
  for (const item of data.sealRingPrices) {
    try {
      const seriesId = String(item['Series Number']).trim();
      const sealType = String(item['Seal Type']).trim();  // CHANGED
      const size = String(item.Size).trim();
      const rating = String(item.Rating).trim();
      
      const existingQuery = query(
        collection(db, 'sealRingPrices'),
        where('seriesId', '==', seriesId),
        where('sealType', '==', sealType),  // CHANGED
        where('size', '==', size),
        where('rating', '==', rating)
      );
      const existingDocs = await getDocs(existingQuery);
      
      const newData = {
        seriesId,
        sealType,  // CHANGED
        size,
        rating,
        fixedPrice: parseFloat(item['Fixed Price']) || 0,
        isActive: String(item.Active).toUpperCase() === 'TRUE',
      };
      
      if (!existingDocs.empty) {
        const docRef = doc(db, 'sealRingPrices', existingDocs.docs[0].id);
        await updateDoc(docRef, newData);
        stats.updated++;
      } else {
        await addDoc(collection(db, 'sealRingPrices'), newData);
        stats.added++;
      }
    } catch (error) {
      console.error('Error processing seal ring price:', error);
      stats.errors++;
    }
  }
}
```

**Key Changes:**
- ✅ `plugType` → `sealType` everywhere

---

### **TASK 2: Update Pricing Export** (`utils/pricingExport.ts`)

#### **A. Plug Weights Export (Line ~100-120)**

**Find this section:**
```typescript
const plugWeightsData = [
  ['Series Number', 'Size', 'Rating', 'Plug Type', 'Weight (kg)', ...],
```

**Replace with:**
```typescript
const plugWeightsData = [
  ['Series Number', 'Size', 'Rating', 'Weight (kg)', 'Active'],
  ...plugWeights.map((p: any) => [
    p.seriesId,
    p.size,
    p.rating,
    p.weight,
    p.isActive ? 'TRUE' : 'FALSE'
  ])
];
```

**Key Changes:**
- ❌ Remove Plug Type column
- ❌ Remove Has Seal Ring column  
- ❌ Remove Seal Ring Price column

---

#### **B. Seal Ring Prices Export (Line ~140-160)**

**Find this section:**
```typescript
const sealRingPricesData = [
  ['Series Number', 'Plug Type', 'Size', 'Rating', ...],
```

**Replace with:**
```typescript
const sealRingPricesData = [
  ['Series Number', 'Seal Type', 'Size', 'Rating', 'Fixed Price', 'Active'],
  ...sealRingPrices.map((s: any) => [
    s.seriesId,
    s.sealType,  // CHANGED from s.plugType
    s.size,
    s.rating,
    s.fixedPrice,
    s.isActive ? 'TRUE' : 'FALSE'
  ])
];
```

**Key Changes:**
- ✅ `'Plug Type'` → `'Seal Type'` in header
- ✅ `s.plugType` → `s.sealType` in mapping

---

### **TASK 3: Update New Quote Page** (`app/employee/new-quote/page.tsx`)

This is the largest change. Follow systematically:

#### **A. Update Imports (Line ~15)**

**Find:**
```typescript
import { getAvailablePlugTypes } from '@/lib/firebase/productConfigHelper';
```

**Replace with:**
```typescript
import { getAvailableSealTypes } from '@/lib/firebase/productConfigHelper';
```

---

#### **B. Update State Variables (Line ~76)**

**Find:**
```typescript
const [availablePlugTypes, setAvailablePlugTypes] = useState<string[]>([]);
```

**Replace with:**
```typescript
const [availableSealTypes, setAvailableSealTypes] = useState<string[]>([]);
```

---

#### **C. Remove Plug Type from Product State (Line ~401)**

**Find:**
```typescript
plugType: currentProduct.plugType,
```

**Remove this line** (plugType no longer exists)

---

#### **D. Update Load Options Function (Line ~206-212)**

**Find:**
```typescript
getAvailablePlugTypes(seriesNumber, size, rating),
```

**Remove this line**, and remove:
```typescript
setAvailablePlugTypes(plugs);
```

**Add instead:**
```typescript
// Seal types will be loaded separately when hasSealRing is true
```

---

#### **E. Update Plug Calculation (Line ~434-460)**

**Find:**
```typescript
const plugWeightResult = await getPlugWeight(
  currentProduct.seriesNumber,
  currentProduct.size,
  currentProduct.rating,
  currentProduct.plugType  // ❌ REMOVE THIS
);

if (plugWeightResult) {
  plugWeight = plugWeightResult.weight;  // ❌ CHANGE
  ...
}
```

**Replace with:**
```typescript
const plugWeight = await getPlugWeight(
  currentProduct.seriesNumber,
  currentProduct.size,
  currentProduct.rating
);

if (plugWeight) {
  currentProduct.plugWeight = plugWeight;
  currentProduct.plugTotalCost = plugWeight * plugMaterialPrice;
  bodySubAssemblyTotal += currentProduct.plugTotalCost;
}
```

---

#### **F. Update Seal Ring Calculation (Line ~501-510)**

**Find:**
```typescript
if (plugWeightResult.hasSealRing) {
  ...
}
```

**Replace with:**
```typescript
// Seal ring calculation moved to separate section
// Only calculate if currentProduct.hasSealRing && currentProduct.sealType
if (currentProduct.hasSealRing && currentProduct.sealType) {
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

---

#### **G. Remove Plug Type Dropdown from UI (Line ~1054-1070)**

**Find:**
```typescript
{/* Plug Type */}
<div>
  <label>Plug Type</label>
  <select
    value={currentProduct.plugType}
    onChange={(e) => setCurrentProduct({ ...currentProduct, plugType: e.target.value })}
  >
    ...
  </select>
</div>
```

**Remove entire section**

---

#### **H. Add Seal Ring Section to UI (After Cage section, Line ~1400+)**

**Add new section:**
```tsx
{/* Seal Ring - Shows only if series.hasSealRing */}
{selectedSeries?.hasSealRing && (
  <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
    <div className="flex items-center gap-2">
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
        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
      />
      <label htmlFor="hasSealRing" className="text-sm font-medium text-gray-700">
        Include Seal Ring
      </label>
    </div>

    {currentProduct.hasSealRing && (
      <>
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
          <div className="text-sm text-gray-600">
            Fixed Price: ₹{currentProduct.sealRingFixedPrice.toLocaleString()}
          </div>
        )}
      </>
    )}
  </div>
)}
```

---

#### **I. Load Seal Types** (Add useEffect or inline loading)

When series, size, rating change AND series.hasSealRing is true, load seal types:

```typescript
// Add to your options loading effect
if (selectedSeries?.hasSealRing && currentProduct.size && currentProduct.rating) {
  const sealTypes = await getAvailableSealTypes(
    currentProduct.seriesNumber,
    currentProduct.size,
    currentProduct.rating
  );
  setAvailableSealTypes(sealTypes);
}
```

---

### **TASK 4: Update Edit Quote Page** (`app/employee/edit-quote/[id]/page.tsx`)

**Apply all the same changes as new-quote page:**
- Update imports
- Update state
- Remove plugType references
- Update calculations
- Remove plug type dropdown
- Add seal ring section

---

### **TASK 5: Test Everything**

1. ✅ Download new Excel template
2. ✅ Fill with sample data (no plug types, separate seal types)
3. ✅ Import pricing
4. ✅ Create a quote
5. ✅ Verify plug has no type selection
6. ✅ Verify seal ring appears as separate section
7. ✅ Verify pricing calculates correctly

---

## **🎯 SUMMARY OF CHANGES:**

### **Plug:**
- ❌ NO type selection
- ✅ Just weight lookup by series+size+rating
- ✅ Material selection remains

### **Seal Ring:**
- ✅ Separate sub-assembly section
- ✅ Shows only if series.hasSealRing = true
- ✅ Has its own type dropdown
- ✅ Fixed price by series+sealType+size+rating
- ✅ Checkbox to include/exclude

---

## **📝 NOTES:**

- Old quotes with plugType will still load (graceful degradation)
- New quotes won't have plugType
- Template changed - users must re-upload pricing
- Seal ring is truly independent now

---

**Ready to implement in next session!** 🚀
