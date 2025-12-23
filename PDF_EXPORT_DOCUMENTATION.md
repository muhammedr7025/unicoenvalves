# PDF Export System Documentation

## Overview

The PDF export system now provides **3 professional export options** for quotes, matching the exact design from your reference PDFs:

1. **Cover Letter Only** - Formal offer covering letter
2. **Price Summary Only** - Pricing details with commercial terms
3. **Complete Quote** - Both cover letter and price summary combined

## Features

### 📄 Cover Letter PDF
- Professional company header with GST and CIN details
- Date and location
- Customer address block
- Subject line and reference information
- Formal business letter format
- Offer components list
- Employee signature section
- Page footer with disclaimer

### 💰 Price Summary PDF
- Professional company header
- Quote information table (Customer, Ref, Date, Project, Revision)
- Detailed item table with:
  - Serial Number
  - Tag Number
  - Item Description (Series, Size, Rating)
  - Unit Price
  - Quantity
  - Total Price
- Price breakdown:
  - Ex-Works Price
  - Packing Charges (0.6%)
  - IGST (18%)
  - Grand Total
- Commercial Terms & Conditions table
- Signature section

### 📑 Complete Quote PDF
- Combines both Cover Letter and Price Summary
- Multi-page professional document
- Consistent headers and footers across all pages
- Page numbers

## Design Elements Matching Reference PDFs

