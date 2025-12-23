import * as XLSX from 'xlsx';
import { MachineType, WorkHourData } from '@/types';

/**
 * Generate Excel template for Machine Pricing data
 * Creates two sheets: Machine Types and Work Hours
 */
export function generateMachinePricingTemplate() {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Machine Types
    const machineTypesData = [
        ['Machine Type', 'Hourly Rate (₹/hr)', 'Active'],
        ['CNC Lathe', 500, 'TRUE'],
        ['Milling Machine', 600, 'TRUE'],
        ['Grinding Machine', 450, 'TRUE'],
        ['Drilling Machine', 400, 'TRUE'],
        ['Boring Machine', 550, 'TRUE'],
    ];

    const ws1 = XLSX.utils.aoa_to_sheet(machineTypesData);
    ws1['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, ws1, 'Machine Types');

    // Sheet 2: Work Hours Data
    const workHoursData = [
        [
            'Component',
            'Series Number',
            'Size',
            'Rating',
            'Trim Type',
            'Work Hours',
            'Machine Type',
            'Active',
        ],
        ['⚠️ IMPORTANT: Replace "YOUR-SERIES" below with actual series numbers from your database!', '', '', '', '', '', '', ''],
        ['Body', 'YOUR-SERIES', '1"', '150#', '', 2.5, 'CNC Lathe', 'TRUE'],
        ['Bonnet', 'YOUR-SERIES', '1"', '150#', '', 1.5, 'CNC Lathe', 'TRUE'],
        ['Plug', 'YOUR-SERIES', '1"', '150#', 'Metal Seated', 1.0, 'Milling Machine', 'TRUE'],
        ['Seat', 'YOUR-SERIES', '1"', '150#', 'Metal Seated', 1.0, 'Grinding Machine', 'TRUE'],
        ['Stem', 'YOUR-SERIES', '1"', '150#', 'Metal Seated', 0.8, 'CNC Lathe', 'TRUE'],
        ['Cage', 'YOUR-SERIES', '1"', '150#', 'Metal Seated', 1.2, 'Milling Machine', 'TRUE'],
        ['SealRing', 'YOUR-SERIES', '1"', '150#', 'Metal Seated', 0.5, 'Grinding Machine', 'TRUE'],
    ];

    const ws2 = XLSX.utils.aoa_to_sheet(workHoursData);
    ws2['!cols'] = [
        { wch: 12 },
        { wch: 15 },
        { wch: 8 },
        { wch: 10 },
        { wch: 18 },
        { wch: 12 },
        { wch: 20 },
        { wch: 8 },
    ];
    XLSX.utils.book_append_sheet(wb, ws2, 'Work Hours');

    // Download the file
    XLSX.writeFile(wb, 'Machine_Pricing_Template.xlsx');
}

/**
 * Export current machine pricing data to Excel
 */
export function exportMachinePricingData(
    machineTypes: MachineType[],
    workHours: WorkHourData[],
    seriesMap: Map<string, { seriesNumber: string; name: string }>
) {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Machine Types
    const machineTypesData = [
        ['Machine Type', 'Hourly Rate (₹/hr)', 'Active'],
        ...machineTypes.map((mt) => [
            mt.name,
            mt.hourlyRate,
            mt.isActive ? 'TRUE' : 'FALSE',
        ]),
    ];

    const ws1 = XLSX.utils.aoa_to_sheet(machineTypesData);
    ws1['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, ws1, 'Machine Types');

    // Sheet 2: Work Hours Data
    const workHoursData = [
        [
            'Component',
            'Series Number',
            'Size',
            'Rating',
            'Trim Type',
            'Work Hours',
            'Machine Type',
            'Active',
        ],
        ...workHours.map((wh) => {
            const seriesData = seriesMap.get(wh.seriesId);
            return [
                wh.component,
                seriesData?.seriesNumber || wh.seriesId,
                wh.size,
                wh.rating,
                wh.trimType || '',
                wh.workHours,
                wh.machineTypeName,
                wh.isActive ? 'TRUE' : 'FALSE',
            ];
        }),
    ];

    const ws2 = XLSX.utils.aoa_to_sheet(workHoursData);
    ws2['!cols'] = [
        { wch: 12 },
        { wch: 15 },
        { wch: 8 },
        { wch: 10 },
        { wch: 18 },
        { wch: 12 },
        { wch: 20 },
        { wch: 8 },
    ];
    XLSX.utils.book_append_sheet(wb, ws2, 'Work Hours');

    // Download the file
    const timestamp = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Machine_Pricing_Data_${timestamp}.xlsx`);
}

/**
 * Parse uploaded Excel file for machine pricing data
 */
export function parseMachinePricingExcel(
    file: File,
    seriesMap: Map<string, { id: string; seriesNumber: string }>
): Promise<{
    machineTypes: Omit<MachineType, 'id'>[];
    workHours: Omit<WorkHourData, 'id'>[];
    errors: string[];
}> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });

                const machineTypes: Omit<MachineType, 'id'>[] = [];
                const workHours: Omit<WorkHourData, 'id'>[] = [];
                const errors: string[] = [];

                // Parse Machine Types sheet
                const machineTypesSheet = workbook.Sheets['Machine Types'];
                if (machineTypesSheet) {
                    const machineTypesData: any[][] = XLSX.utils.sheet_to_json(
                        machineTypesSheet,
                        { header: 1 }
                    );

                    // Skip header row
                    for (let i = 1; i < machineTypesData.length; i++) {
                        const row = machineTypesData[i];
                        if (!row[0]) continue; // Skip empty rows

                        const name = String(row[0]).trim();
                        const hourlyRate = parseFloat(String(row[1]));
                        const activeStr = String(row[2] || 'TRUE').trim().toUpperCase();
                        const isActive = activeStr === 'TRUE';

                        if (!name || isNaN(hourlyRate)) {
                            errors.push(`Row ${i + 1}: Invalid machine type data`);
                            continue;
                        }

                        machineTypes.push({
                            name,
                            hourlyRate,
                            isActive,
                        });
                    }
                }

                // Parse Work Hours sheet
                const workHoursSheet = workbook.Sheets['Work Hours'];
                if (workHoursSheet) {
                    const workHoursData: any[][] = XLSX.utils.sheet_to_json(workHoursSheet, {
                        header: 1,
                    });

                    // Skip header row
                    for (let i = 1; i < workHoursData.length; i++) {
                        const row = workHoursData[i];
                        if (!row[0]) continue; // Skip empty rows

                        const component = String(row[0]).trim();
                        const seriesNumber = String(row[1]).trim();
                        const size = String(row[2]).trim();
                        const rating = String(row[3]).trim();
                        const trimType = row[4] ? String(row[4]).trim() : '';
                        const workHoursValue = parseFloat(String(row[5]));
                        const machineTypeName = String(row[6]).trim();
                        const activeStr = String(row[7] || 'TRUE').trim().toUpperCase();
                        const isActive = activeStr === 'TRUE';

                        // Validate required fields
                        if (!component || !seriesNumber || !size || !rating || isNaN(workHoursValue) || !machineTypeName) {
                            errors.push(`Row ${i + 1}: Missing required fields in work hours`);
                            continue;
                        }

                        // Validate component
                        const validComponents = [
                            'Body',
                            'Bonnet',
                            'Plug',
                            'Seat',
                            'Stem',
                            'Cage',
                            'SealRing',
                        ];
                        if (!validComponents.includes(component)) {
                            errors.push(
                                `Row ${i + 1}: Invalid component '${component}'. Must be one of: ${validComponents.join(', ')}`
                            );
                            continue;
                        }

                        // Validate trim type for components that need it
                        const needsTrimType = ['Plug', 'Seat', 'Stem', 'Cage', 'SealRing'];
                        if (needsTrimType.includes(component) && !trimType) {
                            errors.push(
                                `Row ${i + 1}: Trim Type is required for component '${component}'`
                            );
                            continue;
                        }

                        // Find series ID
                        const seriesData = seriesMap.get(seriesNumber);
                        if (!seriesData) {
                            errors.push(
                                `Row ${i + 1}: Series '${seriesNumber}' not found in database`
                            );
                            continue;
                        }

                        // Find machine type ID (we'll need to match by name later)
                        const matchingMachineType = machineTypes.find(
                            (mt) => mt.name === machineTypeName
                        );
                        if (!matchingMachineType) {
                            errors.push(
                                `Row ${i + 1}: Machine type '${machineTypeName}' not found. Make sure it exists in Machine Types sheet.`
                            );
                            continue;
                        }

                        workHours.push({
                            seriesId: seriesData.id,
                            size,
                            rating,
                            trimType: trimType || undefined,
                            component: component as any,
                            workHours: workHoursValue,
                            machineTypeId: '', // Will be filled after machine types are imported
                            machineTypeName,
                            isActive,
                        });
                    }
                }

                resolve({ machineTypes, workHours, errors });
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsBinaryString(file);
    });
}
