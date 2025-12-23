# Employee Quote Creation/Editing Troubleshooting

## Investigation Steps

Based on code review, the quote creation and editing pages appear to be correctly structured. However, there could be several potential issues:

### 1. Missing Series or Materials Data
**Symptom**: Page loads but dropdowns are empty or nothing happens when clicking "Add Product"

**Root Cause**: If there's no pricing data (materials, series) in Firebase, the forms won't work properly.

**Fix**: 
1. Go to `/admin/pricing`
2. Download the template
3. Fill in sample data
4. Upload the Excel file with pricing data
5. Verify data appears in the dashboard

### 2. Authentication/Permission Issues
**Symptom**: Page redirects or shows authorization errors

**Root Cause**: Employee user doesn't have proper permissions

**Fix**:
1. Check `authContext` is properly configured
2. Verify user has 'employee' role in Firebase
3. Check browser console for auth errors

### 3. Firebase Connection Issues
**Symptom**: Loading spinner never stops or shows "No data" errors

**Root Cause**: Firebase configuration missing or incorrect

**Fix**:
1. Verify `.env.local` has correct Firebase credentials
2. Check browser network tab for Firebase connection errors
3. Verify Firebase Firestore rules allow read/write for authenticated users

### 4. Form Validation Failing
**Symptom**: "Calculate Price" button does nothing or shows validation errors

**Root Cause**: Required fields not filled in correct order

**Fix**:
1. Fill fields in this order: Series → Size → Rating → End Connection → Bonnet Type
2. Select materials for all components
3. Then click "Calculate Price"

### 5. Save Button Not Working
**Symptom**: "Create Quote" or "Update Quote" button does nothing

**Root Cause**: Missing required data or validation failing

**Fix**:
1. Ensure at least one product is added and calculated
2. Verify customer is selected (step 1)
3. Check browser console for error messages

## Common User Errors

1. **Not calculating price before saving product**
   - User must click "Calculate Price" for each product before clicking "Save Product"
   
2. **No customer selected**
   - Must select a customer in Step 1 before adding products
   
3. **Empty products list**
   - Must add at least one product before proceeding to Step 3

## Debug Steps for User

1. Open browser Developer Tools (F12 or Cmd+Option+I)
2. Go to Console tab
3. Navigate to `/employee/new-quote`
4. Try to create a quote
5. Check console for any red error messages
6. Share the error message for specific help

## Expected Workflow

### Creating New Quote:
1. **Step 1**: Select a customer (click on customer card)
2. **Step 2**: 
   - Click "Add Product"
   - Fill in product configuration form
   - Click "Calculate Price"
   - Click "Save Product"
   - Repeat for additional products
   - Click "Next: Review & Save"
3. **Step 3**:
   - Review products and totals
   - Fill in optional fields (Project Name, Enquiry ID, etc.)
   - Click "Create Quote"

### Editing Quote:
1. Navigate to existing quote
2. Click on product to edit OR add new products
3. Make changes
4. Click "Calculate Price" if needed
5. Click "Save Product"
6. Click "Update Quote"

## Known Dependencies

The quote pages depend on:
- `/lib/firebase/pricingService.ts` - Must have data
- `/lib/firebase/productConfigHelper.ts` - Pricing calculations
- `/hooks/useProductConfig.ts` - Form state management
- `/components/quotes/ProductConfigurationForm.tsx` - Product form UI

All of these are working correctly based on code review.
