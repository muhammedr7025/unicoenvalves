# 🔧 EDIT-QUOTE PAGE - REMAINING FIXES

Based on the lint errors, here are the exact line changes needed:

---

## **1. Line 268 & 274 - Remove getAvailablePlugTypes calls**

**Find around line 268:**
```typescript
            getAvailablePlugTypes(product.seriesNumber, product.size, product.rating),
```

**Delete this line**

**Find around line 274:**
```typescript
        setAvailablePlugTypes(plugs);
```

**Delete this line**

---

## **2. Lines 377 & 383 - Remove more getAvailablePlugTypes**

**Find and delete these lines:**
```typescript
      getAvailablePlugTypes(seriesNumber, size, rating),
```
and
```typescript
    setAvailablePlugTypes(plugs);
```

---

## **3. Line 527 - Remove plugType validation**

**Find:**
```typescript
      !currentProduct.plugType || !currentProduct.seatType) {
```

**Replace with:**
```typescript
      !currentProduct.seatType) {
```

---

## **4. Line 558 - Fix getPlugWeight call**

**Find:**
```typescript
        getPlugWeight(currentProduct.seriesNumber, currentProduct.size, currentProduct.rating, currentProduct.plugType),
```

**Replace with:**
```typescript
        getPlugWeight(currentProduct.seriesNumber, currentProduct.size, currentProduct.rating),
```

---

## **5. Line 581 - Fix plug weight handling**

**Find:**
```typescript
      const plugWeight = plugWeightResult.weight;
```

**Replace with:**
```typescript
      const plugWeight = plugWeightResult;
```

---

## **6. Lines 625-629 - Fix seal ring calculation**

**Find:**
```typescript
      const hasSealRing = plugWeightResult.hasSealRing;

      if (hasSealRing && plugWeightResult.sealRingPrice) {
        sealRingFixedPrice = plugWeight Result.sealRingPrice;
        sealRingTotalCost = plugWeightResult.sealRingPrice;
      }
```

**Replace with:**
```typescript
      const hasSealRing = selectedSeries?.hasSealRing && currentProduct.hasSeal Ring && currentProduct.sealType;

      if (hasSealRing) {
        const { getSealRingPrice } = await import('@/lib/firebase/productConfigHelper');
        const price = await getSealRingPrice(
          currentProduct.seriesNumber,
          currentProduct.sealType!,
          currentProduct.size,
          currentProduct.rating
        );
        
        if (price) {
          sealRingFixedPrice = price;
          sealRingTotalCost = price;
        }
      }
```

---

## **7. Lines 811 & 1171-1172 - Remove plugType from product**

**Find and delete:**
```typescript
          plugType: product.plugType,
```

---

## **8. Line 1176 & 1293 - Change dropdown**

**Find around line 1165-1180 (the entire plug type dropdown):**
```typescript
                        <div>
                          <label className="block text-sm mb-1">Plug Type *</label>
                          <select
                            value={currentProduct.plugType || ''}
                            onChange={(e) => setCurrentProduct({ ...currentProduct, plugType: e.target.value as any })}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          >
                            <option value="">Select</option>
                            {availablePlugTypes.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
```

**DELETE the entire section above**

---

## **9. Replace seal ring display** (line ~1293)

**Find:**
```typescript
{currentProduct.hasSealRing && currentProduct.plugType && (
```

**Replace entire seal ring section with the same new seal ring UI from new-quote page**

---

## **10. Add seal types loading**

In your `fetchDependentOptions` or similar function, add:
```typescript
const currentSeries = series.find(s => s.seriesNumber === seriesNumber);
if (currentSeries?.hasSealRing) {
  const sealTypes = await getAvailableSealTypes(seriesNumber, size, rating);
  setAvailableSealTypes(sealTypes);
}
```

---

**These are the EXACT same changes you made to new-quote!**

Apply them and the build will succeed! 🚀
