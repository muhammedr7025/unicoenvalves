import * as XLSX from 'xlsx';
import { Quote } from '@/types';

// Extended Quote type with material names
interface EnhancedQuote extends Quote {
  products: Array<Quote['products'][0] & {
    bodyMaterialName?: string;
    plugMaterialName?: string;
    seatMaterialName?: string;
    stemMaterialName?: string;
    cageMaterialName?: string;
  }>;
}

export function exportQuoteToExcel(quote: EnhancedQuote) {
  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Prepare header rows
  const headerRows: any[][] = [
    [], // Empty row 1
    ['Customer Name', quote.customerName], // Row 2
    ['Enquiry Ref', ''], // Row 3
    ['Project', ''], // Row 4
    ['Unicorn Ref', quote.quoteNumber], // Row 5
    [], // Empty row 6
    [], // Empty row 7
    [ // Row 8 - Column Headers
      '',
      'ITEM',
      'TAG#',
      'QTY',
      'MODEL',
      'SIZE',
      'RATING',
      'END CONNECTIONS',
      'BODY MATERIAL',
      'BONNET TYPE',
      'TRIM TYPE',
      'NO. OF CAGES',
      'SEAL TYPE',
      'SEAT MATERIAL',
      'PLUG MATERIAL',
      'STEM MATERIAL',
      'CAGE MATERIAL',
      'ACTUATOR',
      'MODEL',
      'SIZE',
      'HANDWHEEL',
      'POSITIONER TYPE',
      'LT. SWITCHES',
      'SOL. VALVE',
      'QUICK EXHAUST VALVE',
      'FLOW BOOSTER',
      'AIR LOCK VALVE',
      'VOLUME TANK',
      'AIR FILTER REGULATOR',
      'JUNCTION BOX',
      'SAFETY RELIEF VALVE',
      'PRESSURE GAUGES',
      'REV',
      'By',
      'DATE',
    ],
  ];

  // Add product rows
  const productRows: any[][] = quote.products.map((product, index) => {
    // Get material names from enhanced product data
    const bodyMaterialName = product.bodyMaterialName || 'N/A';
    const seatMaterialName = product.seatMaterialName || 'N/A';
    const plugMaterialName = product.plugMaterialName || 'N/A';
    const stemMaterialName = product.stemMaterialName || 'N/A';
    const cageMaterialName = product.hasCage ? (product.cageMaterialName || 'N/A') : '';

    // Determine trim type based on seat type
    const trimType = product.seatType || '';

    // Check accessories for specific items
    const accessories = product.accessories || [];
    
    const hasPositioner = accessories.some(a => 
      a.title.toLowerCase().includes('positioner')
    );
    
    const hasLimitSwitch = accessories.some(a => 
      a.title.toLowerCase().includes('limit switch') || 
      a.title.toLowerCase().includes('limitswitch')
    );
    
    const hasSolenoidValve = accessories.some(a => 
      a.title.toLowerCase().includes('solenoid')
    );
    
    const hasQuickExhaust = accessories.some(a => 
      a.title.toLowerCase().includes('quick exhaust')
    );
    
    const hasFlowBooster = accessories.some(a => 
      a.title.toLowerCase().includes('flow booster')
    );
    
    const hasAirLock = accessories.some(a => 
      a.title.toLowerCase().includes('airlock') || 
      a.title.toLowerCase().includes('air lock')
    );
    
    const hasVolumeTank = accessories.some(a => 
      a.title.toLowerCase().includes('volume tank')
    );
    
    const hasAirFilterRegulator = accessories.some(a => 
      a.title.toLowerCase().includes('airfilter') || 
      a.title.toLowerCase().includes('air filter') ||
      a.title.toLowerCase().includes('afr')
    );
    
    const hasJunctionBox = accessories.some(a => 
      a.title.toLowerCase().includes('junction box')
    );
    
    const hasSafetyReliefValve = accessories.some(a => 
      a.title.toLowerCase().includes('safety relief') ||
      a.title.toLowerCase().includes('relief valve')
    );
    
    const hasPressureGauges = accessories.some(a => 
      a.title.toLowerCase().includes('pressure gauge')
    );

    // Format date
    const createdDate = quote.createdAt instanceof Date 
      ? quote.createdAt 
      : new Date(quote.createdAt);

    return [
      '', // Empty first column
      index + 1, // ITEM number
      product.productTag || `Product ${index + 1}`, // TAG#
      product.quantity, // QTY
      product.seriesNumber, // MODEL
      product.size, // SIZE
      product.rating, // RATING
      product.bodyEndConnectType, // END CONNECTIONS
      bodyMaterialName, // BODY MATERIAL
      product.bonnetType, // BONNET TYPE
      trimType, // TRIM TYPE
      product.hasCage ? '1 CAGE' : 'NO CAGE', // NO. OF CAGES
      product.hasSealRing ? 'WITH SEAL RING' : 'NO SEAL', // SEAL TYPE
      seatMaterialName, // SEAT MATERIAL
      plugMaterialName, // PLUG MATERIAL
      stemMaterialName, // STEM MATERIAL
      cageMaterialName, // CAGE MATERIAL
      product.hasActuator ? (product.actuatorType?.toUpperCase() || 'PNEUMATIC') : 'NO ACTUATOR', // ACTUATOR
      product.actuatorModel || '', // MODEL
      '', // SIZE (actuator size - can be added if available)
      product.hasHandwheel ? 'Yes' : 'No', // HANDWHEEL
      hasPositioner ? 'ELECTRO-PNEUMATIC' : '', // POSITIONER TYPE
      hasLimitSwitch ? 'Yes' : 'No', // LT. SWITCHES
      hasSolenoidValve ? 'Yes' : 'No', // SOL. VALVE
      hasQuickExhaust ? 'Yes' : 'No', // QUICK EXHAUST VALVE
      hasFlowBooster ? 'Yes' : 'No', // FLOW BOOSTER
      hasAirLock ? 'Yes' : 'No', // AIR LOCK VALVE
      hasVolumeTank ? 'Yes' : 'No', // VOLUME TANK
      hasAirFilterRegulator ? 'Yes' : 'No', // AIR FILTER REGULATOR
      hasJunctionBox ? 'Yes' : 'No', // JUNCTION BOX
      hasSafetyReliefValve ? 'Yes' : 'No', // SAFETY RELIEF VALVE
      hasPressureGauges ? 'Yes' : 'No', // PRESSURE GAUGES
      0, // REV
      quote.createdByName.split(' ')[0].toUpperCase(), // By
      createdDate, // DATE
    ];
  });

  // Combine all rows
  const allRows = [...headerRows, ...productRows];

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(allRows);

  // Set column widths for better readability
  const colWidths = [
    { wch: 3 },  // Empty column
    { wch: 6 },  // ITEM
    { wch: 15 }, // TAG#
    { wch: 5 },  // QTY
    { wch: 10 }, // MODEL
    { wch: 8 },  // SIZE
    { wch: 12 }, // RATING
    { wch: 18 }, // END CONNECTIONS
    { wch: 18 }, // BODY MATERIAL
    { wch: 15 }, // BONNET TYPE
    { wch: 20 }, // TRIM TYPE
    { wch: 12 }, // NO. OF CAGES
    { wch: 15 }, // SEAL TYPE
    { wch: 20 }, // SEAT MATERIAL
    { wch: 20 }, // PLUG MATERIAL
    { wch: 15 }, // STEM MATERIAL
    { wch: 20 }, // CAGE MATERIAL
    { wch: 12 }, // ACTUATOR
    { wch: 12 }, // MODEL
    { wch: 8 },  // SIZE
    { wch: 12 }, // HANDWHEEL
    { wch: 20 }, // POSITIONER TYPE
    { wch: 13 }, // LT. SWITCHES
    { wch: 12 }, // SOL. VALVE
    { wch: 20 }, // QUICK EXHAUST VALVE
    { wch: 15 }, // FLOW BOOSTER
    { wch: 15 }, // AIR LOCK VALVE
    { wch: 13 }, // VOLUME TANK
    { wch: 22 }, // AIR FILTER REGULATOR
    { wch: 13 }, // JUNCTION BOX
    { wch: 20 }, // SAFETY RELIEF VALVE
    { wch: 18 }, // PRESSURE GAUGES
    { wch: 5 },  // REV
    { wch: 8 },  // By
    { wch: 12 }, // DATE
  ];
  ws['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  // Generate Excel file and trigger download
  const fileName = `${quote.quoteNumber}.xlsx`;
  XLSX.writeFile(wb, fileName);
}