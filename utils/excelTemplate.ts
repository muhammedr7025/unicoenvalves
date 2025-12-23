import * as XLSX from 'xlsx';

export interface ExcelData {
  materials: any[];
  series: any[];
  bodyWeights: any[];
  bonnetWeights: any[];
  plugWeights: any[]; // Includes hasSealRing and sealRingPrice columns
  seatWeights: any[]; // Includes hasCage and cageWeight columns
  stemFixedPrices: any[];
  cageWeights: any[]; // Keep for backward compatibility, but will be ignored
  sealRingPrices: any[]; // Keep for backward compatibility, but will be ignored
  actuatorModels: any[];
  handwheelPrices: any[];
}

export interface ExportData {
  materials: any[];
  series: any[];
  bodyWeights: any[];
  bonnetWeights: any[];
  plugWeights: any[];
  seatWeights: any[];
  stemFixedPrices: any[];
  cageWeights: any[];
  sealRingPrices: any[];
  actuatorModels: any[];
  handwheelPrices: any[];
}

export function generateExcelTemplate(): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Materials (simplified - no material code needed)
  const materialsData = [
    ['Material Name', 'Price Per Kg (INR)', 'Material Group', 'Active'],
    ['Aluminum AL100', '250', 'BodyBonnet', 'TRUE'],
    ['Steel ST200', '180', 'BodyBonnet', 'TRUE'],
    ['Stainless Steel SS304', '450', 'BodyBonnet', 'TRUE'],
    ['Bronze BR100', '550', 'Plug', 'TRUE'],
    ['Brass BS100', '420', 'Plug', 'TRUE'],
    ['PTFE Seat', '800', 'Seat', 'TRUE'],
    ['Metal Seat MS100', '600', 'Seat', 'TRUE'],
    ['Stem Steel ST300', '350', 'Stem', 'TRUE'],
    ['Stem SS316', '500', 'Stem', 'TRUE'],
    ['Cage Material CG100', '400', 'Cage', 'TRUE'],
    ['Cage SS CG200', '550', 'Cage', 'TRUE'],
  ];
  const materialsWs = XLSX.utils.aoa_to_sheet(materialsData);
  XLSX.utils.book_append_sheet(wb, materialsWs, 'Materials');

  // Sheet 2: Series (UPDATED with Has Seal Ring)
  const seriesData = [
    ['Product Type', 'Series Number', 'Series Name', 'Has Cage', 'Has Seal Ring', 'Active'],
    ['SV', '91000', 'SV Series 91000', 'FALSE', 'FALSE', 'TRUE'],
    ['SV', '92000', 'SV Series 92000', 'TRUE', 'TRUE', 'TRUE'],
    ['CV', '93000', 'CV Series 93000', 'TRUE', 'FALSE', 'TRUE'],
  ];
  const seriesWs = XLSX.utils.aoa_to_sheet(seriesData);
  XLSX.utils.book_append_sheet(wb, seriesWs, 'Series');

  // Sheet 3: Body Weights
  const bodyWeightsData = [
    ['Series Number', 'Size', 'Rating', 'End Connect Type', 'Weight (kg)', 'Active'],
    ['91000', '1/2', '150', 'Flanged', '2.5', 'TRUE'],
    ['91000', '1/2', '150', 'Threaded', '2.8', 'TRUE'],
    ['91000', '3/4', '150', 'Flanged', '3.2', 'TRUE'],
    ['91000', '1', '300', 'Flanged', '4.5', 'TRUE'],
    ['92000', '1/2', '150', 'Flanged', '2.7', 'TRUE'],
    ['93000', '3/4', '300', 'Flanged', '3.5', 'TRUE'],
  ];
  const bodyWeightsWs = XLSX.utils.aoa_to_sheet(bodyWeightsData);
  XLSX.utils.book_append_sheet(wb, bodyWeightsWs, 'Body Weights');

  // Sheet 4: Bonnet Weights
  const bonnetWeightsData = [
    ['Series Number', 'Size', 'Rating', 'Bonnet Type', 'Weight (kg)', 'Active'],
    ['91000', '1/2', '150', 'Standard', '1.5', 'TRUE'],
    ['91000', '1/2', '150', 'Extended', '1.8', 'TRUE'],
    ['91000', '3/4', '150', 'Standard', '2.2', 'TRUE'],
    ['92000', '1/2', '150', 'Standard', '1.6', 'TRUE'],
    ['93000', '3/4', '300', 'Extended', '2.5', 'TRUE'],
  ];
  const bonnetWeightsWs = XLSX.utils.aoa_to_sheet(bonnetWeightsData);
  XLSX.utils.book_append_sheet(wb, bonnetWeightsWs, 'Bonnet Weights');

  // Sheet 5: Plug Weights (Weight-based pricing, no Plug Type)
  const plugWeightsData = [
    ['Series Number', 'Size', 'Rating', 'Weight (kg)', 'Active'],
    ['91000', '1/2', '150', '0.5', 'TRUE'],
    ['91000', '3/4', '150', '0.7', 'TRUE'],
    ['91000', '1', '300', '0.9', 'TRUE'],
    ['92000', '1/2', '150', '0.55', 'TRUE'],
    ['92000', '3/4', '150', '0.7', 'TRUE'],
    ['93000', '3/4', '300', '0.8', 'TRUE'],
  ];
  const plugWeightsWs = XLSX.utils.aoa_to_sheet(plugWeightsData);
  XLSX.utils.book_append_sheet(wb, plugWeightsWs, 'Plug Weights');

  // Sheet 6: Seat Weights (Weight-based pricing, no Seat Type)
  const seatWeightsData = [
    ['Series Number', 'Size', 'Rating', 'Weight (kg)', 'Active'],
    ['91000', '1/2', '150', '0.4', 'TRUE'],
    ['91000', '3/4', '150', '0.6', 'TRUE'],
    ['91000', '1', '300', '0.8', 'TRUE'],
    ['92000', '1/2', '150', '0.55', 'TRUE'],
    ['92000', '3/4', '150', '0.7', 'TRUE'],
    ['93000', '3/4', '300', '0.7', 'TRUE'],
  ];
  const seatWeightsWs = XLSX.utils.aoa_to_sheet(seatWeightsData);
  XLSX.utils.book_append_sheet(wb, seatWeightsWs, 'Seat Weights');

  // Sheet 7: Cage Weights (Separate sheet for cage weight pricing)
  const cageWeightsData = [
    ['Series Number', 'Size', 'Rating', 'Weight (kg)', 'Active'],
    ['92000', '1/2', '150', '1.2', 'TRUE'],
    ['92000', '3/4', '150', '1.8', 'TRUE'],
    ['93000', '3/4', '300', '2.0', 'TRUE'],
  ];
  const cageWeightsWs = XLSX.utils.aoa_to_sheet(cageWeightsData);
  XLSX.utils.book_append_sheet(wb, cageWeightsWs, 'Cage Weights');

  // Sheet 8: Seal Ring Prices (Conditional pricing based on series, size, rating, seal type)
  const sealRingPricesData = [
    ['Series Number', 'Seal Type', 'Size', 'Rating', 'Fixed Price', 'Active'],
    ['92000', 'Graphite', '1/2', '150', '800', 'TRUE'],
    ['92000', 'Graphite', '3/4', '150', '1000', 'TRUE'],
    ['92000', 'PTFE', '1/2', '150', '900', 'TRUE'],
    ['92000', 'PTFE', '3/4', '150', '1200', 'TRUE'],
    ['93000', 'Graphite', '3/4', '300', '1100', 'TRUE'],
  ];
  const sealRingPricesWs = XLSX.utils.aoa_to_sheet(sealRingPricesData);
  XLSX.utils.book_append_sheet(wb, sealRingPricesWs, 'Seal Ring Prices');

  // Sheet 9: Stem Fixed Prices (uses Material Name instead of Material Code)
  const stemFixedPricesData = [
    ['Series Number', 'Size', 'Rating', 'Material Name', 'Fixed Price', 'Active'],
    ['91000', '1/2', '150', 'Stem Steel ST300', '1500', 'TRUE'],
    ['91000', '1/2', '150', 'Stem SS316', '2000', 'TRUE'],
    ['91000', '1/2', '300', 'Stem Steel ST300', '1800', 'TRUE'],
    ['91000', '1/2', '300', 'Stem SS316', '2300', 'TRUE'],
    ['91000', '3/4', '150', 'Stem Steel ST300', '2000', 'TRUE'],
    ['91000', '3/4', '150', 'Stem SS316', '2500', 'TRUE'],
    ['92000', '1/2', '150', 'Stem Steel ST300', '1600', 'TRUE'],
    ['92000', '1/2', '150', 'Stem SS316', '2100', 'TRUE'],
    ['93000', '3/4', '300', 'Stem Steel ST300', '2200', 'TRUE'],
    ['93000', '3/4', '300', 'Stem SS316', '2800', 'TRUE'],
  ];
  const stemFixedPricesWs = XLSX.utils.aoa_to_sheet(stemFixedPricesData);
  XLSX.utils.book_append_sheet(wb, stemFixedPricesWs, 'Stem Fixed Prices');

  // Sheet 10: Actuator Models
  const actuatorModelsData = [
    ['Type', 'Series', 'Model', 'Standard/Special', 'Fixed Price', 'Active'],
    ['Pneumatic', 'Series A', 'PA-100', 'standard', '15000', 'TRUE'],
    ['Pneumatic', 'Series A', 'PA-200', 'standard', '18000', 'TRUE'],
    ['Pneumatic', 'Series A', 'PA-300', 'special', '22000', 'TRUE'],
    ['Electric', 'Series B', 'EB-100', 'standard', '25000', 'TRUE'],
    ['Electric', 'Series B', 'EB-200', 'special', '30000', 'TRUE'],
    ['Manual', 'Series C', 'MC-50', 'standard', '8000', 'TRUE'],
  ];
  const actuatorModelsWs = XLSX.utils.aoa_to_sheet(actuatorModelsData);
  XLSX.utils.book_append_sheet(wb, actuatorModelsWs, 'Actuator Models');

  // Sheet 11: Handwheel Prices
  const handwheelPricesData = [
    ['Type', 'Series', 'Model', 'Standard/Special', 'Fixed Price', 'Active'],
    ['Manual', 'Series H', 'HW-100', 'standard', '2000', 'TRUE'],
    ['Manual', 'Series H', 'HW-200', 'standard', '2500', 'TRUE'],
    ['Manual', 'Series H', 'HW-300', 'special', '3000', 'TRUE'],
  ];
  const handwheelPricesWs = XLSX.utils.aoa_to_sheet(handwheelPricesData);
  XLSX.utils.book_append_sheet(wb, handwheelPricesWs, 'Handwheel Prices');

  // Generate and download
  XLSX.writeFile(wb, 'Unicorn_Valves_Pricing_Template.xlsx');
}

