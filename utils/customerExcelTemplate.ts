import * as XLSX from 'xlsx';

export function generateCustomerTemplate() {
  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Define headers
  const headers = [
    'Name *',
    'Email *',
    'Phone',
    'Company',
    'Address',
    'City',
    'State',
    'Country *',
    'Postal Code',
    'GST Number',
    'PAN Number',
    'Notes',
  ];

  // Sample data rows
  const sampleData = [
    [
      'John Doe',
      'john.doe@example.com',
      '+91 9876543210',
      'ABC Industries Pvt Ltd',
      '123 Industrial Area, Phase 1',
      'Mumbai',
      'Maharashtra',
      'India',
      '400001',
      '27AABCU9603R1ZM',
      'AABCU9603R',
      'VIP Customer - 10% discount on bulk orders',
    ],
    [
      'Jane Smith',
      'jane.smith@techcorp.com',
      '+91 9876543211',
      'Tech Corp Solutions',
      '456 Business Park, Sector 5',
      'Bangalore',
      'Karnataka',
      'India',
      '560001',
      '29AABCT1234E1Z5',
      'AABCT1234E',
      'New customer - requires advance payment',
    ],
    [
      'Robert Johnson',
      'robert@manufacturing.com',
      '+91 9876543212',
      'Johnson Manufacturing Ltd',
      '789 Factory Road',
      'Chennai',
      'Tamil Nadu',
      'India',
      '600001',
      '33AABCJ5678F1Z6',
      'AABCJ5678F',
      'Regular customer since 2020',
    ],
  ];

  // Combine headers and sample data
  const worksheetData = [headers, ...sampleData];

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths
  const colWidths = [
    { wch: 20 }, // Name
    { wch: 30 }, // Email
    { wch: 18 }, // Phone
    { wch: 30 }, // Company
    { wch: 35 }, // Address
    { wch: 15 }, // City
    { wch: 15 }, // State
    { wch: 15 }, // Country
    { wch: 12 }, // Postal Code
    { wch: 20 }, // GST Number
    { wch: 15 }, // PAN Number
    { wch: 40 }, // Notes
  ];
  ws['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Customers');

  // Instructions sheet
  const instructionsData = [
    ['CUSTOMER BULK IMPORT TEMPLATE - INSTRUCTIONS'],
    [],
    ['How to use this template:'],
    ['1. Fill in customer details in the "Customers" sheet'],
    ['2. Fields marked with * are required (Name, Email, Country)'],
    ['3. Email must be unique for each customer'],
    ['4. Phone numbers should include country code (e.g., +91 for India)'],
    ['5. GST Number format: 2 digits (state code) + 10 digits (PAN) + 1 digit (entity) + 1 letter (Z) + 1 digit (checksum)'],
    ['6. PAN Number format: 5 letters + 4 digits + 1 letter'],
    ['7. Save the file and upload it in the Admin Panel'],
    [],
    ['Field Descriptions:'],
    ['- Name: Full name of the customer (Required)'],
    ['- Email: Valid email address (Required, Must be unique)'],
    ['- Phone: Contact phone number with country code'],
    ['- Company: Company/Organization name'],
    ['- Address: Street address'],
    ['- City: City name'],
    ['- State: State/Province name'],
    ['- Country: Country name (Required)'],
    ['- Postal Code: ZIP/Postal code'],
    ['- GST Number: GST registration number (for Indian customers)'],
    ['- PAN Number: PAN card number (for Indian customers)'],
    ['- Notes: Any additional notes or special instructions'],
    [],
    ['Common Errors to Avoid:'],
    ['❌ Duplicate email addresses'],
    ['❌ Missing required fields (Name, Email, Country)'],
    ['❌ Invalid email format'],
    ['❌ Special characters in names'],
    [],
    ['Sample Data:'],
    ['The "Customers" sheet contains 3 sample rows.'],
    ['You can delete these rows and add your own customers.'],
    [],
    ['Need Help?'],
    ['Contact your system administrator for assistance.'],
  ];

  const instructionsWs = XLSX.utils.aoa_to_sheet(instructionsData);
  instructionsWs['!cols'] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(wb, instructionsWs, 'Instructions');

  // Generate Excel file and trigger download
  const fileName = 'Customer_Import_Template.xlsx';
  XLSX.writeFile(wb, fileName);
}

