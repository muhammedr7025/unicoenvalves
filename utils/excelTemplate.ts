import * as XLSX from 'xlsx';

export interface ExcelData {
  materials: any[];
  series: any[];
  bodyWeights: any[];
  bonnetWeights: any[];
  plugWeights: any[];
  seatWeights: any[];
  stemFixedPrices: any[]; // CHANGED from stemWeights
  cageWeights: any[]; // CHANGED from cagePrices
  sealRingPrices: any[]; // NEW
  actuatorModels: any[];
  handwheelPrices: any[];
}

export function generateExcelTemplate(): void {
  const wb = XLSX.utils.book_new();
  
  // Sheet 1: Materials (UPDATED with Material Group and Material Code)
  const materialsData = [
    ['Material Name', 'Material Code', 'Price Per Kg (INR)', 'Material Group', 'Active'],
    ['Aluminum AL100', 'AL100', '250', 'BodyBonnet', 'TRUE'],
    ['Steel ST200', 'ST200', '180', 'BodyBonnet', 'TRUE'],
    ['Stainless Steel SS304', 'SS304', '450', 'BodyBonnet', 'TRUE'],
    ['Bronze BR100', 'BR100', '550', 'Plug', 'TRUE'],
    ['Brass BS100', 'BS100', '420', 'Plug', 'TRUE'],
    ['PTFE Seat', 'PTFE01', '800', 'Seat', 'TRUE'],
    ['Metal Seat MS100', 'MS100', '600', 'Seat', 'TRUE'],
    ['Stem Steel ST300', 'ST300', '350', 'Stem', 'TRUE'],
    ['Stem SS316', 'SS316', '500', 'Stem', 'TRUE'],
    ['Cage Material CG100', 'CG100', '400', 'Cage', 'TRUE'],
    ['Cage SS CG200', 'CG200', '550', 'Cage', 'TRUE'],
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
  
  // Sheet 5: Plug Weights
  const plugWeightsData = [
    ['Series Number', 'Size', 'Rating', 'Plug Type', 'Weight (kg)', 'Active'],
    ['91000', '1/2', '150', 'Standard', '0.5', 'TRUE'],
    ['91000', '1/2', '150', 'Modified', '0.6', 'TRUE'],
    ['91000', '3/4', '150', 'Standard', '0.7', 'TRUE'],
    ['92000', '1/2', '150', 'Standard', '0.55', 'TRUE'],
    ['93000', '3/4', '300', 'Modified', '0.8', 'TRUE'],
  ];
  const plugWeightsWs = XLSX.utils.aoa_to_sheet(plugWeightsData);
  XLSX.utils.book_append_sheet(wb, plugWeightsWs, 'Plug Weights');
  
  // Sheet 6: Seat Weights
  const seatWeightsData = [
    ['Series Number', 'Size', 'Rating', 'Seat Type', 'Weight (kg)', 'Active'],
    ['91000', '1/2', '150', 'Soft Seat', '0.4', 'TRUE'],
    ['91000', '1/2', '150', 'Metal Seat', '0.5', 'TRUE'],
    ['91000', '3/4', '150', 'Soft Seat', '0.6', 'TRUE'],
    ['92000', '1/2', '150', 'Metal Seat', '0.55', 'TRUE'],
    ['93000', '3/4', '300', 'Soft Seat', '0.7', 'TRUE'],
  ];
  const seatWeightsWs = XLSX.utils.aoa_to_sheet(seatWeightsData);
  XLSX.utils.book_append_sheet(wb, seatWeightsWs, 'Seat Weights');
  
  // Sheet 7: Stem Fixed Prices (CHANGED - Fixed price based on series, size, rating, material)
  const stemFixedPricesData = [
    ['Series Number', 'Size', 'Rating', 'Material Code', 'Fixed Price', 'Active'],
    ['91000', '1/2', '150', 'ST300', '1500', 'TRUE'],
    ['91000', '1/2', '150', 'SS316', '2000', 'TRUE'],
    ['91000', '1/2', '300', 'ST300', '1800', 'TRUE'],
    ['91000', '1/2', '300', 'SS316', '2300', 'TRUE'],
    ['91000', '3/4', '150', 'ST300', '2000', 'TRUE'],
    ['91000', '3/4', '150', 'SS316', '2500', 'TRUE'],
    ['92000', '1/2', '150', 'ST300', '1600', 'TRUE'],
    ['92000', '1/2', '150', 'SS316', '2100', 'TRUE'],
    ['93000', '3/4', '300', 'ST300', '2200', 'TRUE'],
    ['93000', '3/4', '300', 'SS316', '2800', 'TRUE'],
  ];
  const stemFixedPricesWs = XLSX.utils.aoa_to_sheet(stemFixedPricesData);
  XLSX.utils.book_append_sheet(wb, stemFixedPricesWs, 'Stem Fixed Prices');
  
  // Sheet 8: Cage Weights (CHANGED - Weight-based calculation)
  const cageWeightsData = [
    ['Series Number', 'Size', 'Rating', 'Weight (kg)', 'Active'],
    ['92000', '1/2', '150', '1.2', 'TRUE'],
    ['92000', '1/2', '300', '1.5', 'TRUE'],
    ['92000', '3/4', '150', '1.8', 'TRUE'],
    ['92000', '3/4', '300', '2.2', 'TRUE'],
    ['92000', '1', '150', '2.5', 'TRUE'],
    ['93000', '1/2', '150', '1.3', 'TRUE'],
    ['93000', '3/4', '300', '2.0', 'TRUE'],
  ];
  const cageWeightsWs = XLSX.utils.aoa_to_sheet(cageWeightsData);
  XLSX.utils.book_append_sheet(wb, cageWeightsWs, 'Cage Weights');
  
  // Sheet 9: Seal Ring Prices (NEW)
  const sealRingPricesData = [
    ['Series Number', 'Plug Type', 'Size', 'Rating', 'Fixed Price', 'Active'],
    ['92000', 'Standard', '1/2', '150', '800', 'TRUE'],
    ['92000', 'Standard', '1/2', '300', '1000', 'TRUE'],
    ['92000', 'Modified', '1/2', '150', '900', 'TRUE'],
    ['92000', 'Modified', '1/2', '300', '1100', 'TRUE'],
    ['92000', 'Standard', '3/4', '150', '1200', 'TRUE'],
    ['92000', 'Modified', '3/4', '300', '1500', 'TRUE'],
  ];
  const sealRingPricesWs = XLSX.utils.aoa_to_sheet(sealRingPricesData);
  XLSX.utils.book_append_sheet(wb, sealRingPricesWs, 'Seal Ring Prices');
  
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