export function parseExcelFile(file: File): Promise<ExcelData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const result: ExcelData = {
          materials: [],
          series: [],
          bodyWeights: [],
          bonnetWeights: [],
          plugWeights: [],
          seatWeights: [],
          stemFixedPrices: [],
          cageWeights: [],
          sealRingPrices: [],
          actuatorModels: [],
          handwheelPrices: [],
        };

        // Parse Materials
        if (workbook.SheetNames.includes('Materials')) {
          const sheet = workbook.Sheets['Materials'];
          const json = XLSX.utils.sheet_to_json(sheet);
          result.materials = json;
        }

        // Parse Series
        if (workbook.SheetNames.includes('Series')) {
          const sheet = workbook.Sheets['Series'];
          const json = XLSX.utils.sheet_to_json(sheet);
          result.series = json;
        }

        // Parse Body Weights
        if (workbook.SheetNames.includes('Body Weights')) {
          const sheet = workbook.Sheets['Body Weights'];
          const json = XLSX.utils.sheet_to_json(sheet);
          result.bodyWeights = json;
        }

        // Parse Bonnet Weights
        if (workbook.SheetNames.includes('Bonnet Weights')) {
          const sheet = workbook.Sheets['Bonnet Weights'];
          const json = XLSX.utils.sheet_to_json(sheet);
          result.bonnetWeights = json;
        }

        // Parse Plug Weights
        if (workbook.SheetNames.includes('Plug Weights')) {
          const sheet = workbook.Sheets['Plug Weights'];
          const json = XLSX.utils.sheet_to_json(sheet);
          result.plugWeights = json;
        }

        // Parse Seat Weights
        if (workbook.SheetNames.includes('Seat Weights')) {
          const sheet = workbook.Sheets['Seat Weights'];
          const json = XLSX.utils.sheet_to_json(sheet);
          result.seatWeights = json;
        }

        // Parse Stem Fixed Prices (CHANGED)
        if (workbook.SheetNames.includes('Stem Fixed Prices')) {
          const sheet = workbook.Sheets['Stem Fixed Prices'];
          const json = XLSX.utils.sheet_to_json(sheet);
          result.stemFixedPrices = json;
        }

        // Parse Cage Weights (CHANGED)
        if (workbook.SheetNames.includes('Cage Weights')) {
          const sheet = workbook.Sheets['Cage Weights'];
          const json = XLSX.utils.sheet_to_json(sheet);
          result.cageWeights = json;
        }

        // Parse Seal Ring Prices (NEW)
        if (workbook.SheetNames.includes('Seal Ring Prices')) {
          const sheet = workbook.Sheets['Seal Ring Prices'];
          const json = XLSX.utils.sheet_to_json(sheet);
          result.sealRingPrices = json;
        }

        // Parse Actuator Models
        if (workbook.SheetNames.includes('Actuator Models')) {
          const sheet = workbook.Sheets['Actuator Models'];
          const json = XLSX.utils.sheet_to_json(sheet);
          result.actuatorModels = json;
        }

        // Parse Handwheel Prices
        if (workbook.SheetNames.includes('Handwheel Prices')) {
          const sheet = workbook.Sheets['Handwheel Prices'];
          const json = XLSX.utils.sheet_to_json(sheet);
          result.handwheelPrices = json;
        }

        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

