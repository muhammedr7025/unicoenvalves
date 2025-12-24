# Quote Settings Fields Implementation

## Overview
Added new quote-level settings fields for PDF generation and quote management. These fields are saved with the quote and will be used when generating pricing PDFs.

## New Fields Added

### 1. Custom Quote Number
- **Field**: `customQuoteNumber`
- **Type**: Text input
- **Purpose**: Override the auto-generated quote number with a custom one
- **Default**: Empty (uses auto-generated number)

### 2. Validity Period
- **Field**: `validity`
- **Type**: Dropdown
- **Options**: 15 days, 30 days, 45 days, 50 days, 60 days, 90 days
- **Default**: 30 days
- **Purpose**: Quote validity period for customer reference

### 3. Warranty Terms
- **Fields**: `warrantyTerms.shipmentDays`, `warrantyTerms.installationDays`
- **Type**: Number inputs (in months)
- **Default**: 12 months each
- **Purpose**: Warranty periods for shipment and installation

### 4. Delivery Timeline
- **Field**: `deliveryDays`
- **Type**: Text input (custom value)
- **Example**: "4-6 weeks"
- **Purpose**: Estimated delivery timeline

### 5. Payment Terms
- **Fields**: 
  - `paymentTerms.advancePercentage` - Advance payment percentage
  - `paymentTerms.approvalPercentage` - On approval percentage  
  - `paymentTerms.customTerms` - Custom payment terms (optional)
- **Type**: Number inputs (percentages) + text
- **Default**: 30% advance, 70% on approval
- **Purpose**: Payment structure for the quote

### 6. Currency Exchange Rate
- **Field**: `currencyExchangeRate`
- **Type**: Number input
- **Purpose**: For international customers (non-India), specify USD to INR rate
- **Note**: Only shown when customer is from outside India

### 7. Pricing Type
- **Field**: `pricingType`
- **Type**: Dropdown
- **Options**: Ex-Works, FOR (Freight on Road)
- **Default**: Ex-Works
- **Purpose**: Defines pricing basis

## Files Modified

1. **types/index.ts**
   - Added `ValidityPeriod` type
   - Added `PricingType` type
   - Added `PaymentTerms` interface
   - Added `WarrantyTerms` interface
   - Extended `Quote` interface with new fields

2. **app/employee/new-quote/page.tsx**
   - Added state variables for all new fields
   - Updated save function to include new fields
   - Added UI components for entering all new settings

3. **app/employee/edit-quote/[id]/page.tsx**
   - Added state variables for all new fields
   - Updated fetch function to load existing values
   - Updated save function to include new fields
   - Added UI components matching new-quote page

4. **app/employee/quotes/[id]/page.tsx**
   - Added display for all new fields in the quote view
   - Styled display sections for warranty, delivery, payment terms, and currency

## UI Design
- **Warranty Section**: Blue gradient background with shipment/installation inputs
- **Payment Terms Section**: Green gradient background with advance/approval percentages
- **Currency Exchange Section**: Amber/yellow gradient, only shown for international customers
- **Visual validation**: Warning shown if payment percentages don't equal 100%

## Next Steps
When implementing the PDF generation, these fields can be accessed from the quote object:
- `quote.validity`
- `quote.warrantyTerms.shipmentDays`
- `quote.warrantyTerms.installationDays`
- `quote.deliveryDays`
- `quote.paymentTerms.advancePercentage`
- `quote.paymentTerms.approvalPercentage`
- `quote.paymentTerms.customTerms`
- `quote.currencyExchangeRate`
- `quote.pricingType`
- `quote.customQuoteNumber`
