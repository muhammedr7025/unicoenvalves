const XLSX = require('xlsx');
const path = require('path');

// =============================================
// FILE 1: PRICING DATA (for Admin > Pricing)
// =============================================
function createPricingDataExcel() {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Materials
    const materialsData = [
        ['Material Name', 'Price Per Kg (INR)', 'Material Group', 'Active'],
        // BodyBonnet Materials
        ['Carbon Steel CS A216-WCB', '180', 'BodyBonnet', 'TRUE'],
        ['Stainless Steel SS304', '450', 'BodyBonnet', 'TRUE'],
        ['Stainless Steel SS316', '550', 'BodyBonnet', 'TRUE'],
        ['Alloy Steel A217-WC6', '320', 'BodyBonnet', 'TRUE'],
        ['Chrome Moly A217-WC9', '380', 'BodyBonnet', 'TRUE'],
        // Plug Materials
        ['SS304 Plug', '450', 'Plug', 'TRUE'],
        ['SS316 Plug', '550', 'Plug', 'TRUE'],
        ['Stellite Plug', '1200', 'Plug', 'TRUE'],
        // Seat Materials
        ['SS304 Seat', '450', 'Seat', 'TRUE'],
        ['SS316 Seat', '550', 'Seat', 'TRUE'],
        ['Stellite Seat', '1200', 'Seat', 'TRUE'],
        // Stem Materials
        ['SS304 Stem', '450', 'Stem', 'TRUE'],
        ['SS316 Stem', '550', 'Stem', 'TRUE'],
        ['SS410 Stem', '380', 'Stem', 'TRUE'],
        // Cage Materials
        ['SS304 Cage', '450', 'Cage', 'TRUE'],
        ['SS316 Cage', '550', 'Cage', 'TRUE'],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(materialsData), 'Materials');

    // Sheet 2: Series
    const seriesData = [
        ['Product Type', 'Series Number', 'Series Name', 'Has Cage', 'Has Seal Ring', 'Active'],
        ['Globe Valve', '91000', 'Standard Globe Valve', 'FALSE', 'FALSE', 'TRUE'],
        ['Globe Valve', '92000', 'Cage Guided Globe Valve', 'TRUE', 'TRUE', 'TRUE'],
        ['Angle Valve', '93000', 'Angle Control Valve', 'TRUE', 'TRUE', 'TRUE'],
        ['Ball Valve', '94000', 'Trunnion Ball Valve', 'FALSE', 'FALSE', 'TRUE'],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(seriesData), 'Series');

    // Sheet 3: Body Weights
    const bodyWeightsData = [
        ['Series Number', 'Size', 'Rating', 'End Connect Type', 'Weight (kg)', 'Active'],
        ['91000', '1/2', '150', 'Flanged', '2.5', 'TRUE'],
        ['91000', '1/2', '150', 'Threaded', '2.3', 'TRUE'],
        ['91000', '1/2', '300', 'Flanged', '3.2', 'TRUE'],
        ['91000', '3/4', '150', 'Flanged', '3.8', 'TRUE'],
        ['91000', '1', '150', 'Flanged', '5.2', 'TRUE'],
        ['91000', '1-1/2', '150', 'Flanged', '8.5', 'TRUE'],
        ['91000', '2', '150', 'Flanged', '12.5', 'TRUE'],
        ['92000', '1/2', '150', 'Flanged', '2.7', 'TRUE'],
        ['92000', '1', '150', 'Flanged', '5.5', 'TRUE'],
        ['92000', '2', '150', 'Flanged', '13.0', 'TRUE'],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(bodyWeightsData), 'Body Weights');

    // Sheet 4: Bonnet Weights
    const bonnetWeightsData = [
        ['Series Number', 'Size', 'Rating', 'Bonnet Type', 'Weight (kg)', 'Active'],
        ['91000', '1/2', '150', 'Standard', '1.2', 'TRUE'],
        ['91000', '1/2', '150', 'Extended', '1.8', 'TRUE'],
        ['91000', '3/4', '150', 'Standard', '1.8', 'TRUE'],
        ['91000', '1', '150', 'Standard', '2.5', 'TRUE'],
        ['91000', '1-1/2', '150', 'Standard', '4.0', 'TRUE'],
        ['91000', '2', '150', 'Standard', '5.5', 'TRUE'],
        ['92000', '1/2', '150', 'Standard', '1.4', 'TRUE'],
        ['92000', '1', '150', 'Standard', '2.8', 'TRUE'],
        ['92000', '2', '150', 'Standard', '5.8', 'TRUE'],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(bonnetWeightsData), 'Bonnet Weights');

    // Sheet 5: Plug Weights
    const plugWeightsData = [
        ['Series Number', 'Size', 'Rating', 'Weight (kg)', 'Active'],
        ['91000', '1/2', '150', '0.4', 'TRUE'],
        ['91000', '3/4', '150', '0.6', 'TRUE'],
        ['91000', '1', '150', '0.8', 'TRUE'],
        ['91000', '1-1/2', '150', '1.5', 'TRUE'],
        ['91000', '2', '150', '2.2', 'TRUE'],
        ['92000', '1/2', '150', '0.45', 'TRUE'],
        ['92000', '1', '150', '0.85', 'TRUE'],
        ['92000', '2', '150', '2.3', 'TRUE'],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(plugWeightsData), 'Plug Weights');

    // Sheet 6: Seat Weights
    const seatWeightsData = [
        ['Series Number', 'Size', 'Rating', 'Weight (kg)', 'Active'],
        ['91000', '1/2', '150', '0.3', 'TRUE'],
        ['91000', '3/4', '150', '0.5', 'TRUE'],
        ['91000', '1', '150', '0.7', 'TRUE'],
        ['91000', '1-1/2', '150', '1.2', 'TRUE'],
        ['91000', '2', '150', '1.8', 'TRUE'],
        ['92000', '1/2', '150', '0.35', 'TRUE'],
        ['92000', '1', '150', '0.75', 'TRUE'],
        ['92000', '2', '150', '1.9', 'TRUE'],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(seatWeightsData), 'Seat Weights');

    // Sheet 7: Cage Weights (for series with hasCage=TRUE)
    const cageWeightsData = [
        ['Series Number', 'Size', 'Rating', 'Weight (kg)', 'Active'],
        ['92000', '1/2', '150', '1.2', 'TRUE'],
        ['92000', '1', '150', '2.5', 'TRUE'],
        ['92000', '2', '150', '6.0', 'TRUE'],
        ['93000', '1/2', '150', '1.3', 'TRUE'],
        ['93000', '1', '150', '2.7', 'TRUE'],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(cageWeightsData), 'Cage Weights');

    // Sheet 8: Seal Ring Prices (for series with hasSealRing=TRUE)
    const sealRingPricesData = [
        ['Series Number', 'Seal Type', 'Size', 'Rating', 'Fixed Price', 'Active'],
        ['92000', 'Graphite', '1/2', '150', '800', 'TRUE'],
        ['92000', 'Graphite', '1', '150', '1200', 'TRUE'],
        ['92000', 'Graphite', '2', '150', '1800', 'TRUE'],
        ['92000', 'PTFE', '1/2', '150', '900', 'TRUE'],
        ['92000', 'PTFE', '1', '150', '1300', 'TRUE'],
        ['93000', 'Graphite', '1/2', '150', '850', 'TRUE'],
        ['93000', 'Graphite', '1', '150', '1250', 'TRUE'],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sealRingPricesData), 'Seal Ring Prices');

    // Sheet 9: Stem Fixed Prices
    const stemFixedPricesData = [
        ['Series Number', 'Size', 'Rating', 'Material Name', 'Fixed Price', 'Active'],
        ['91000', '1/2', '150', 'SS304 Stem', '1200', 'TRUE'],
        ['91000', '1/2', '150', 'SS316 Stem', '1500', 'TRUE'],
        ['91000', '3/4', '150', 'SS304 Stem', '1600', 'TRUE'],
        ['91000', '3/4', '150', 'SS316 Stem', '2000', 'TRUE'],
        ['91000', '1', '150', 'SS304 Stem', '2000', 'TRUE'],
        ['91000', '1', '150', 'SS316 Stem', '2500', 'TRUE'],
        ['91000', '1-1/2', '150', 'SS304 Stem', '3000', 'TRUE'],
        ['91000', '2', '150', 'SS304 Stem', '4000', 'TRUE'],
        ['92000', '1/2', '150', 'SS304 Stem', '1300', 'TRUE'],
        ['92000', '1', '150', 'SS304 Stem', '2100', 'TRUE'],
        ['92000', '2', '150', 'SS304 Stem', '4500', 'TRUE'],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(stemFixedPricesData), 'Stem Fixed Prices');

    // Sheet 10: Actuator Models
    const actuatorModelsData = [
        ['Type', 'Series', 'Model', 'Standard/Special', 'Fixed Price', 'Active'],
        ['Pneumatic', 'Series A', 'PA-50', 'standard', '12000', 'TRUE'],
        ['Pneumatic', 'Series A', 'PA-100', 'standard', '15000', 'TRUE'],
        ['Pneumatic', 'Series A', 'PA-200', 'standard', '18000', 'TRUE'],
        ['Pneumatic', 'Series B', 'PB-100', 'standard', '16000', 'TRUE'],
        ['Electric', 'Series E', 'EL-100', 'standard', '25000', 'TRUE'],
        ['Electric', 'Series E', 'EL-200', 'standard', '30000', 'TRUE'],
        ['Manual', 'Series M', 'MN-50', 'standard', '5000', 'TRUE'],
        ['Manual', 'Series M', 'MN-100', 'standard', '8000', 'TRUE'],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(actuatorModelsData), 'Actuator Models');

    // Sheet 11: Handwheel Prices
    const handwheelPricesData = [
        ['Type', 'Series', 'Model', 'Standard/Special', 'Fixed Price', 'Active'],
        ['Manual', 'Series H', 'HW-50', 'standard', '1500', 'TRUE'],
        ['Manual', 'Series H', 'HW-100', 'standard', '2000', 'TRUE'],
        ['Manual', 'Series H', 'HW-200', 'standard', '2500', 'TRUE'],
        ['Chainwheel', 'Series C', 'CW-100', 'standard', '3000', 'TRUE'],
        ['Chainwheel', 'Series C', 'CW-200', 'standard', '4000', 'TRUE'],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(handwheelPricesData), 'Handwheel Prices');

    const outputPath = path.join(__dirname, '..', 'templates', 'Unicorn_Valves_Pricing_Data.xlsx');
    XLSX.writeFile(wb, outputPath);
    console.log(`✅ Created: ${outputPath}`);
}