export function exportPricingDataToExcel(data: ExportData): void {
  const wb = XLSX.utils.book_new();

  // Helper to format boolean
  const fmtBool = (val: boolean) => (val ? 'TRUE' : 'FALSE');

  // Sheet 1: Materials
  const materialsRows = [
    ['Material Name', 'Price Per Kg (INR)', 'Material Group', 'Active'],
    ...data.materials.map((m) => [
      m.name,
      m.pricePerKg,
      m.materialGroup,
      fmtBool(m.isActive),
    ]),
  ];
  const materialsWs = XLSX.utils.aoa_to_sheet(materialsRows);
  XLSX.utils.book_append_sheet(wb, materialsWs, 'Materials');

  // Sheet 2: Series
  const seriesRows = [
    ['Product Type', 'Series Number', 'Series Name', 'Has Cage', 'Has Seal Ring', 'Active'],
    ...data.series.map((s) => [
      s.productType,
      s.seriesNumber,
      s.name,
      fmtBool(s.hasCage),
      fmtBool(s.hasSealRing),
      fmtBool(s.isActive),
    ]),
  ];
  const seriesWs = XLSX.utils.aoa_to_sheet(seriesRows);
  XLSX.utils.book_append_sheet(wb, seriesWs, 'Series');

  // Sheet 3: Body Weights
  const bodyWeightsRows = [
    ['Series Number', 'Size', 'Rating', 'End Connect Type', 'Weight (kg)', 'Active'],
    ...data.bodyWeights.map((b) => {
      // Find series number from ID if possible, or use ID if not found (though data should have seriesId)
      // Ideally, the export data should have the resolved series number.
      // However, the database objects have seriesId.
      // We need to map seriesId to seriesNumber.
      // To keep it simple and efficient, we assume the caller might have joined them or we do a lookup if we pass series map.
      // BUT, for simplicity in this utility, let's assume the passed data objects have the necessary fields or we use what's available.
      // Wait, the DB objects have `seriesId`. The Excel expects `Series Number`.
      // The `getAll...` functions return the raw Firestore data.
      // So `bodyWeights` has `seriesId`.
      // We need to map `seriesId` to `seriesNumber`.
      // I should update the `ExportData` interface or the caller to provide this mapping.
      // OR, I can pass the `series` array to this function and build a map here.
      // Let's rely on the `series` array being present in `data.series`.
      return [
        data.series.find((s) => s.id === b.seriesId)?.seriesNumber || '',
        b.size,
        b.rating,
        b.endConnectType,
        b.weight,
        'TRUE', // BodyWeight interface doesn't have isActive, assuming TRUE
      ];
    }),
  ];
  const bodyWeightsWs = XLSX.utils.aoa_to_sheet(bodyWeightsRows);
  XLSX.utils.book_append_sheet(wb, bodyWeightsWs, 'Body Weights');

  // Sheet 4: Bonnet Weights
  const bonnetWeightsRows = [
    ['Series Number', 'Size', 'Rating', 'Bonnet Type', 'Weight (kg)', 'Active'],
    ...data.bonnetWeights.map((b) => [
      data.series.find((s) => s.id === b.seriesId)?.seriesNumber || '',
      b.size,
      b.rating,
      b.bonnetType,
      b.weight,
      'TRUE',
    ]),
  ];
  const bonnetWeightsWs = XLSX.utils.aoa_to_sheet(bonnetWeightsRows);
  XLSX.utils.book_append_sheet(wb, bonnetWeightsWs, 'Bonnet Weights');

  // Sheet 5: Plug Weights
  const plugWeightsRows = [
    ['Series Number', 'Size', 'Rating', 'Weight (kg)', 'Active'],
    ...data.plugWeights.map((p) => [
      data.series.find((s) => s.id === p.seriesId)?.seriesNumber || '',
      p.size,
      p.rating,
      p.weight,
      'TRUE',
    ]),
  ];
  const plugWeightsWs = XLSX.utils.aoa_to_sheet(plugWeightsRows);
  XLSX.utils.book_append_sheet(wb, plugWeightsWs, 'Plug Weights');

  // Sheet 6: Seat Weights
  const seatWeightsRows = [
    ['Series Number', 'Size', 'Rating', 'Weight (kg)', 'Active'],
    ...data.seatWeights.map((s) => [
      data.series.find((ser) => ser.id === s.seriesId)?.seriesNumber || '',
      s.size,
      s.rating,
      s.weight,
      'TRUE',
    ]),
  ];
  const seatWeightsWs = XLSX.utils.aoa_to_sheet(seatWeightsRows);
  XLSX.utils.book_append_sheet(wb, seatWeightsWs, 'Seat Weights');

  // Sheet 7: Stem Fixed Prices
  const stemFixedPricesRows = [
    ['Series Number', 'Size', 'Rating', 'Material Name', 'Fixed Price', 'Active'],
    ...data.stemFixedPrices.map((s) => [
      data.series.find((ser) => ser.id === s.seriesId)?.seriesNumber || '',
      s.size,
      s.rating,
      s.materialName,
      s.fixedPrice,
      fmtBool(s.isActive),
    ]),
  ];
  const stemFixedPricesWs = XLSX.utils.aoa_to_sheet(stemFixedPricesRows);
  XLSX.utils.book_append_sheet(wb, stemFixedPricesWs, 'Stem Fixed Prices');

  // Sheet 8: Cage Weights
  const cageWeightsRows = [
    ['Series Number', 'Size', 'Rating', 'Weight (kg)', 'Active'],
    ...data.cageWeights.map((c) => [
      data.series.find((s) => s.id === c.seriesId)?.seriesNumber || '',
      c.size,
      c.rating,
      c.weight,
      fmtBool(c.isActive),
    ]),
  ];
  const cageWeightsWs = XLSX.utils.aoa_to_sheet(cageWeightsRows);
  XLSX.utils.book_append_sheet(wb, cageWeightsWs, 'Cage Weights');

  // Sheet 9: Seal Ring Prices
  const sealRingPricesRows = [
    ['Series Number', 'Seal Type', 'Size', 'Rating', 'Fixed Price', 'Active'],
    ...data.sealRingPrices.map((s) => [
      data.series.find((ser) => ser.id === s.seriesId)?.seriesNumber || '',
      s.sealType,
      s.size,
      s.rating,
      s.fixedPrice,
      fmtBool(s.isActive),
    ]),
  ];
  const sealRingPricesWs = XLSX.utils.aoa_to_sheet(sealRingPricesRows);
  XLSX.utils.book_append_sheet(wb, sealRingPricesWs, 'Seal Ring Prices');

  // Sheet 10: Actuator Models
  const actuatorModelsRows = [
    ['Type', 'Series', 'Model', 'Standard/Special', 'Fixed Price', 'Active'],
    ...data.actuatorModels.map((a) => [
      a.type,
      a.series,
      a.model,
      a.standard,
      a.fixedPrice,
      fmtBool(a.isActive),
    ]),
  ];
  const actuatorModelsWs = XLSX.utils.aoa_to_sheet(actuatorModelsRows);
  XLSX.utils.book_append_sheet(wb, actuatorModelsWs, 'Actuator Models');

  // Sheet 11: Handwheel Prices
  const handwheelPricesRows = [
    ['Type', 'Series', 'Model', 'Standard/Special', 'Fixed Price', 'Active'],
    ...data.handwheelPrices.map((h) => [
      h.type,
      h.series,
      h.model,
      h.standard,
      h.fixedPrice,
      fmtBool(h.isActive),
    ]),
  ];
  const handwheelPricesWs = XLSX.utils.aoa_to_sheet(handwheelPricesRows);
  XLSX.utils.book_append_sheet(wb, handwheelPricesWs, 'Handwheel Prices');

  // Generate and download
  XLSX.writeFile(wb, 'Unicorn_Valves_Pricing_Data.xlsx');
}