### Typography
- **Company Name**: 11pt Bold, Dark Blue (#00008B)
- **Headings**: 14pt Bold, Dark Blue
- **Subheadings**: 11pt Bold
- **Body Text**: 9-10pt Regular
- **Footer Text**: 7pt Italic, Gray

### Layout
- **Page Size**: A4 (595 x 842 pt)
- **Margins**: 50pt left/right, 90pt top, 25pt bottom
- **Header**: Centered company information with horizontal line
- **Footer**: Disclaimer text and page numbers

### Colors
- **Primary Blue**: RGB(0, 0, 139) for headers
- **Red Accent**: RGB(220, 20, 60) for icons in UI
- **Text Black**: RGB(0, 0, 0)
- **Gray**: RGB(100, 100, 100) for footer

### Tables
- **Grid Style**: For pricing tables with borders
- **Plain Style**: For information blocks
- **Header**: Dark blue background (#00008B) with white text
- **Cell Padding**: 5-6pt
- **Line Color**: Light gray (200, 200, 200)

## Company Information

All PDFs include standardized company details:

```typescript
const COMPANY = {
  name: 'UNICORN VALVES PRIVATE LIMITED',
  address: 'SF No: 100/2B, Valukkuparai P.O., Marichettipathy Road, Nachipalayam,',
  city: 'Madukkarai Taluk, Coimbatore - 641 032, Tamil Nadu, India.',
  phone: 'Ph No. +91-422-2901322',
  email: 'sales@unicorn-valves.com',
  website: 'www.unicorn-valves.com',
  gst: 'GSTIN: 33AAGCU9544D1ZT',
  cin: 'CIN: U29199TN2015PTC099699',
};
```

## Usage

### From Quote Details Page

Navigate to any quote and click the **"Export PDF"** dropdown button:

```tsx
// The dropdown appears on hover
<div className="relative group">
  <button>Export PDF ▼</button>
  <div className="dropdown">
    <button onClick={() => handlePDFExport('cover')}>
      Cover Letter Only
    </button>
    <button onClick={() => handlePDFExport('pricing')}>
      Price Summary Only
    </button>
    <button onClick={() => handlePDFExport('both')}>
      Complete Quote
    </button>
  </div>
</div>
```

### Programmatic Usage

```typescript
import { exportQuotePDF, PDFExportType } from '@/utils/pdfExporter';

// Export specific type
const handleExport = async (type: PDFExportType) => {
  // Fetch quote and customer data
  const quote = await getQuote(quoteId);
  const customer = await getCustomer(quote.customerId);
  
  // Export PDF
  exportQuotePDF(quote, customer, type);
};

// Export cover letter only
handleExport('cover');

// Export pricing only
handleExport('pricing');

// Export both 
handleExport('both');
```

### Individual Functions

You can also use individual generator functions:

```typescript
import { 
  generateCoverLetterPDF,
  generatePriceSummaryPDF,
  generateCombinedPDF 
} from '@/utils/pdfExporter';

// Generate individual PDFs
generateCoverLetterPDF(quote, customerDetails);
generatePriceSummaryPDF(quote, customerDetails);
generateCombinedPDF(quote, customerDetails);
```

## File Structure

```
utils/
├── pdfExporter.ts          # New comprehensive PDF export system
└── quotePDFGenerator.ts    # Deprecated (kept for backwards compatibility)
```

## Files Generated

The PDFs are automatically named based on the quote number and type:

- **Cover Letter**: `QUOTE-XXX-2024_CoverLetter.pdf`
- **Price Summary**: `QUOTE-XXX-2024_PriceSummary.pdf`
- **Complete**: `QUOTE-XXX-2024_Complete.pdf`

## Data Requirements

### Quote Object
Required fields from the Quote interface:
```typescript
{
  quoteNumber: string;
  customerName: string;
  projectName?: string;
  enquiryId?: string;
  createdAt: Date;
  createdByName: string;
  products: QuoteProduct[];
  subtotal: number;
  taxAmount: number;
  total: number;
}
```

### Customer Details Object
Required fields:
```typescript
{
  name: string;
  address?: string;
  country?: string;
}
```

## Pricing Calculations

The PDF includes automatic calculations:

1. **Subtotal**: Sum of all product line totals
2. **Packing Charges**: 0.6% of subtotal
3. **IGST**: 18% tax as stored in quote
4. **Grand Total**: Subtotal + Packing + IGST

## Commercial Terms

Standard terms included in Price Summary:

- **Prices**: Ex-Works INR each net
- **Validity**: 30 days from quotation date
- **Delivery**: 24 working weeks from advance payment
- **Warranty**: 18 months from shipping or 12 months from installation
- **Payment**: 20% advance + 30% against drawings + Balance before dispatch
- **Freight**: To be borne by buyer
- **Insurance**: To be arranged by buyer
- **Manufacturer**: Unicorn Valves Private Limited

## UI/UX Features

### Dropdown Menu
- **Hover to Open**: Menu appears on button hover
- **Visual Icons**: Each option has a distinct icon
- **Descriptions**: Clear subtitle for each export type
- **Smooth Transitions**: 200ms opacity and visibility transitions
- **High Z-Index**: Ensures dropdown appears above other elements

### Responsive Design
- **Mobile Friendly**: Button and dropdown work on touch devices
- **Accessible**: Clear labels and color contrast
- **Professional**: Matches overall application design language

## Future Enhancements

Potential improvements:

1. **Custom Logo Upload**: Replace default company info with uploaded logo
2. **Template Configuration**: Allow customization of terms and conditions
3. **Multi-Language Support**: Generate PDFs in different languages
4. **Digital Signatures**: Add digital signature capability
5. **Email Integration**: Direct email sending of PDFs
6. **Preview Mode**: Show PDF preview before download
7. **Batch Export**: Export multiple quotes at once
8. **Custom Watermarks**: Add draft/final watermarks

## Troubleshooting

### PDF Not Generating
- Ensure quote object has all required fields
- Check that customer details are available
- Verify browser allows downloads

### Formatting Issues
- If tables overflow, check product description lengths
- Ensure all monetary values are valid numbers
- Verify date objects are properly formatted

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge) are fully supported
- PDF generation happens client-side using jsPDF library
- No server-side processing required

## Dependencies

- **jsPDF**: ^3.0.4 - PDF generation
- **jspdf-autotable**: ^5.0.2 - Table formatting

These are already installed in the project.

## Support

For issues or feature requests related to PDF export, please contact the development team or create an issue in the project repository.

---

**Last Updated**: December 23, 2024
**Version**: 1.0.0
