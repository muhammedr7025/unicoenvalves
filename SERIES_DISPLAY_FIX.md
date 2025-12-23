# Series Display Fix

## Issue
In the pricing data dashboard, when viewing collections like Body Weights, Bonnet Weights, Plug Weights, Seat Weights, Stem Fixed Prices, Cage Weights, and Seal Ring Prices, the `seriesId` field was showing Firebase document IDs (e.g., `abc123xyz`) instead of the human-readable series numbers (e.g., `91000`, `92000`).

## Solution
Updated the pricing admin page to automatically map series IDs to series numbers for display.

## Changes Made

### 1. Added Series Mapping State (`app/admin/pricing/page.tsx`)

**New State Variable**:
```typescript
const [seriesMap, setSeriesMap] = useState<Map<string, string>>(new Map());
```

This creates a lookup table that maps Firebase document IDs to series numbers.

### 2. Updated `fetchStats` Function

**Before**: Series data was fetched but not mapped
**After**: Creates a Map of seriesId → seriesNumber

```typescript
// Build series map: seriesId -> seriesNumber
const newSeriesMap = new Map<string, string>();
series.forEach((s: any) => {
  newSeriesMap.set(s.id, s.seriesNumber);
});
setSeriesMap(newSeriesMap);
```

### 3. Updated Table Display

**Table Headers**:
- Changed column header from "Series Id" to "Series Number"

**Table Cells**:
- When displaying a `seriesId` field, the code now looks up the corresponding series number from the map
- Falls back to showing the ID if series number is not found

```typescript
// If this is a seriesId field, show the series number instead
if (header === 'seriesId' && displayValue) {
  displayValue = seriesMap.get(displayValue) || displayValue;
}
```

### 4. Updated Edit Modal

**Field Label**:
- Shows "Series Number" instead of "Series Id"

**Input Type**:
- Changed from text input to dropdown select for seriesId fields
- Dropdown lists all available series with their series numbers
- User selects by series number, but the actual seriesId is stored

```typescript
{isSeriesId ? (
  <select value={value} onChange={(e) => handleFormFieldChange(field, e.target.value)}>
    {Array.from(seriesMap.entries()).map(([id, number]) => (
      <option key={id} value={id}>{number}</option>
    ))}
  </select>
) : ...}
```

## User Benefits

✅ **Better Readability**: Users see familiar series numbers (like "91000") instead of cryptic Firebase IDs
✅ **Easier Editing**: Dropdown selection makes it impossible to enter an invalid series ID  
✅ **Consistent Display**: Series numbers are shown consistently across the entire admin interface
✅ **Data Integrity**: The underlying seriesId references remain intact, only the display is improved

## Example

### Before:
| Series Id | Size | Rating | Weight |
|-----------|------|--------|--------|
| abc123xyz | 1/2  | 150    | 2.5    |

### After:
| Series Number | Size | Rating | Weight |
|---------------|------|--------|--------|
| 91000         | 1/2  | 150    | 2.5    |

## Testing

1. Navigate to `/admin/pricing`
2. Select any collection that has seriesId field:
   - Body Weights
   - Bonnet Weights
   - Plug Weights
   - Seat Weights
   - Stem Fixed Prices
   - Cage Weights
   - Seal Ring Prices
3. Verify series numbers (like "91000") are displayed instead of document IDs
4. Click "Edit" on a row
5. Verify the Series Number field shows a dropdown with series numbers
6. Change the series and save
7. Verify the change is reflected correctly

## Technical Notes

- The seriesMap is populated once during stats fetching and reused for all displays
- The mapping is bidirectional-aware: displays series number but stores series ID
- No database schema changes required - this is purely a display enhancement
- Edit operations still use the correct seriesId internally