// Parse uploaded Excel file
export interface ParsedCustomer {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  postalCode?: string;
  gstNumber?: string;
  panNumber?: string;
  notes?: string;
}

export interface ParseResult {
  success: boolean;
  data: ParsedCustomer[];
  errors: string[];
}

export function parseCustomerExcel(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        // Get the first sheet (Customers sheet)
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (jsonData.length < 2) {
          resolve({
            success: false,
            data: [],
            errors: ['Excel file is empty or has no data rows'],
          });
          return;
        }

        const headers = jsonData[0];
        const dataRows = jsonData.slice(1);

        const customers: ParsedCustomer[] = [];
        const errors: string[] = [];
        const seenEmails = new Set<string>();

        dataRows.forEach((row, index) => {
          const rowNum = index + 2; // +2 because of 0-index and header row

          // Skip empty rows
          if (!row || row.every(cell => !cell)) {
            return;
          }

          const name = row[0]?.toString().trim() || '';
          const email = row[1]?.toString().trim().toLowerCase() || '';
          const phone = row[2]?.toString().trim() || '';
          const company = row[3]?.toString().trim() || '';
          const address = row[4]?.toString().trim() || '';
          const city = row[5]?.toString().trim() || '';
          const state = row[6]?.toString().trim() || '';
          const country = row[7]?.toString().trim() || '';
          const postalCode = row[8]?.toString().trim() || '';
          const gstNumber = row[9]?.toString().trim() || '';
          const panNumber = row[10]?.toString().trim() || '';
          const notes = row[11]?.toString().trim() || '';

          // Validation
          const rowErrors: string[] = [];

          if (!name) {
            rowErrors.push(`Row ${rowNum}: Name is required`);
          }

          if (!email) {
            rowErrors.push(`Row ${rowNum}: Email is required`);
          } else {
            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
              rowErrors.push(`Row ${rowNum}: Invalid email format`);
            }

            // Check for duplicate emails in the file
            if (seenEmails.has(email)) {
              rowErrors.push(`Row ${rowNum}: Duplicate email "${email}"`);
            } else {
              seenEmails.add(email);
            }
          }

          if (!country) {
            rowErrors.push(`Row ${rowNum}: Country is required`);
          }

          // GST Number validation (optional, only if provided)
          if (gstNumber && country.toLowerCase() === 'india') {
            const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            if (!gstRegex.test(gstNumber)) {
              rowErrors.push(`Row ${rowNum}: Invalid GST Number format`);
            }
          }

          // PAN Number validation (optional, only if provided)
          if (panNumber && country.toLowerCase() === 'india') {
            const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
            if (!panRegex.test(panNumber)) {
              rowErrors.push(`Row ${rowNum}: Invalid PAN Number format`);
            }
          }

          if (rowErrors.length > 0) {
            errors.push(...rowErrors);
          } else {
            customers.push({
              name,
              email,
              phone: phone || undefined,
              company: company || undefined,
              address: address || undefined,
              city: city || undefined,
              state: state || undefined,
              country,
              postalCode: postalCode || undefined,
              gstNumber: gstNumber || undefined,
              panNumber: panNumber || undefined,
              notes: notes || undefined,
            });
          }
        });

        resolve({
          success: errors.length === 0,
          data: customers,
          errors,
        });
      } catch (error: any) {
        resolve({
          success: false,
          data: [],
          errors: [`Failed to parse Excel file: ${error.message}`],
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        data: [],
        errors: ['Failed to read file'],
      });
    };

    reader.readAsBinaryString(file);
  });
}