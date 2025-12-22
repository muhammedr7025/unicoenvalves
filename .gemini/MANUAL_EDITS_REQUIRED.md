# 🔧 **MANUAL EDITS REQUIRED**

Due to file complexity, please make these manual edits:

---

## **FILE 1: `/lib/firebase/pricingService.ts`**

### **Edit 1: Plug Weights Import (Lines 390-433)**

**Find this section starting at line 390:**
```typescript
console.log('Importing plug weights...');
// Import plug weights (unique key: seriesId + size + rating + plugType)
```

**Replace the ENTIRE for loop (lines 392-433) with the code from:**
``.gemini/code_snippets/plug_import.ts``

**Key Changes:**
- Remove: `plugType`, `hasSealRing`, `sealRingPrice` extractions
- Remove: `plugType` from query
- Remove: `plugType`, `hasSealRing`, `sealRingPrice` from newData

---

### **Edit 2: Seal Ring Prices Import (Lines 561-602)**

**Find this section starting at line 561:**
```typescript
console.log('Importing seal ring prices...');
// Import seal ring prices (unique key: seriesId + plugType + size + rating)
```

**Replace the ENTIRE if block (lines 563-602) with the code from:**
``.gemini/code_snippets/seal_import.ts``

**Key Changes:**
- Change: `item['Plug Type']` → `item['Seal Type']`
- Change: `plugType` →Human `sealType` everywhere (5 places)

---

## **FILE 2: `/utils/pricingExport.ts`**

### **Edit 3: Plug Weights Export (Around line 100-120)**

**Find:**
```typescript
const plugWeightsData = [
  ['Series Number', 'Size', 'Rating', 'Plug Type', 'Weight (kg)', ...
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

---

### **Edit 4: Seal Ring Prices Export (Around line 140-160)**

**Find:**
```typescript
const sealRingPricesData = [
  ['Series Number', 'Plug Type', 'Size', 'Rating', ...
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

---

## **AFTER THESE 4 EDITS:**

✅ Save all files  
✅ Check for TypeScript errors  
✅ The data layer will be complete!  

Then we move to UI pages (new-quote, edit-quote).

---

**CODE SNIPPETS LOCATION:**
- Plug import: `.gemini/code_snippets/plug_import.ts`
- Seal import: `.gemini/code_snippets/seal_import.ts`
