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

  // Sheet 1: Materials - Comprehensive coverage for all material groups
  const materialsData = [
    ['Material Name', 'Price Per Kg (INR)', 'Material Group', 'Active'],
    // Body/Bonnet Materials
    ['Carbon Steel CS A216-WCB', '180', 'BodyBonnet', 'TRUE'],
    ['Stainless Steel SS304', '450', 'BodyBonnet', 'TRUE'],
    ['Stainless Steel SS316', '550', 'BodyBonnet', 'TRUE'],
    ['Alloy Steel A217-WC6', '320', 'BodyBonnet', 'TRUE'],
    ['Chrome Moly A217-WC9', '380', 'BodyBonnet', 'TRUE'],
    // Plug Materials
    ['SS304 Plug', '450', 'Plug', 'TRUE'],
    ['SS316 Plug', '550', 'Plug', 'TRUE'],
    ['Stellite Plug', '1200', 'Plug', 'TRUE'],
    ['Chrome Plated Plug', '380', 'Plug', 'TRUE'],
    // Seat Materials
    ['SS304 Seat', '450', 'Seat', 'TRUE'],
    ['SS316 Seat', '550', 'Seat', 'TRUE'],
    ['Stellite Seat', '1200', 'Seat', 'TRUE'],
    ['PTFE Seat', '800', 'Seat', 'TRUE'],
    // Stem Materials
    ['SS304 Stem', '450', 'Stem', 'TRUE'],
    ['SS316 Stem', '550', 'Stem', 'TRUE'],
    ['SS410 Stem', '380', 'Stem', 'TRUE'],
    ['Stellite Stem', '1200', 'Stem', 'TRUE'],
    // Cage Materials
    ['SS304 Cage', '450', 'Cage', 'TRUE'],
    ['SS316 Cage', '550', 'Cage', 'TRUE'],
    ['Chrome Moly Cage', '380', 'Cage', 'TRUE'],
  ];
  const materialsWs = XLSX.utils.aoa_to_sheet(materialsData);
  XLSX.utils.book_append_sheet(wb, materialsWs, 'Materials');

  // Sheet 2: Series - Multiple series for testing
  const seriesData = [
    ['Product Type', 'Series Number', 'Series Name', 'Has Cage', 'Has Seal Ring', 'Active'],
    ['Globe Valve', '91000', 'Standard Globe Valve', 'FALSE', 'FALSE', 'TRUE'],
    ['Globe Valve', '92000', 'Cage Guided Globe Valve', 'TRUE', 'TRUE', 'TRUE'],
    ['Angle Valve', '93000', 'Angle Control Valve', 'TRUE', 'TRUE', 'TRUE'],
    ['Ball Valve', '94000', 'Trunnion Ball Valve', 'FALSE', 'FALSE', 'TRUE'],
  ];
  const seriesWs = XLSX.utils.aoa_to_sheet(seriesData);
  XLSX.utils.book_append_sheet(wb, seriesWs, 'Series');

  // Sheet 3: Body Weights - Multiple combinations
  const bodyWeightsData = [
    ['Series Number', 'Size', 'Rating', 'End Connect Type', 'Weight (kg)', 'Active'],
    // Series 91000
    ['91000', '1/2', '150', 'Flanged', '2.5', 'TRUE'],
    ['91000', '1/2', '150', 'Threaded', '2.3', 'TRUE'],
    ['91000', '1/2', '300', 'Flanged', '3.2', 'TRUE'],
    ['91000', '3/4', '150', 'Flanged', '3.8', 'TRUE'],
    ['91000', '3/4', '300', 'Flanged', '4.5', 'TRUE'],
    ['91000', '1', '150', 'Flanged', '5.2', 'TRUE'],
    ['91000', '1', '300', 'Flanged', '6.8', 'TRUE'],
    ['91000', '1-1/2', '150', 'Flanged', '8.5', 'TRUE'],
    ['91000', '2', '150', 'Flanged', '12.5', 'TRUE'],
    // Series 92000
    ['92000', '1/2', '150', 'Flanged', '2.7', 'TRUE'],
    ['92000', '3/4', '150', 'Flanged', '4.0', 'TRUE'],
    ['92000', '1', '150', 'Flanged', '5.5', 'TRUE'],
    ['92000', '1', '300', 'Flanged', '7.2', 'TRUE'],
    ['92000', '1-1/2', '150', 'Flanged', '9.0', 'TRUE'],
    ['92000', '2', '150', 'Flanged', '13.0', 'TRUE'],
    // Series 93000
    ['93000', '1/2', '150', 'Flanged', '2.8', 'TRUE'],
    ['93000', '3/4', '150', 'Flanged', '4.2', 'TRUE'],
    ['93000', '3/4', '300', 'Flanged', '5.0', 'TRUE'],
    ['93000', '1', '150', 'Flanged', '5.8', 'TRUE'],
    ['93000', '1-1/2', '150', 'Flanged', '9.5', 'TRUE'],
    // Series 94000
    ['94000', '1/2', '150', 'Flanged', '3.0', 'TRUE'],
    ['94000', '1', '150', 'Flanged', '6.0', 'TRUE'],
    ['94000', '2', '150', 'Flanged', '14.0', 'TRUE'],
  ];
  const bodyWeightsWs = XLSX.utils.aoa_to_sheet(bodyWeightsData);
  XLSX.utils.book_append_sheet(wb, bodyWeightsWs, 'Body Weights');

  // Sheet 4: Bonnet Weights
  const bonnetWeightsData = [
    ['Series Number', 'Size', 'Rating', 'Bonnet Type', 'Weight (kg)', 'Active'],
    // Series 91000
    ['91000', '1/2', '150', 'Standard', '1.2', 'TRUE'],
    ['91000', '1/2', '150', 'Extended', '1.8', 'TRUE'],
    ['91000', '1/2', '300', 'Standard', '1.5', 'TRUE'],
    ['91000', '3/4', '150', 'Standard', '1.8', 'TRUE'],
    ['91000', '3/4', '300', 'Standard', '2.2', 'TRUE'],
    ['91000', '1', '150', 'Standard', '2.5', 'TRUE'],
    ['91000', '1', '300', 'Standard', '3.2', 'TRUE'],
    ['91000', '1-1/2', '150', 'Standard', '4.0', 'TRUE'],
    ['91000', '2', '150', 'Standard', '5.5', 'TRUE'],
    // Series 92000
    ['92000', '1/2', '150', 'Standard', '1.4', 'TRUE'],
    ['92000', '3/4', '150', 'Standard', '2.0', 'TRUE'],
    ['92000', '1', '150', 'Standard', '2.8', 'TRUE'],
    ['92000', '1', '300', 'Standard', '3.5', 'TRUE'],
    ['92000', '1-1/2', '150', 'Standard', '4.2', 'TRUE'],
    ['92000', '2', '150', 'Standard', '5.8', 'TRUE'],
    // Series 93000
    ['93000', '1/2', '150', 'Standard', '1.5', 'TRUE'],
    ['93000', '3/4', '150', 'Standard', '2.2', 'TRUE'],
    ['93000', '3/4', '300', 'Standard', '2.8', 'TRUE'],
    ['93000', '1', '150', 'Standard', '3.0', 'TRUE'],
    ['93000', '1-1/2', '150', 'Standard', '4.5', 'TRUE'],
    // Series 94000
    ['94000', '1/2', '150', 'Standard', '1.6', 'TRUE'],
    ['94000', '1', '150', 'Standard', '3.2', 'TRUE'],
    ['94000', '2', '150', 'Standard', '6.0', 'TRUE'],
  ];
  const bonnetWeightsWs = XLSX.utils.aoa_to_sheet(bonnetWeightsData);
  XLSX.utils.book_append_sheet(wb, bonnetWeightsWs, 'Bonnet Weights');

  // Sheet 5: Plug Weights
  const plugWeightsData = [
    ['Series Number', 'Size', 'Rating', 'Weight (kg)', 'Active'],
    ['91000', '1/2', '150', '0.4', 'TRUE'],
    ['91000', '1/2', '300', '0.5', 'TRUE'],
    ['91000', '3/4', '150', '0.6', 'TRUE'],
    ['91000', '3/4', '300', '0.7', 'TRUE'],
    ['91000', '1', '150', '0.8', 'TRUE'],
    ['91000', '1', '300', '1.0', 'TRUE'],
    ['91000', '1-1/2', '150', '1.5', 'TRUE'],
    ['91000', '2', '150', '2.2', 'TRUE'],
    ['92000', '1/2', '150', '0.45', 'TRUE'],
    ['92000', '3/4', '150', '0.65', 'TRUE'],
    ['92000', '1', '150', '0.85', 'TRUE'],
    ['92000', '1', '300', '1.05', 'TRUE'],
    ['92000', '1-1/2', '150', '1.6', 'TRUE'],
    ['92000', '2', '150', '2.3', 'TRUE'],
    ['93000', '1/2', '150', '0.5', 'TRUE'],
    ['93000', '3/4', '150', '0.7', 'TRUE'],
    ['93000', '3/4', '300', '0.8', 'TRUE'],
    ['93000', '1', '150', '0.9', 'TRUE'],
    ['93000', '1-1/2', '150', '1.7', 'TRUE'],
    ['94000', '1/2', '150', '0.6', 'TRUE'],
    ['94000', '1', '150', '1.0', 'TRUE'],
    ['94000', '2', '150', '2.5', 'TRUE'],
  ];
  const plugWeightsWs = XLSX.utils.aoa_to_sheet(plugWeightsData);
  XLSX.utils.book_append_sheet(wb, plugWeightsWs, 'Plug Weights');

  // Sheet 6: Seat Weights
  const seatWeightsData = [
    ['Series Number', 'Size', 'Rating', 'Weight (kg)', 'Active'],
    ['91000', '1/2', '150', '0.3', 'TRUE'],
    ['91000', '1/2', '300', '0.4', 'TRUE'],
    ['91000', '3/4', '150', '0.5', 'TRUE'],
    ['91000', '3/4', '300', '0.6', 'TRUE'],
    ['91000', '1', '150', '0.7', 'TRUE'],
    ['91000', '1', '300', '0.9', 'TRUE'],
    ['91000', '1-1/2', '150', '1.2', 'TRUE'],
    ['91000', '2', '150', '1.8', 'TRUE'],
    ['92000', '1/2', '150', '0.35', 'TRUE'],
    ['92000', '3/4', '150', '0.55', 'TRUE'],
    ['92000', '1', '150', '0.75', 'TRUE'],
    ['92000', '1', '300', '0.95', 'TRUE'],
    ['92000', '1-1/2', '150', '1.3', 'TRUE'],
    ['92000', '2', '150', '1.9', 'TRUE'],
    ['93000', '1/2', '150', '0.4', 'TRUE'],
    ['93000', '3/4', '150', '0.6', 'TRUE'],
    ['93000', '3/4', '300', '0.7', 'TRUE'],
    ['93000', '1', '150', '0.8', 'TRUE'],
    ['93000', '1-1/2', '150', '1.4', 'TRUE'],
    ['94000', '1/2', '150', '0.5', 'TRUE'],
    ['94000', '1', '150', '0.9', 'TRUE'],
    ['94000', '2', '150', '2.0', 'TRUE'],
  ];
  const seatWeightsWs = XLSX.utils.aoa_to_sheet(seatWeightsData);
  XLSX.utils.book_append_sheet(wb, seatWeightsWs, 'Seat Weights');

  // Sheet 7: Cage Weights (only for series with hasCage = TRUE)
  const cageWeightsData = [
    ['Series Number', 'Size', 'Rating', 'Weight (kg)', 'Active'],
    ['92000', '1/2', '150', '1.2', 'TRUE'],
    ['92000', '3/4', '150', '1.8', 'TRUE'],
    ['92000', '1', '150', '2.5', 'TRUE'],
    ['92000', '1', '300', '3.0', 'TRUE'],
    ['92000', '1-1/2', '150', '4.0', 'TRUE'],
    ['92000', '2', '150', '6.0', 'TRUE'],
    ['93000', '1/2', '150', '1.3', 'TRUE'],
    ['93000', '3/4', '150', '2.0', 'TRUE'],
    ['93000', '3/4', '300', '2.4', 'TRUE'],
    ['93000', '1', '150', '2.7', 'TRUE'],
    ['93000', '1-1/2', '150', '4.2', 'TRUE'],
  ];
  const cageWeightsWs = XLSX.utils.aoa_to_sheet(cageWeightsData);
  XLSX.utils.book_append_sheet(wb, cageWeightsWs, 'Cage Weights');

  // Sheet 8: Seal Ring Prices (only for series with hasSealRing = TRUE)
  const sealRingPricesData = [
    ['Series Number', 'Seal Type', 'Size', 'Rating', 'Fixed Price', 'Active'],
    ['92000', 'Graphite', '1/2', '150', '800', 'TRUE'],
    ['92000', 'Graphite', '3/4', '150', '1000', 'TRUE'],
    ['92000', 'Graphite', '1', '150', '1200', 'TRUE'],
    ['92000', 'Graphite', '1', '300', '1400', 'TRUE'],
    ['92000', 'PTFE', '1/2', '150', '900', 'TRUE'],
    ['92000', 'PTFE', '3/4', '150', '1100', 'TRUE'],
    ['92000', 'PTFE', '1', '150', '1300', 'TRUE'],
    ['93000', 'Graphite', '1/2', '150', '850', 'TRUE'],
    ['93000', 'Graphite', '3/4', '150', '1050', 'TRUE'],
    ['93000', 'Graphite', '3/4', '300', '1250', 'TRUE'],
    ['93000', 'PTFE', '1/2', '150', '950', 'TRUE'],
    ['93000', 'PTFE', '3/4', '150', '1150', 'TRUE'],
  ];
  const sealRingPricesWs = XLSX.utils.aoa_to_sheet(sealRingPricesData);
  XLSX.utils.book_append_sheet(wb, sealRingPricesWs, 'Seal Ring Prices');

  // Sheet 9: Stem Fixed Prices
  const stemFixedPricesData = [
    ['Series Number', 'Size', 'Rating', 'Material Name', 'Fixed Price', 'Active'],
    // Series 91000 with different materials
    ['91000', '1/2', '150', 'SS304 Stem', '1200', 'TRUE'],
    ['91000', '1/2', '150', 'SS316 Stem', '1500', 'TRUE'],
    ['91000', '1/2', '150', 'SS410 Stem', '1000', 'TRUE'],
    ['91000', '1/2', '300', 'SS304 Stem', '1400', 'TRUE'],
    ['91000', '1/2', '300', 'SS316 Stem', '1700', 'TRUE'],
    ['91000', '3/4', '150', 'SS304 Stem', '1600', 'TRUE'],
    ['91000', '3/4', '150', 'SS316 Stem', '2000', 'TRUE'],
    ['91000', '3/4', '300', 'SS304 Stem', '1800', 'TRUE'],
    ['91000', '3/4', '300', 'SS316 Stem', '2200', 'TRUE'],
    ['91000', '1', '150', 'SS304 Stem', '2000', 'TRUE'],
    ['91000', '1', '150', 'SS316 Stem', '2500', 'TRUE'],
    ['91000', '1', '300', 'SS304 Stem', '2400', 'TRUE'],
    ['91000', '1', '300', 'SS316 Stem', '3000', 'TRUE'],
    ['91000', '1-1/2', '150', 'SS304 Stem', '3000', 'TRUE'],
    ['91000', '1-1/2', '150', 'SS316 Stem', '3800', 'TRUE'],
    ['91000', '2', '150', 'SS304 Stem', '4000', 'TRUE'],
    ['91000', '2', '150', 'SS316 Stem', '5000', 'TRUE'],
    // Series 92000
    ['92000', '1/2', '150', 'SS304 Stem', '1300', 'TRUE'],
    ['92000', '1/2', '150', 'SS316 Stem', '1600', 'TRUE'],
    ['92000', '3/4', '150', 'SS304 Stem', '1700', 'TRUE'],
    ['92000', '3/4', '150', 'SS316 Stem', '2100', 'TRUE'],
    ['92000', '1', '150', 'SS304 Stem', '2100', 'TRUE'],
    ['92000', '1', '150', 'SS316 Stem', '2600', 'TRUE'],
    ['92000', '1', '300', 'SS304 Stem', '2500', 'TRUE'],
    ['92000', '1', '300', 'SS316 Stem', '3100', 'TRUE'],
    // Series 93000
    ['93000', '1/2', '150', 'SS304 Stem', '1350', 'TRUE'],
    ['93000', '1/2', '150', 'SS316 Stem', '1650', 'TRUE'],
    ['93000', '3/4', '150', 'SS304 Stem', '1750', 'TRUE'],
    ['93000', '3/4', '150', 'SS316 Stem', '2150', 'TRUE'],
    ['93000', '3/4', '300', 'SS304 Stem', '2000', 'TRUE'],
    ['93000', '3/4', '300', 'SS316 Stem', '2450', 'TRUE'],
    ['93000', '1', '150', 'SS304 Stem', '2150', 'TRUE'],
    ['93000', '1', '150', 'SS316 Stem', '2650', 'TRUE'],
    // Series 94000
    ['94000', '1/2', '150', 'SS304 Stem', '1400', 'TRUE'],
    ['94000', '1/2', '150', 'SS316 Stem', '1700', 'TRUE'],
    ['94000', '1', '150', 'SS304 Stem', '2200', 'TRUE'],
    ['94000', '1', '150', 'SS316 Stem', '2700', 'TRUE'],
    ['94000', '2', '150', 'SS304 Stem', '4200', 'TRUE'],
    ['94000', '2', '150', 'SS316 Stem', '5200', 'TRUE'],
  ];
  const stemFixedPricesWs = XLSX.utils.aoa_to_sheet(stemFixedPricesData);
  XLSX.utils.book_append_sheet(wb, stemFixedPricesWs, 'Stem Fixed Prices');

  // Sheet 10: Actuator Models
  const actuatorModelsData = [
    ['Type', 'Series', 'Model', 'Standard/Special', 'Fixed Price', 'Active'],
    ['Pneumatic', 'Series A', 'PA-50', 'standard', '12000', 'TRUE'],
    ['Pneumatic', 'Series A', 'PA-100', 'standard', '15000', 'TRUE'],
    ['Pneumatic', 'Series A', 'PA-200', 'standard', '18000', 'TRUE'],
    ['Pneumatic', 'Series A', 'PA-300', 'standard', '22000', 'TRUE'],
    ['Pneumatic', 'Series A', 'PA-400', 'special', '28000', 'TRUE'],
    ['Pneumatic', 'Series B', 'PB-100', 'standard', '16000', 'TRUE'],
    ['Pneumatic', 'Series B', 'PB-200', 'standard', '19000', 'TRUE'],
    ['Electric', 'Series E', 'EL-100', 'standard', '25000', 'TRUE'],
    ['Electric', 'Series E', 'EL-200', 'standard', '30000', 'TRUE'],
    ['Electric', 'Series E', 'EL-300', 'special', '38000', 'TRUE'],
    ['Manual', 'Series M', 'MN-50', 'standard', '5000', 'TRUE'],
    ['Manual', 'Series M', 'MN-100', 'standard', '8000', 'TRUE'],
  ];
  const actuatorModelsWs = XLSX.utils.aoa_to_sheet(actuatorModelsData);
  XLSX.utils.book_append_sheet(wb, actuatorModelsWs, 'Actuator Models');

  // Sheet 11: Handwheel Prices
  const handwheelPricesData = [
    ['Type', 'Series', 'Model', 'Standard/Special', 'Fixed Price', 'Active'],
    ['Manual', 'Series H', 'HW-50', 'standard', '1500', 'TRUE'],
    ['Manual', 'Series H', 'HW-100', 'standard', '2000', 'TRUE'],
    ['Manual', 'Series H', 'HW-200', 'standard', '2500', 'TRUE'],
    ['Manual', 'Series H', 'HW-300', 'standard', '3000', 'TRUE'],
    ['Manual', 'Series H', 'HW-400', 'special', '3500', 'TRUE'],
    ['Chainwheel', 'Series C', 'CW-100', 'standard', '3000', 'TRUE'],
    ['Chainwheel', 'Series C', 'CW-200', 'standard', '4000', 'TRUE'],
  ];
  const handwheelPricesWs = XLSX.utils.aoa_to_sheet(handwheelPricesData);
  XLSX.utils.book_append_sheet(wb, handwheelPricesWs, 'Handwheel Prices');

  // Generate and download
  XLSX.writeFile(wb, 'Unicorn_Valves_Pricing_Template_COMPLETE.xlsx');
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