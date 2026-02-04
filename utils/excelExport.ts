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
    pilotPlugMaterialName?: string;
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
      'PILOT PLUG',
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
    const pilotPlugMaterialName = product.hasPilotPlug ? (product.pilotPlugMaterialName || 'N/A') : '';

    // Determine trim type - previously based on seatType, now just empty or could be derived from other fields if needed
    const trimType = '';

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
      product.hasSealRing ? (product.sealType || 'WITH SEAL RING') : 'NO SEAL', // SEAL TYPE
      seatMaterialName, // SEAT MATERIAL
      plugMaterialName, // PLUG MATERIAL
      stemMaterialName, // STEM MATERIAL
      cageMaterialName, // CAGE MATERIAL
      product.hasPilotPlug ? pilotPlugMaterialName : 'NO PILOT PLUG', // PILOT PLUG
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
    { wch: 18 }, // PILOT PLUG
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

  // Add main worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Configuration');

  // ========== COST BREAKDOWN SHEET ==========
  const costBreakdownHeader: any[][] = [
    ['COST BREAKDOWN - ' + quote.quoteNumber],
    ['Customer: ' + quote.customerName],
    [],
    [
      'ITEM',
      'TAG#',
      'COMPONENT',
      'MATERIAL',
      'WEIGHT (kg)',
      'RATE (₹/kg)',
      'MATERIAL COST (₹)',
      'MACHINING COST (₹)',
      'TOTAL COST (₹)',
    ],
  ];

  const costBreakdownRows: any[][] = [];

  quote.products.forEach((product, productIndex) => {
    const tag = product.productTag || `Product ${productIndex + 1}`;
    const itemNum = productIndex + 1;

    // Body - Always show for valve products
    costBreakdownRows.push([
      itemNum,
      tag,
      'Body',
      product.bodyMaterialName || product.bodyBonnetMaterialName || 'N/A',
      product.bodyWeight || 0,
      product.bodyMaterialPrice || 0,
      (product.bodyWeight || 0) * (product.bodyMaterialPrice || 0),
      product.bodyMachineCost || 0,
      product.bodyTotalCost || 0,
    ]);

    // Bonnet - Always show for valve products
    costBreakdownRows.push([
      itemNum,
      tag,
      'Bonnet',
      product.bodyMaterialName || product.bodyBonnetMaterialName || 'N/A',
      product.bonnetWeight || 0,
      product.bonnetMaterialPrice || 0,
      (product.bonnetWeight || 0) * (product.bonnetMaterialPrice || 0),
      product.bonnetMachineCost || 0,
      product.bonnetTotalCost || 0,
    ]);

    // Plug - Always show for valve products
    costBreakdownRows.push([
      itemNum,
      tag,
      'Plug',
      product.plugMaterialName || 'N/A',
      product.plugWeight || 0,
      product.plugMaterialPrice || 0,
      (product.plugWeight || 0) * (product.plugMaterialPrice || 0),
      product.plugMachineCost || 0,
      product.plugTotalCost || 0,
    ]);

    // Seat - Always show for valve products
    costBreakdownRows.push([
      itemNum,
      tag,
      'Seat',
      product.seatMaterialName || 'N/A',
      product.seatWeight || 0,
      product.seatMaterialPrice || 0,
      (product.seatWeight || 0) * (product.seatMaterialPrice || 0),
      product.seatMachineCost || 0,
      product.seatTotalCost || 0,
    ]);

    // Stem - Always show for valve products
    costBreakdownRows.push([
      itemNum,
      tag,
      'Stem',
      product.stemMaterialName || 'N/A',
      '-',
      '-',
      product.stemFixedPrice || 0,
      product.stemMachineCost || 0,
      product.stemTotalCost || 0,
    ]);

    // Cage
    if (product.hasCage && product.cageTotalCost) {
      costBreakdownRows.push([
        itemNum,
        tag,
        'Cage',
        product.cageMaterialName || 'N/A',
        product.cageWeight || 0,
        product.cageMaterialPrice || 0,
        (product.cageWeight || 0) * (product.cageMaterialPrice || 0),
        product.cageMachineCost || 0,
        product.cageTotalCost,
      ]);
    }

    // Seal Ring
    if (product.hasSealRing && product.sealRingTotalCost) {
      costBreakdownRows.push([
        itemNum,
        tag,
        'Seal Ring',
        product.sealType || 'N/A',
        '-',
        '-',
        product.sealRingFixedPrice || 0,
        '-',
        product.sealRingTotalCost,
      ]);
    }

    // Pilot Plug
    if (product.hasPilotPlug && product.pilotPlugTotalCost) {
      costBreakdownRows.push([
        itemNum,
        tag,
        'Pilot Plug',
        product.pilotPlugMaterialName || 'N/A',
        product.pilotPlugWeight || 0,
        product.pilotPlugMaterialPrice || 0,
        (product.pilotPlugWeight || 0) * (product.pilotPlugMaterialPrice || 0),
        '-',
        product.pilotPlugTotalCost,
      ]);
    }

    // Actuator
    if (product.hasActuator && product.actuatorFixedPrice) {
      costBreakdownRows.push([
        itemNum,
        tag,
        'Actuator',
        `${product.actuatorType} - ${product.actuatorModel}`,
        '-',
        '-',
        product.actuatorFixedPrice,
        '-',
        product.actuatorFixedPrice,
      ]);
    }

    // Handwheel
    if (product.hasHandwheel && product.handwheelFixedPrice) {
      costBreakdownRows.push([
        itemNum,
        tag,
        'Handwheel',
        `${product.handwheelType} - ${product.handwheelModel}`,
        '-',
        '-',
        product.handwheelFixedPrice,
        '-',
        product.handwheelFixedPrice,
      ]);
    }

    // Testing items
    (product.testing || []).forEach(test => {
      costBreakdownRows.push([
        itemNum,
        tag,
        'Testing',
        test.title,
        '-',
        '-',
        test.price,
        '-',
        test.price,
      ]);
    });

    // Tubing & Fitting items
    (product.tubingAndFitting || []).forEach(item => {
      costBreakdownRows.push([
        itemNum,
        tag,
        'Tubing/Fitting',
        item.title,
        '-',
        '-',
        item.price,
        '-',
        item.price,
      ]);
    });

    // Accessories
    (product.accessories || []).forEach(acc => {
      costBreakdownRows.push([
        itemNum,
        tag,
        'Accessory',
        `${acc.title} x${acc.quantity}`,
        '-',
        '-',
        acc.price * acc.quantity,
        '-',
        acc.price * acc.quantity,
      ]);
    });

    // Subtotal row
    costBreakdownRows.push([]);
    costBreakdownRows.push([
      itemNum,
      tag,
      'SUBTOTALS',
      '',
      '',
      '',
      '',
      '',
      '',
    ]);
    costBreakdownRows.push([
      '',
      '',
      'Body Sub-Assembly Total',
      '',
      '',
      '',
      '',
      '',
      product.bodySubAssemblyTotal || 0,
    ]);
    costBreakdownRows.push([
      '',
      '',
      'Actuator Sub-Assembly Total',
      '',
      '',
      '',
      '',
      '',
      product.actuatorSubAssemblyTotal || 0,
    ]);
    costBreakdownRows.push([
      '',
      '',
      'Testing Total',
      '',
      '',
      '',
      '',
      '',
      product.testingTotal || 0,
    ]);
    costBreakdownRows.push([
      '',
      '',
      'Tubing & Fitting Total',
      '',
      '',
      '',
      '',
      '',
      product.tubingAndFittingTotal || 0,
    ]);
    costBreakdownRows.push([
      '',
      '',
      'Accessories Total',
      '',
      '',
      '',
      '',
      '',
      product.accessoriesTotal || 0,
    ]);

    // === DETAILED PRICING SUMMARY ===
    costBreakdownRows.push([]);
    costBreakdownRows.push([
      itemNum,
      tag,
      '=== PRICING BREAKDOWN ===',
      '',
      '',
      '',
      '',
      '',
      '',
    ]);

    // Calculate intermediate values
    const bodySubTotal = product.bodySubAssemblyTotal || 0;
    const actuatorSubTotal = product.actuatorSubAssemblyTotal || 0;
    const testingTotal = product.testingTotal || 0;
    const tubingTotal = product.tubingAndFittingTotal || 0;
    const accessoriesTotal = product.accessoriesTotal || 0;

    // Manufacturing cost base (body + actuator + testing)
    const manufacturingBase = bodySubTotal + testingTotal;
    // Bought-out cost base (actuator + tubing + accessories)
    const boughtOutBase = actuatorSubTotal + tubingTotal + accessoriesTotal;
    // Total base cost before any profits
    const totalBaseCost = manufacturingBase + boughtOutBase;

    const mfgProfitPct = product.manufacturingProfitPercentage || 0;
    const boughtOutProfitPct = product.boughtoutProfitPercentage || 0;
    const negotiationPct = product.negotiationMarginPercentage || 0;

    const mfgProfitAmt = product.manufacturingProfitAmount || 0;
    const boughtOutProfitAmt = product.boughtoutProfitAmount || 0;
    const negotiationAmt = product.negotiationMarginAmount || 0;

    // Stage 1: Base Costs
    costBreakdownRows.push([
      '',
      '',
      '1. BASE COSTS (Before Profits)',
      '',
      '',
      '',
      '',
      '',
      '',
    ]);
    costBreakdownRows.push([
      '',
      '',
      '   Manufacturing Items (Body+Testing)',
      '',
      '',
      '',
      '',
      '',
      manufacturingBase,
    ]);
    costBreakdownRows.push([
      '',
      '',
      '   Bought-out Items (Actuator+Tubing+Acc)',
      '',
      '',
      '',
      '',
      '',
      boughtOutBase,
    ]);
    costBreakdownRows.push([
      '',
      '',
      '   TOTAL BASE COST',
      '',
      '',
      '',
      '',
      '',
      totalBaseCost,
    ]);

    // Stage 2: After Manufacturing Profit
    costBreakdownRows.push([]);
    costBreakdownRows.push([
      '',
      '',
      '2. AFTER MANUFACTURING PROFIT',
      '',
      '',
      '',
      '',
      '',
      '',
    ]);
    costBreakdownRows.push([
      '',
      '',
      `   Manufacturing Profit (${mfgProfitPct}% on ₹${manufacturingBase.toLocaleString()})`,
      '',
      '',
      '',
      '',
      '',
      `+ ₹${mfgProfitAmt.toLocaleString()}`,
    ]);
    costBreakdownRows.push([
      '',
      '',
      '   Cost After Mfg Profit',
      '',
      '',
      '',
      '',
      '',
      totalBaseCost + mfgProfitAmt,
    ]);

    // Stage 3: After Bought-out Profit
    costBreakdownRows.push([]);
    costBreakdownRows.push([
      '',
      '',
      '3. AFTER BOUGHT-OUT PROFIT',
      '',
      '',
      '',
      '',
      '',
      '',
    ]);
    costBreakdownRows.push([
      '',
      '',
      `   Bought-out Profit (${boughtOutProfitPct}% on ₹${boughtOutBase.toLocaleString()})`,
      '',
      '',
      '',
      '',
      '',
      `+ ₹${boughtOutProfitAmt.toLocaleString()}`,
    ]);
    costBreakdownRows.push([
      '',
      '',
      '   Cost After All Profits',
      '',
      '',
      '',
      '',
      '',
      totalBaseCost + mfgProfitAmt + boughtOutProfitAmt,
    ]);

    // Stage 4: After Negotiation Margin
    costBreakdownRows.push([]);
    costBreakdownRows.push([
      '',
      '',
      '4. AFTER NEGOTIATION MARGIN',
      '',
      '',
      '',
      '',
      '',
      '',
    ]);
    costBreakdownRows.push([
      '',
      '',
      `   Negotiation Margin (${negotiationPct}%)`,
      '',
      '',
      '',
      '',
      '',
      `+ ₹${negotiationAmt.toLocaleString()}`,
    ]);
    costBreakdownRows.push([
      '',
      '',
      '   ⭐ FINAL UNIT COST',
      '',
      '',
      '',
      '',
      '',
      product.unitCost || 0,
    ]);

    // Stage 5: Line Total
    costBreakdownRows.push([]);
    costBreakdownRows.push([
      '',
      '',
      `5. LINE TOTAL (Unit Cost × ${product.quantity} qty)`,
      '',
      '',
      '',
      '',
      '',
      product.productTotalCost || 0,
    ]);

    costBreakdownRows.push([]); // Empty separator row
  });

  // Grand total
  costBreakdownRows.push([]);
  costBreakdownRows.push([
    '',
    '',
    '🏆 GRAND TOTAL (All Products)',
    '',
    '',
    '',
    '',
    '',
    quote.products.reduce((sum, p) => sum + (p.productTotalCost || 0), 0),
  ]);

  const costAllRows = [...costBreakdownHeader, ...costBreakdownRows];
  const costWs = XLSX.utils.aoa_to_sheet(costAllRows);

  // Set column widths for cost breakdown
  const costColWidths = [
    { wch: 6 },  // ITEM
    { wch: 18 }, // TAG#
    { wch: 28 }, // COMPONENT
    { wch: 25 }, // MATERIAL
    { wch: 12 }, // WEIGHT
    { wch: 12 }, // RATE
    { wch: 18 }, // MATERIAL COST
    { wch: 18 }, // MACHINING COST
    { wch: 18 }, // TOTAL COST
  ];
  costWs['!cols'] = costColWidths;

  XLSX.utils.book_append_sheet(wb, costWs, 'Cost Breakdown');

  // Generate Excel file and trigger download
  const fileName = `${quote.quoteNumber}.xlsx`;
  XLSX.writeFile(wb, fileName);
}