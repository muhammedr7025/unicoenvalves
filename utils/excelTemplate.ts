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

  // Sheet 5: Plug Weights (UPDATED - includes Seal Ring info)
  const plugWeightsData = [
    ['Series Number', 'Size', 'Rating', 'Plug Type', 'Weight (kg)', 'Has Seal Ring', 'Seal Ring Price', 'Active'],
    ['91000', '1/2', '150', 'Standard', '0.5', 'FALSE', '', 'TRUE'],
    ['91000', '1/2', '150', 'Modified', '0.6', 'TRUE', '800', 'TRUE'],
    ['91000', '3/4', '150', 'Standard', '0.7', 'FALSE', '', 'TRUE'],
    ['92000', '1/2', '150', 'Standard', '0.55', 'TRUE', '900', 'TRUE'],
    ['92000', '1/2', '150', 'Modified', '0.6', 'TRUE', '1000', 'TRUE'],
    ['92000', '3/4', '150', 'Standard', '0.7', 'TRUE', '1200', 'TRUE'],
    ['93000', '3/4', '300', 'Modified', '0.8', 'FALSE', '', 'TRUE'],
  ];
  const plugWeightsWs = XLSX.utils.aoa_to_sheet(plugWeightsData);
  XLSX.utils.book_append_sheet(wb, plugWeightsWs, 'Plug Weights');

  // Sheet 6: Seat Weights (UPDATED - includes Cage info)
  const seatWeightsData = [
    ['Series Number', 'Size', 'Rating', 'Seat Type', 'Weight (kg)', 'Has Cage', 'Cage Weight', 'Active'],
    ['91000', '1/2', '150', 'Soft Seat', '0.4', 'FALSE', '', 'TRUE'],
    ['91000', '1/2', '150', 'Metal Seat', '0.5', 'FALSE', '', 'TRUE'],
    ['91000', '3/4', '150', 'Soft Seat', '0.6', 'FALSE', '', 'TRUE'],
    ['92000', '1/2', '150', 'Metal Seat', '0.55', 'TRUE', '1.2', 'TRUE'],
    ['92000', '1/2', '150', 'Cage Guided', '0.6', 'TRUE', '1.5', 'TRUE'],
    ['92000', '3/4', '150', 'Cage Guided', '0.7', 'TRUE', '1.8', 'TRUE'],
    ['93000', '3/4', '300', 'Soft Seat', '0.7', 'FALSE', '', 'TRUE'],
    ['93000', '3/4', '300', 'Cage Guided', '0.8', 'TRUE', '2.0', 'TRUE'],
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

  // NOTE: Cage Weights are now included in the Seat Weights sheet
  // NOTE: Seal Ring Prices are now included in the Plug Weights sheet
  // The separate Seal Ring Prices sheet is no longer needed for new imports

  // Sheet 9: Actuator Models
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
    ['Actuator Model', 'Fixed Price', 'Active'],
    ['PA-100', '2000', 'TRUE'],
    ['PA-200', '2500', 'TRUE'],
    ['PA-300', '3000', 'TRUE'],
    ['EB-100', '3500', 'TRUE'],
    ['EB-200', '4000', 'TRUE'],
    ['MC-50', '1500', 'TRUE'],
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