import * as XLSX from 'xlsx';
import {
    getAllMaterials,
    getAllSeries,
    getAllBodyWeights,
    getAllBonnetWeights,
    getAllPlugWeights,
    getAllSeatWeights,
    getAllStemFixedPrices,
    getAllCageWeights,
    getAllSealRingPrices,
    getAllActuatorModels,
    getAllHandwheelPrices,
    getAllMachineRates,
    getAllMachiningHours
} from '@/lib/firebase/pricingService';

export async function exportCurrentPricing(): Promise<void> {
    try {
        console.log('Starting pricing export...');

        // Fetch all pricing data
        const [
            materials,
            series,
            bodyWeights,
            bonnetWeights,
            plugWeights,
            seatWeights,
            stemFixedPrices,
            cageWeights,
            sealRingPrices,
            actuatorModels,
            handwheelPrices,
            machineRates,
            machiningHours
        ] = await Promise.all([
            getAllMaterials(),
            getAllSeries(),
            getAllBodyWeights(),
            getAllBonnetWeights(),
            getAllPlugWeights(),
            getAllSeatWeights(),
            getAllStemFixedPrices(),
            getAllCageWeights(),
            getAllSealRingPrices(),
            getAllActuatorModels(),
            getAllHandwheelPrices(),
            getAllMachineRates(),
            getAllMachiningHours()
        ]);

        const wb = XLSX.utils.book_new();

        // Sheet 1: Materials
        const materialsData = [
            ['Material Name', 'Price Per Kg (INR)', 'Material Group', 'Active'],
            ...materials.map(m => [
                m.name,
                m.pricePerKg,
                m.materialGroup,
                m.isActive ? 'TRUE' : 'FALSE'
            ])
        ];
        const materialsWs = XLSX.utils.aoa_to_sheet(materialsData);
        XLSX.utils.book_append_sheet(wb, materialsWs, 'Materials');

        // Sheet 2: Series
        const seriesData = [
            ['Product Type', 'Series Number', 'Series Name', 'Has Cage', 'Has Seal Ring', 'Active'],
            ...series.map(s => [
                s.productType,
                s.seriesNumber,
                s.name,
                s.hasCage ? 'TRUE' : 'FALSE',
                s.hasSealRing ? 'TRUE' : 'FALSE',
                s.isActive ? 'TRUE' : 'FALSE'
            ])
        ];
        const seriesWs = XLSX.utils.aoa_to_sheet(seriesData);
        XLSX.utils.book_append_sheet(wb, seriesWs, 'Series');

        // Sheet 3: Body Weights
        const bodyWeightsData = [
            ['Series Number', 'Size', 'Rating', 'End Connect Type', 'Weight (kg)', 'Active'],
            ...bodyWeights.map((b: any) => [
                b.seriesId,
                b.size,
                b.rating,
                b.endConnectType,
                b.weight,
                b.isActive ? 'TRUE' : 'FALSE'
            ])
        ];
        const bodyWeightsWs = XLSX.utils.aoa_to_sheet(bodyWeightsData);
        XLSX.utils.book_append_sheet(wb, bodyWeightsWs, 'Body Weights');

        // Sheet 4: Bonnet Weights
        const bonnetWeightsData = [
            ['Series Number', 'Size', 'Rating', 'Bonnet Type', 'Weight (kg)', 'Active'],
            ...bonnetWeights.map((b: any) => [
                b.seriesId,
                b.size,
                b.rating,
                b.bonnetType,
                b.weight,
                b.isActive ? 'TRUE' : 'FALSE'
            ])
        ];
        const bonnetWeightsWs = XLSX.utils.aoa_to_sheet(bonnetWeightsData);
        XLSX.utils.book_append_sheet(wb, bonnetWeightsWs, 'Bonnet Weights');

        // Sheet 5: Plug Weights (SIMPLIFIED - no plug type)
        const plugWeightsData = [
            ['Series Number', 'Size', 'Rating', 'Weight (kg)', 'Active'],
            ...plugWeights.map((p: any) => [
                p.seriesId,
                p.size,
                p.rating,
                p.weight,
                p.isActive ? 'TRUE' : 'FALSE'
            ])
        ];
        const plugWeightsWs = XLSX.utils.aoa_to_sheet(plugWeightsData);
        XLSX.utils.book_append_sheet(wb, plugWeightsWs, 'Plug Weights');

        // Sheet 6: Seat Weights
        const seatWeightsData = [
            ['Series Number', 'Size', 'Rating', 'Weight (kg)', 'Active'],
            ...seatWeights.map((s: any) => [
                s.seriesId,
                s.size,
                s.rating,
                s.weight,
                s.isActive ? 'TRUE' : 'FALSE'
            ])
        ];
        const seatWeightsWs = XLSX.utils.aoa_to_sheet(seatWeightsData);
        XLSX.utils.book_append_sheet(wb, seatWeightsWs, 'Seat Weights');

        // Sheet 7: Stem Fixed Prices
        const stemFixedPricesData = [
            ['Series Number', 'Size', 'Rating', 'Material Name', 'Fixed Price', 'Active'],
            ...stemFixedPrices.map((s: any) => [
                s.seriesId,
                s.size,
                s.rating,
                s.materialName,
                s.fixedPrice,
                s.isActive ? 'TRUE' : 'FALSE'
            ])
        ];
        const stemFixedPricesWs = XLSX.utils.aoa_to_sheet(stemFixedPricesData);
        XLSX.utils.book_append_sheet(wb, stemFixedPricesWs, 'Stem Fixed Prices');

        // Sheet 8: Seal Ring Prices (UPDATED - uses sealType)
        if (sealRingPrices.length > 0) {
            const sealRingPricesData = [
                ['Series Number', 'Seal Type', 'Size', 'Rating', 'Fixed Price', 'Active'],
                ...sealRingPrices.map((s: any) => [
                    s.seriesId,
                    s.sealType,  // CHANGED from s.plugType
                    s.size,
                    s.rating,
                    s.fixedPrice,
                    s.isActive ? 'TRUE' : 'FALSE'
                ])
            ];
            const sealRingPricesWs = XLSX.utils.aoa_to_sheet(sealRingPricesData);
            XLSX.utils.book_append_sheet(wb, sealRingPricesWs, 'Seal Ring Prices');
        }

        // Sheet 9: Actuator Models
        const actuatorModelsData = [
            ['Type', 'Series', 'Model', 'Standard/Special', 'Fixed Price', 'Active'],
            ...actuatorModels.map((a: any) => [
                a.type,
                a.series,
                a.model,
                a.standard,
                a.fixedPrice,
                a.isActive ? 'TRUE' : 'FALSE'
            ])
        ];
        const actuatorModelsWs = XLSX.utils.aoa_to_sheet(actuatorModelsData);
        XLSX.utils.book_append_sheet(wb, actuatorModelsWs, 'Actuator Models');

        // Sheet 10: Handwheel Prices
        const handwheelPricesData = [
            ['Type', 'Series', 'Model', 'Standard/Special', 'Fixed Price', 'Active'],
            ...handwheelPrices.map((h: any) => [
                h.type,
                h.series,
                h.model,
                h.standard,
                h.fixedPrice,
                h.isActive ? 'TRUE' : 'FALSE'
            ])
        ];
        const handwheelPricesWs = XLSX.utils.aoa_to_sheet(handwheelPricesData);
        XLSX.utils.book_append_sheet(wb, handwheelPricesWs, 'Handwheel Prices');

        // Sheet 11: Machine Rates
        const machineRatesData = [
            ['Machine Name', 'Rate Per Hour', 'Active'],
            ...machineRates.map((m: any) => [
                m.name,
                m.ratePerHour,
                m.isActive ? 'TRUE' : 'FALSE'
            ])
        ];
        const machineRatesWs = XLSX.utils.aoa_to_sheet(machineRatesData);
        XLSX.utils.book_append_sheet(wb, machineRatesWs, 'Machine Rates');

        // Sheet 12: Machining Hours
        const machiningHoursData = [
            ['Series Number', 'Size', 'Rating', 'Part Type', 'Trim Type', 'Hours', 'Active'],
            ...machiningHours.map((h: any) => [
                h.seriesId,
                h.size,
                h.rating,
                h.partType,
                h.trimType || '',
                h.hours,
                h.isActive ? 'TRUE' : 'FALSE'
            ])
        ];
        const machiningHoursWs = XLSX.utils.aoa_to_sheet(machiningHoursData);
        XLSX.utils.book_append_sheet(wb, machiningHoursWs, 'Machining Hours');

        // Sheet 11: Cage Weights (if any)
        if (cageWeights.length > 0) {
            const cageWeightsData = [
                ['Series Number', 'Size', 'Rating', 'Weight (kg)', 'Active'],
                ...cageWeights.map((c: any) => [
                    c.seriesId,
                    c.size,
                    c.rating,
                    c.weight,
                    c.isActive ? 'TRUE' : 'FALSE'
                ])
            ];
            const cageWeightsWs = XLSX.utils.aoa_to_sheet(cageWeightsData);
            XLSX.utils.book_append_sheet(wb, cageWeightsWs, 'Cage Weights');
        }

        // Generate filename with timestamp
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `Unicorn_Valves_Pricing_Export_${timestamp}.xlsx`;

        // Download
        XLSX.writeFile(wb, filename);

        console.log(`✅ Pricing exported successfully: ${filename}`);
    } catch (error) {
        console.error('❌ Error exporting pricing:', error);
        throw error;
    }
}
