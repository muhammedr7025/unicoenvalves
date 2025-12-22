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
  machineRates: any[];
  machiningHours: any[];
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

  // Sheet 5: Plug Weights (SIMPLIFIED - no type, just weight lookup)
  const plugWeightsData = [
    ['Series Number', 'Size', 'Rating', 'Weight (kg)', 'Active'],
    ['91000', '1/2', '150', '0.5', 'TRUE'],
    ['91000', '3/4', '150', '0.7', 'TRUE'],
    ['91000', '1', '150', '1.2', 'TRUE'],
    ['92000', '1/2', '150', '0.55', 'TRUE'],
    ['92000', '3/4', '150', '0.75', 'TRUE'],
    ['93000', '3/4', '300', '0.8', 'TRUE'],
    ['93000', '1', '300', '1.5', 'TRUE'],
  ];
  const plugWeightsWs = XLSX.utils.aoa_to_sheet(plugWeightsData);
  XLSX.utils.book_append_sheet(wb, plugWeightsWs, 'Plug Weights');

  // Sheet 6: Seat Weights (SIMPLIFIED - just weight lookup)
  const seatWeightsData = [
    ['Series Number', 'Size', 'Rating', 'Weight (kg)', 'Active'],
    ['91000', '1/2', '150', '0.4', 'TRUE'],
    ['91000', '3/4', '150', '0.6', 'TRUE'],
    ['91000', '1', '150', '0.9', 'TRUE'],
    ['92000', '1/2', '150', '0.5', 'TRUE'],
    ['92000', '3/4', '150', '0.7', 'TRUE'],
    ['93000', '3/4', '300', '0.8', 'TRUE'],
    ['93000', '1', '300', '1.2', 'TRUE'],
  ];
  const seatWeightsWs = XLSX.utils.aoa_to_sheet(seatWeightsData);
  XLSX.utils.book_append_sheet(wb, seatWeightsWs, 'Seat Weights');

  // Sheet 7: Stem Fixed Prices (uses Material Name instead of Material Code)
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

  // Sheet 8: Seal Ring Prices (INDEPENDENT - has its own seal type)
  const sealRingPricesData = [
    ['Series Number', 'Seal Type', 'Size', 'Rating', 'Fixed Price', 'Active'],
    ['92000', 'Type1', '1/2', '150', '800', 'TRUE'],
    ['92000', 'Type2', '1/2', '150', '1000', 'TRUE'],
    ['92000', 'Type1', '3/4', '150', '1200', 'TRUE'],
    ['92000', 'Type2', '3/4', '150', '1400', 'TRUE'],
    ['93000', 'Type1', '3/4', '300', '1500', 'TRUE'],
    ['93000', 'Type2', '1', '300', '1800', 'TRUE'],
  ];
  const sealRingPricesWs = XLSX.utils.aoa_to_sheet(sealRingPricesData);
  XLSX.utils.book_append_sheet(wb, sealRingPricesWs, 'Seal Ring Prices');

  // Sheet 9: Cage Weights (INDEPENDENT - weight lookup by series+size+rating)
  const cageWeightsData = [
    ['Series Number', 'Size', 'Rating', 'Weight (kg)', 'Active'],
    ['92000', '1/2', '150', '1.2', 'TRUE'],
    ['92000', '3/4', '150', '1.5', 'TRUE'],
    ['92000', '1', '150', '2.0', 'TRUE'],
    ['93000', '3/4', '300', '2.2', 'TRUE'],
    ['93000', '1', '300', '2.8', 'TRUE'],
    ['93000', '1-1/2', '300', '3.5', 'TRUE'],
  ];
  const cageWeightsWs = XLSX.utils.aoa_to_sheet(cageWeightsData);
  XLSX.utils.book_append_sheet(wb, cageWeightsWs, 'Cage Weights');

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

  // Sheet 10: Handwheel Prices  (UPDATED - matches actuator combination)
  const handwheelPricesData = [
    ['Type', 'Series', 'Model', 'Standard/Special', 'Fixed Price', 'Active'],
    ['Pneumatic', 'Series A', 'PA-100', 'standard', '2000', 'TRUE'],
    ['Pneumatic', 'Series A', 'PA-200', 'standard', '2500', 'TRUE'],
    ['Pneumatic', 'Series A', 'PA-300', 'special', '3000', 'TRUE'],
    ['Electric', 'Series B', 'EB-100', 'standard', '3500', 'TRUE'],
    ['Electric', 'Series B', 'EB-200', 'special', '4000', 'TRUE'],
    ['Manual', 'Series C', 'MC-50', 'standard', '1500', 'TRUE'],
  ];
  const handwheelPricesWs = XLSX.utils.aoa_to_sheet(handwheelPricesData);
  XLSX.utils.book_append_sheet(wb, handwheelPricesWs, 'Handwheel Prices');

  // Sheet 11: Machine Rates
  const machineRatesData = [
    ['Machine Name', 'Rate Per Hour', 'Active'],
    ['CNC Lathe', '1200', 'TRUE'],
    ['VMC', '1500', 'TRUE'],
    ['Manual Lathe', '800', 'TRUE'],
    ['Drilling Machine', '600', 'TRUE'],
  ];
  const machineRatesWs = XLSX.utils.aoa_to_sheet(machineRatesData);
  XLSX.utils.book_append_sheet(wb, machineRatesWs, 'Machine Rates');

  // Sheet 12: Machining Hours
  const machiningHoursData = [
    ['Series Number', 'Size', 'Rating', 'Part Type', 'Trim Type', 'Hours', 'Active'],
    ['91000', '1/2', '150', 'Body', '', '2.5', 'TRUE'],
    ['91000', '1/2', '150', 'Bonnet', '', '1.5', 'TRUE'],
    ['91000', '1/2', '150', 'Plug', 'Linear', '1.2', 'TRUE'],
    ['91000', '1/2', '150', 'Seat', 'Linear', '0.8', 'TRUE'],
  ];
  const machiningHoursWs = XLSX.utils.aoa_to_sheet(machiningHoursData);
  XLSX.utils.book_append_sheet(wb, machiningHoursWs, 'Machining Hours');

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
          machineRates: [],
          machiningHours: [],
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

        // Parse Machine Rates
        if (workbook.SheetNames.includes('Machine Rates')) {
          const sheet = workbook.Sheets['Machine Rates'];
          const json = XLSX.utils.sheet_to_json(sheet);
          result.machineRates = json;
        }

        // Parse Machining Hours
        if (workbook.SheetNames.includes('Machining Hours')) {
          const sheet = workbook.Sheets['Machining Hours'];
          const json = XLSX.utils.sheet_to_json(sheet);
          result.machiningHours = json;
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

export function generateMachineCostTemplate(): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Machine Rates
  const machineRatesData = [
    ['Machine Name', 'Rate Per Hour', 'Active'],
    ['CNC Lathe', '1200', 'TRUE'],
    ['VMC', '1500', 'TRUE'],
    ['Manual Lathe', '800', 'TRUE'],
    ['Drilling Machine', '600', 'TRUE'],
  ];
  const machineRatesWs = XLSX.utils.aoa_to_sheet(machineRatesData);
  XLSX.utils.book_append_sheet(wb, machineRatesWs, 'Machine Rates');

  // Sheet 2: Machining Hours
  const machiningHoursData = [
    ['Series Number', 'Size', 'Rating', 'Part Type', 'Trim Type', 'Hours', 'Active'],
    ['91000', '1/2', '150', 'Body', '', '2.5', 'TRUE'],
    ['91000', '1/2', '150', 'Bonnet', '', '1.5', 'TRUE'],
    ['91000', '1/2', '150', 'Plug', 'Linear', '1.2', 'TRUE'],
    ['91000', '1/2', '150', 'Seat', 'Linear', '0.8', 'TRUE'],
  ];
  const machiningHoursWs = XLSX.utils.aoa_to_sheet(machiningHoursData);
  XLSX.utils.book_append_sheet(wb, machiningHoursWs, 'Machining Hours');

  // Generate and download
  XLSX.writeFile(wb, 'Unicorn_Machine_Cost_Template.xlsx');
}

export function parseMachineCostExcel(file: File): Promise<{ machineRates: any[], machiningHours: any[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const result = {
          machineRates: [],
          machiningHours: [],
        };

        // Parse Machine Rates
        if (workbook.SheetNames.includes('Machine Rates')) {
          const sheet = workbook.Sheets['Machine Rates'];
          const json = XLSX.utils.sheet_to_json(sheet);
          result.machineRates = json as any[];
        }

        // Parse Machining Hours
        if (workbook.SheetNames.includes('Machining Hours')) {
          const sheet = workbook.Sheets['Machining Hours'];
          const json = XLSX.utils.sheet_to_json(sheet);
          result.machiningHours = json as any[];
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