// =============================================
// FILE 2: MACHINING COSTS (for Admin > Machine Pricing)
// =============================================
function createMachiningCostsExcel() {
    const wb = XLSX.utils.book_new();

    // Machining Prices - All components on one sheet
    const machiningData = [
        ['Component', 'SeriesNumber', 'Size', 'Rating', 'TypeKey', 'MaterialName', 'FixedPrice'],

        // BODY (TypeKey = End Connect Type)
        ['Body', '91000', '1/2', '150', 'Flanged', 'Stainless Steel SS316', '2500'],
        ['Body', '91000', '1/2', '150', 'Flanged', 'Stainless Steel SS304', '2000'],
        ['Body', '91000', '1/2', '150', 'Threaded', 'Stainless Steel SS316', '2300'],
        ['Body', '91000', '3/4', '150', 'Flanged', 'Stainless Steel SS316', '3200'],
        ['Body', '91000', '1', '150', 'Flanged', 'Stainless Steel SS316', '4000'],
        ['Body', '91000', '1-1/2', '150', 'Flanged', 'Stainless Steel SS316', '5500'],
        ['Body', '91000', '2', '150', 'Flanged', 'Stainless Steel SS316', '6500'],
        ['Body', '92000', '1/2', '150', 'Flanged', 'Stainless Steel SS316', '2700'],
        ['Body', '92000', '1', '150', 'Flanged', 'Stainless Steel SS316', '4300'],
        ['Body', '92000', '2', '150', 'Flanged', 'Stainless Steel SS316', '7000'],

        // BONNET (TypeKey = Bonnet Type)
        ['Bonnet', '91000', '1/2', '150', 'Standard', 'Stainless Steel SS316', '1500'],
        ['Bonnet', '91000', '1/2', '150', 'Extended', 'Stainless Steel SS316', '2000'],
        ['Bonnet', '91000', '3/4', '150', 'Standard', 'Stainless Steel SS316', '2000'],
        ['Bonnet', '91000', '1', '150', 'Standard', 'Stainless Steel SS316', '2500'],
        ['Bonnet', '91000', '1-1/2', '150', 'Standard', 'Stainless Steel SS316', '3500'],
        ['Bonnet', '91000', '2', '150', 'Standard', 'Stainless Steel SS316', '4000'],
        ['Bonnet', '92000', '1/2', '150', 'Standard', 'Stainless Steel SS316', '1600'],
        ['Bonnet', '92000', '1', '150', 'Standard', 'Stainless Steel SS316', '2700'],
        ['Bonnet', '92000', '2', '150', 'Standard', 'Stainless Steel SS316', '4300'],

        // PLUG (TypeKey = Trim Type)
        ['Plug', '91000', '1/2', '150', 'Metal Seated', 'SS316 Plug', '1200'],
        ['Plug', '91000', '1/2', '150', 'Soft Seated', 'SS316 Plug', '1000'],
        ['Plug', '91000', '3/4', '150', 'Metal Seated', 'SS316 Plug', '1500'],
        ['Plug', '91000', '1', '150', 'Metal Seated', 'SS316 Plug', '1800'],
        ['Plug', '91000', '1-1/2', '150', 'Metal Seated', 'SS316 Plug', '2500'],
        ['Plug', '91000', '2', '150', 'Metal Seated', 'SS316 Plug', '2800'],
        ['Plug', '92000', '1/2', '150', 'Metal Seated', 'SS316 Plug', '1300'],
        ['Plug', '92000', '1', '150', 'Metal Seated', 'SS316 Plug', '1900'],
        ['Plug', '92000', '2', '150', 'Metal Seated', 'SS316 Plug', '3000'],

        // SEAT (TypeKey = Trim Type)
        ['Seat', '91000', '1/2', '150', 'Metal Seated', 'SS316 Seat', '1000'],
        ['Seat', '91000', '1/2', '150', 'Soft Seated', 'SS316 Seat', '800'],
        ['Seat', '91000', '3/4', '150', 'Metal Seated', 'SS316 Seat', '1300'],
        ['Seat', '91000', '1', '150', 'Metal Seated', 'SS316 Seat', '1600'],
        ['Seat', '91000', '1-1/2', '150', 'Metal Seated', 'SS316 Seat', '2200'],
        ['Seat', '91000', '2', '150', 'Metal Seated', 'SS316 Seat', '2500'],
        ['Seat', '92000', '1/2', '150', 'Metal Seated', 'SS316 Seat', '1100'],
        ['Seat', '92000', '1', '150', 'Metal Seated', 'SS316 Seat', '1700'],
        ['Seat', '92000', '2', '150', 'Metal Seated', 'SS316 Seat', '2700'],

        // STEM (TypeKey = Trim Type)
        ['Stem', '91000', '1/2', '150', 'Standard', 'SS316 Stem', '800'],
        ['Stem', '91000', '3/4', '150', 'Standard', 'SS316 Stem', '1000'],
        ['Stem', '91000', '1', '150', 'Standard', 'SS316 Stem', '1200'],
        ['Stem', '91000', '1-1/2', '150', 'Standard', 'SS316 Stem', '1800'],
        ['Stem', '91000', '2', '150', 'Standard', 'SS316 Stem', '2000'],
        ['Stem', '92000', '1/2', '150', 'Standard', 'SS316 Stem', '850'],
        ['Stem', '92000', '1', '150', 'Standard', 'SS316 Stem', '1300'],
        ['Stem', '92000', '2', '150', 'Standard', 'SS316 Stem', '2200'],

        // CAGE (TypeKey = Trim Type) - Only for series with hasCage=TRUE
        ['Cage', '92000', '1/2', '150', 'Standard', 'SS316 Cage', '1800'],
        ['Cage', '92000', '1', '150', 'Standard', 'SS316 Cage', '2500'],
        ['Cage', '92000', '2', '150', 'Standard', 'SS316 Cage', '4200'],
        ['Cage', '93000', '1/2', '150', 'Standard', 'SS316 Cage', '1900'],
        ['Cage', '93000', '1', '150', 'Standard', 'SS316 Cage', '2700'],
    ];

    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(machiningData), 'Machining Prices');

    const outputPath = path.join(__dirname, '..', 'templates', 'Unicorn_Valves_Machining_Costs.xlsx');
    XLSX.writeFile(wb, outputPath);
    console.log(`✅ Created: ${outputPath}`);
}

// Run both
console.log('\n📊 Generating Excel files for production upload...\n');
createPricingDataExcel();
createMachiningCostsExcel();
console.log('\n✅ Done! Files created in templates/ folder\n');
