import * as XLSX from 'xlsx';

export interface ExcelData {
  materials: any[];
  series: any[];
  bodyWeights: any[];
  bonnetWeights: any[];
  plugWeights: any[];
  seatWeights: any[];
  stemWeights: any[];
  cagePrices: any[];
}

export function generateExcelTemplate(): void {
  const wb = XLSX.utils.book_new();
  
  // Sheet 1: Materials
  const materialsData = [
    ['Material Name', 'Price Per Kg', 'Active'],
    ['Aluminum', '250', 'TRUE'],
    ['Steel', '180', 'TRUE'],
    ['Stainless Steel', '450', 'TRUE'],
    ['Bronze', '550', 'TRUE'],
  ];
  const materialsWs = XLSX.utils.aoa_to_sheet(materialsData);
  XLSX.utils.book_append_sheet(wb, materialsWs, 'Materials');
  
  // Sheet 2: Series
  const seriesData = [
    ['Product Type', 'Series Number', 'Series Name', 'Has Cage', 'Active'],
    ['SV', '91000', 'SV Series 91000', 'FALSE', 'TRUE'],
    ['SV', '92000', 'SV Series 92000', 'TRUE', 'TRUE'],
    ['CV', '93000', 'CV Series 93000', 'TRUE', 'TRUE'],
  ];
  const seriesWs = XLSX.utils.aoa_to_sheet(seriesData);
  XLSX.utils.book_append_sheet(wb, seriesWs, 'Series');
  
  // Sheet 3: Body Weights
  const bodyWeightsData = [
    ['Series Number', 'Size', 'Rating', 'End Connect Type', 'Weight (kg)'],
    ['91000', '1/2', '150', 'Type1', '2.5'],
    ['91000', '1/2', '150', 'Type2', '2.8'],
    ['91000', '3/4', '150', 'Type1', '3.2'],
    ['91000', '1', '300', 'Type1', '4.5'],
  ];
  const bodyWeightsWs = XLSX.utils.aoa_to_sheet(bodyWeightsData);
  XLSX.utils.book_append_sheet(wb, bodyWeightsWs, 'Body Weights');
  
  // Sheet 4: Bonnet Weights
  const bonnetWeightsData = [
    ['Series Number', 'Size', 'Rating', 'Bonnet Type', 'Weight (kg)'],
    ['91000', '1/2', '150', 'Type1', '1.5'],
    ['91000', '1/2', '150', 'Type2', '1.8'],
    ['91000', '3/4', '150', 'Type1', '2.2'],
  ];
  const bonnetWeightsWs = XLSX.utils.aoa_to_sheet(bonnetWeightsData);
  XLSX.utils.book_append_sheet(wb, bonnetWeightsWs, 'Bonnet Weights');
  
  // Sheet 5: Plug Weights
  const plugWeightsData = [
    ['Series Number', 'Size', 'Rating', 'Plug Type', 'Weight (kg)'],
    ['91000', '1/2', '150', 'Type1', '0.5'],
    ['91000', '1/2', '150', 'Type2', '0.6'],
  ];
  const plugWeightsWs = XLSX.utils.aoa_to_sheet(plugWeightsData);
  XLSX.utils.book_append_sheet(wb, plugWeightsWs, 'Plug Weights');
  
  // Sheet 6: Seat Weights
  const seatWeightsData = [
    ['Series Number', 'Size', 'Rating', 'Seat Type', 'Weight (kg)'],
    ['91000', '1/2', '150', 'Type1', '0.4'],
    ['91000', '1/2', '150', 'Type2', '0.5'],
  ];
  const seatWeightsWs = XLSX.utils.aoa_to_sheet(seatWeightsData);
  XLSX.utils.book_append_sheet(wb, seatWeightsWs, 'Seat Weights');
  
  // Sheet 7: Stem Weights
  const stemWeightsData = [
    ['Series Number', 'Size', 'Rating', 'Stem Type', 'Weight (kg)'],
    ['91000', '1/2', '150', 'Type1', '0.3'],
    ['91000', '1/2', '150', 'Type2', '0.35'],
  ];
  const stemWeightsWs = XLSX.utils.aoa_to_sheet(stemWeightsData);
  XLSX.utils.book_append_sheet(wb, stemWeightsWs, 'Stem Weights');
  
  // Sheet 8: Cage Prices (only for series with cage support)
  const cagePricesData = [
    ['Series Number', 'Size', 'Fixed Price'],
    ['92000', '1/2', '5000'],
    ['92000', '3/4', '6500'],
    ['93000', '1', '7500'],
  ];
  const cagePricesWs = XLSX.utils.aoa_to_sheet(cagePricesData);
  XLSX.utils.book_append_sheet(wb, cagePricesWs, 'Cage Prices');
  
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
          stemWeights: [],
          cagePrices: [],
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
        
        // Parse Stem Weights
        if (workbook.SheetNames.includes('Stem Weights')) {
          const sheet = workbook.Sheets['Stem Weights'];
          const json = XLSX.utils.sheet_to_json(sheet);
          result.stemWeights = json;
        }
        
        // Parse Cage Prices
        if (workbook.SheetNames.includes('Cage Prices')) {
          const sheet = workbook.Sheets['Cage Prices'];
          const json = XLSX.utils.sheet_to_json(sheet);
          result.cagePrices = json;
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