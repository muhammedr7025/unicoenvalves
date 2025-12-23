# Pricing Data Management Updates

## Summary
Fixed the download template and added edit/delete functionality to the pricing data admin page.

## Changes Made

### 1. Fixed Excel Template (`utils/excelTemplate.ts`)
**Issue**: The download template contained incorrect columns for Plug Weights and Seat Weights sheets.

**Resolution**:
- ✅ Removed obsolete "Plug Type" column from Plug Weights sheet
- ✅ Removed obsolete "Seat Type" column from Seat Weights sheet
- ✅ Added separate "Cage Weights" sheet with proper columns (Series Number, Size, Rating, Weight, Active)
- ✅ Added separate "Seal Ring Prices" sheet with proper columns (Series Number, Seal Type, Size, Rating, Fixed Price, Active)
- ✅ Updated sheet numbering comments to reflect the new structure
- ✅ Template now matches the current data structure used in the application

**Template Structure (New)**:
1. Materials
2. Series
3. Body Weights
4. Bonnet Weights
5. Plug Weights (simplified - just weight data)
6. Seat Weights (simplified - just weight data)
7. Cage Weights (separate sheet)
8. Seal Ring Prices (separate sheet)
9. Stem Fixed Prices
10. Actuator Models
11. Handwheel Prices

### 2. Added Edit/Delete Functionality (`app/admin/pricing/page.tsx`)

**New Features**:

#### A. Edit Functionality
- ✅ Added "Edit" button to each row in the data table
- ✅ Created modal dialog for editing records
- ✅ Dynamic form fields based on data type (text, number, boolean)
- ✅ Save button with loading state
- ✅ Cancel button to close modal
- ✅ Automatic data refresh after successful edit

#### B. Delete Functionality
- ✅ Added "Delete" button to each row in the data table
- ✅ Confirmation dialog before deletion
- ✅ Automatic data refresh after successful deletion

#### C. UI Improvements
- ✅ Added "Actions" column to the data table
- ✅ Beautiful modal design with gradient header
- ✅ Responsive button layout
- ✅ Loading states for async operations
- ✅ Success/error feedback via alerts

### 3. Updated Pricing Service (`lib/firebase/pricingService.ts`)

**New Functions**:

```typescript
// Update a single pricing document
export async function updatePricingDocument(
  collectionName: string,
  docId: string,
  data: any
): Promise<void>

// Delete a single pricing document
export async function deletePricingDocument(
  collectionName: string,
  docId: string
): Promise<void>
```

## Testing Recommendations

1. **Template Download**:
   - Click "Download Template" button
   - Verify all sheets are present with correct columns
   - Check sample data matches expected structure

2. **Edit Functionality**:
   - Select any collection (Materials, Series, etc.)
   - Click "Edit" on a row
   - Modify values in the modal
   - Click "Save Changes"
   - Verify changes are reflected in the table

3. **Delete Functionality**:
   - Select any collection
   - Click "Delete" on a row
   - Confirm deletion
   - Verify row is removed from table

4. **Data Import**:
   - Download the template
   - Fill with test data
   - Upload via the "Upload Excel File" button
   - Verify data appears correctly in tables

## User Benefits

✨ **Correct Template**: Users can now download a template that matches the current data structure
✨ **Quick Edits**: No need to re-upload entire Excel file to fix a single typo
✨ **Easy Deletion**: Remove incorrect or obsolete records with a single click
✨ **Better UX**: Inline editing and deletion directly in the view section
✨ **Data Integrity**: Confirmation dialogs prevent accidental deletions

## Technical Notes

- All operations use Firebase Firestore batch writes for data consistency
- Modal uses React state management for form handling
- Dynamic form fields adapt to the data type of each field
- Loading states prevent multiple simultaneous operations
- Error handling with user-friendly alert messages
