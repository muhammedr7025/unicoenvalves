import { useState, useEffect } from 'react';
import {
    QuoteProduct,
    Series,
    Material,
    TubingAndFittingItem,
    TestingItem,
    AccessoryItem,
} from '@/types';
import {
    getAvailableSizes,
    getAvailableRatings,
    getAvailableEndConnectTypes,
    getAvailableBonnetTypes,
    getAvailableSealTypes,
    getAvailableActuatorTypes,
    getAvailableActuatorSeries,
    getAvailableActuatorModels,
    getBodyWeight,
    getBonnetWeight,
    getPlugWeight,
    getSeatWeight,
    getStemFixedPrice,
    getCageWeight,
    getSealRingPrice,
    getActuatorPrice,
    getHandwheelPrice,
    getAvailableHandwheelTypes,
    getAvailableHandwheelSeries,
    getAvailableHandwheelModels,
    getMaterialById,
    // Fixed machining price lookups (replaced work hours)
    getAvailableTrimTypes,
    getMachiningCostForBody,
    getMachiningCostForBonnet,
    getMachiningCostForPlug,
    getMachiningCostForSeat,
    getMachiningCostForStem,
    getMachiningCostForCage,
} from '@/lib/firebase/productConfigHelper';

interface UseProductConfigProps {
    initialProduct?: Partial<QuoteProduct>;
    series: Series[];
    materials: Material[];
}

export function useProductConfig({ initialProduct, series, materials }: UseProductConfigProps) {
    // State for current product
    const [currentProduct, setCurrentProduct] = useState<Partial<QuoteProduct>>(initialProduct || {
        quantity: 1,
        hasCage: false,
        hasSealRing: false,
        hasActuator: false,
        hasHandwheel: false,
    });

    // Available options state
    const [availableSizes, setAvailableSizes] = useState<string[]>([]);
    const [availableRatings, setAvailableRatings] = useState<string[]>([]);
    const [availableEndConnectTypes, setAvailableEndConnectTypes] = useState<string[]>([]);
    const [availableBonnetTypes, setAvailableBonnetTypes] = useState<string[]>([]);
    const [availableSealTypes, setAvailableSealTypes] = useState<string[]>([]);

    const [availableActuatorTypes, setAvailableActuatorTypes] = useState<string[]>([]);
    const [availableActuatorSeries, setAvailableActuatorSeries] = useState<string[]>([]);
    const [availableActuatorModels, setAvailableActuatorModels] = useState<string[]>([]);

    // NEW: Handwheel options
    const [availableHandwheelTypes, setAvailableHandwheelTypes] = useState<string[]>([]);
    const [availableHandwheelSeries, setAvailableHandwheelSeries] = useState<string[]>([]);
    const [availableHandwheelModels, setAvailableHandwheelModels] = useState<string[]>([]);

    // NEW: Trim types for machine pricing
    const [availableTrimTypes, setAvailableTrimTypes] = useState<string[]>([]);

    // Additional items
    const [tubingAndFittingItems, setTubingAndFittingItems] = useState<TubingAndFittingItem[]>(initialProduct?.tubingAndFitting || []);
    const [testingItems, setTestingItems] = useState<TestingItem[]>(initialProduct?.testing || []);
    const [accessoryItems, setAccessoryItems] = useState<AccessoryItem[]>(initialProduct?.accessories || []);

    // Profits
    const [manufacturingProfit, setManufacturingProfit] = useState<number>(initialProduct?.manufacturingProfitPercentage || 0);
    const [boughtoutProfit, setBoughtoutProfit] = useState<number>(initialProduct?.boughtoutProfitPercentage || 0);

    const [calculating, setCalculating] = useState(false);

    // Filtered materials
    const bodyBonnetMaterials = materials.filter(m => m.materialGroup === 'BodyBonnet');
    const plugMaterials = materials.filter(m => m.materialGroup === 'Plug');
    const seatMaterials = materials.filter(m => m.materialGroup === 'Seat');
    const stemMaterials = materials.filter(m => m.materialGroup === 'Stem');
    const cageMaterials = materials.filter(m => m.materialGroup === 'Cage');

    // Load initial options
    useEffect(() => {
        const loadInitialData = async () => {
            if (initialProduct?.seriesId) {
                await handleSeriesChange(initialProduct.seriesId, false);
            }
            if (initialProduct?.size) {
                await handleSizeChange(initialProduct.size, false);
            }
            if (initialProduct?.rating) {
                await handleRatingChange(initialProduct.rating, false);
            }

            // Load actuator options
            const actTypes = await getAvailableActuatorTypes();
            setAvailableActuatorTypes(actTypes);

            if (initialProduct?.actuatorType) {
                const actSeries = await getAvailableActuatorSeries(initialProduct.actuatorType);
                setAvailableActuatorSeries(actSeries);

                if (initialProduct?.actuatorSeries) {
                    const actModels = await getAvailableActuatorModels(initialProduct.actuatorType, initialProduct.actuatorSeries);
                    setAvailableActuatorModels(actModels);
                }
            }

            // Load handwheel options
            const hwTypes = await getAvailableHandwheelTypes();
            setAvailableHandwheelTypes(hwTypes);

            if (initialProduct?.handwheelType) {
                const hwSeries = await getAvailableHandwheelSeries(initialProduct.handwheelType);
                setAvailableHandwheelSeries(hwSeries);

                if (initialProduct?.handwheelSeries) {
                    const hwModels = await getAvailableHandwheelModels(initialProduct.handwheelType, initialProduct.handwheelSeries);
                    setAvailableHandwheelModels(hwModels);
                }
            }

            // Load trim types for machine pricing
            const trimTypes = await getAvailableTrimTypes();
            setAvailableTrimTypes(trimTypes);
        };
        loadInitialData();
    }, []);

    const handleSeriesChange = async (seriesId: string, resetChildren = true) => {
        const selectedSeries = series.find(s => s.id === seriesId);
        if (!selectedSeries) return;

        if (resetChildren) {
            setCurrentProduct(prev => ({
                ...prev,
                seriesId,
                seriesNumber: selectedSeries.seriesNumber,
                productType: selectedSeries.productType,
                hasCage: selectedSeries.hasCage,
                hasSealRing: selectedSeries.hasSealRing,
                size: '',
                rating: '',
            }));
        }

        // CRITICAL FIX: Pass seriesId (document ID), not seriesNumber
        const sizes = await getAvailableSizes(seriesId);
        setAvailableSizes(sizes);
    };

    const handleSizeChange = async (size: string, resetChildren = true) => {
        if (resetChildren) {
            setCurrentProduct(prev => ({ ...prev, size, rating: '' }));
        }
        if (currentProduct.seriesId) {
            const ratings = await getAvailableRatings(currentProduct.seriesId, size);
            setAvailableRatings(ratings);
        }
    };

    const handleRatingChange = async (rating: string, resetChildren = true) => {
        if (resetChildren) {
            setCurrentProduct(prev => ({ ...prev, rating }));
        }
        if (currentProduct.seriesId && currentProduct.size) {
            const endConnects = await getAvailableEndConnectTypes(currentProduct.seriesId, currentProduct.size, rating);
            setAvailableEndConnectTypes(endConnects);

            const bonnets = await getAvailableBonnetTypes(currentProduct.seriesId, currentProduct.size, rating);
            setAvailableBonnetTypes(bonnets);

            const seals = await getAvailableSealTypes(currentProduct.seriesId, currentProduct.size, rating);
            setAvailableSealTypes(seals);
        }
    };

    const handleActuatorTypeChange = async (type: string) => {
        setCurrentProduct(prev => ({ ...prev, actuatorType: type, actuatorSeries: '', actuatorModel: '' }));
        const seriesList = await getAvailableActuatorSeries(type);
        setAvailableActuatorSeries(seriesList);
        setAvailableActuatorModels([]);
    };

    const handleActuatorSeriesChange = async (series: string) => {
        setCurrentProduct(prev => ({ ...prev, actuatorSeries: series, actuatorModel: '' }));
        if (currentProduct.actuatorType) {
            const models = await getAvailableActuatorModels(currentProduct.actuatorType, series);
            setAvailableActuatorModels(models);
        }
    };

    const handleHandwheelTypeChange = async (type: string) => {
        setCurrentProduct(prev => ({ ...prev, handwheelType: type, handwheelSeries: '', handwheelModel: '' }));
        const seriesList = await getAvailableHandwheelSeries(type);
        setAvailableHandwheelSeries(seriesList);
        setAvailableHandwheelModels([]);
    };

    const handleHandwheelSeriesChange = async (series: string) => {
        setCurrentProduct(prev => ({ ...prev, handwheelSeries: series, handwheelModel: '' }));
        if (currentProduct.handwheelType) {
            const models = await getAvailableHandwheelModels(currentProduct.handwheelType, series);
            setAvailableHandwheelModels(models);
        }
    };

    const calculateProductPrice = async () => {
        // Enhanced validation with detailed error messages
        const missingFields: string[] = [];

        if (!currentProduct.productTag || !currentProduct.productTag.trim()) missingFields.push('Product Tag/Name');
        if (!currentProduct.seriesId) missingFields.push('Series');
        if (!currentProduct.size) missingFields.push('Size');
        if (!currentProduct.rating) missingFields.push('Rating');
        if (!currentProduct.bodyEndConnectType) missingFields.push('End Connection Type');
        if (!currentProduct.bonnetType) missingFields.push('Bonnet Type');
        if (!currentProduct.bodyBonnetMaterialId) missingFields.push('Body/Bonnet Material');
        if (!currentProduct.plugMaterialId) missingFields.push('Plug Material');
        if (!currentProduct.seatMaterialId) missingFields.push('Seat Material');
        if (!currentProduct.stemMaterialId) missingFields.push('Stem Material');
        if (!currentProduct.trimType) missingFields.push('Trim Type');

        if (missingFields.length > 0) {
            alert(`❌ Please fill in the following required fields:\n\n${missingFields.map(f => `• ${f}`).join('\n')}`);
            return;
        }

        console.log('🔄 Starting price calculation...');
        console.log('Product data:', {
            seriesId: currentProduct.seriesId,
            seriesNumber: currentProduct.seriesNumber,
            size: currentProduct.size,
            rating: currentProduct.rating,
        });

        setCalculating(true);
        const errors: string[] = [];

        try {
            const p = currentProduct;
            let updatedProduct = { ...p };

            // 1. Body Sub-Assembly
            console.log('📦 Calculating Body cost...');
            if (p.bodyEndConnectType && p.bodyBonnetMaterialId) {
                const weight = await getBodyWeight(p.seriesId!, p.size!, p.rating!, p.bodyEndConnectType!);
                const material = materials.find(m => m.id === p.bodyBonnetMaterialId);

                if (!weight) {
                    errors.push(`Body Weight not found for: Series ${p.seriesNumber}, Size ${p.size}, Rating ${p.rating}, End Connect ${p.bodyEndConnectType}`);
                    console.error('❌ Body weight not found');
                } else if (!material) {
                    errors.push('Body/Bonnet Material not found in materials list');
                    console.error('❌ Body material not found');
                } else {
                    // Material cost
                    updatedProduct.bodyWeight = weight;
                    updatedProduct.bodyMaterialPrice = material.pricePerKg;
                    const materialCost = weight * material.pricePerKg;

                    // Machining cost - FIXED PRICE lookup (series + size + rating + endConnectType + material)
                    const machiningPrice = await getMachiningCostForBody(
                        p.seriesId!, p.size!, p.rating!, p.bodyEndConnectType!, material.name
                    );
                    const machineCost = machiningPrice || 0;
                    updatedProduct.bodyMachineCost = machineCost;
                    if (machiningPrice) {
                        console.log(`✅ Body machining cost: ₹${machineCost} (fixed price)`);
                    } else {
                        console.warn('⚠️ Body machining price not found - cost will be 0');
                    }

                    // Total = Material + Machine
                    updatedProduct.bodyTotalCost = materialCost + machineCost;
                    console.log(`✅ Body total: ₹${updatedProduct.bodyTotalCost} (Material: ₹${materialCost} + Machine: ₹${machineCost})`);
                }
            }

            // 2. Bonnet
            console.log('📦 Calculating Bonnet cost...');
            if (p.bonnetType && p.bodyBonnetMaterialId) {
                const weight = await getBonnetWeight(p.seriesId!, p.size!, p.rating!, p.bonnetType!);
                const material = materials.find(m => m.id === p.bodyBonnetMaterialId);

                if (!weight) {
                    errors.push(`Bonnet Weight not found for: Series ${p.seriesNumber}, Size ${p.size}, Rating ${p.rating}, Bonnet Type ${p.bonnetType}`);
                    console.error('❌ Bonnet weight not found');
                } else if (!material) {
                    errors.push('Bonnet Material not found');
                    console.error('❌ Bonnet material not found');
                } else {
                    // Material cost
                    updatedProduct.bonnetWeight = weight;
                    updatedProduct.bonnetMaterialPrice = material.pricePerKg;
                    const materialCost = weight * material.pricePerKg;

                    // Machining cost - FIXED PRICE lookup (series + size + rating + bonnetType + material)
                    const machiningPrice = await getMachiningCostForBonnet(
                        p.seriesId!, p.size!, p.rating!, p.bonnetType!, material.name
                    );
                    const machineCost = machiningPrice || 0;
                    updatedProduct.bonnetMachineCost = machineCost;
                    if (machiningPrice) {
                        console.log(`✅ Bonnet machining cost: ₹${machineCost} (fixed price)`);
                    } else {
                        console.warn('⚠️ Bonnet machining price not found - cost will be 0');
                    }

                    // Total = Material + Machine
                    updatedProduct.bonnetTotalCost = materialCost + machineCost;
                    console.log(`✅ Bonnet total: ₹${updatedProduct.bonnetTotalCost}`);
                }
            }

            // 3. Plug
            console.log('📦 Calculating Plug cost...');
            if (p.plugMaterialId) {
                const plugData = await getPlugWeight(p.seriesId!, p.size!, p.rating!);
                const material = materials.find(m => m.id === p.plugMaterialId);

                if (!plugData) {
                    errors.push(`Plug Weight not found for: Series ${p.seriesNumber}, Size ${p.size}, Rating ${p.rating}`);
                    console.error('❌ Plug weight not found');
                } else if (!material) {
                    errors.push('Plug Material not found');
                    console.error('❌ Plug material not found');
                } else {
                    // Material cost
                    updatedProduct.plugWeight = plugData.weight;
                    updatedProduct.plugMaterialPrice = material.pricePerKg;
                    const materialCost = plugData.weight * material.pricePerKg;

                    // Machining cost - FIXED PRICE lookup (series + size + rating + trimType + material)
                    const machiningPrice = await getMachiningCostForPlug(
                        p.seriesId!, p.size!, p.rating!, p.trimType!, material.name
                    );
                    const machineCost = machiningPrice || 0;
                    updatedProduct.plugMachineCost = machineCost;
                    if (machiningPrice) {
                        console.log(`✅ Plug machining cost: ₹${machineCost} (fixed price)`);
                    } else {
                        console.warn('⚠️ Plug machining price not found - cost will be 0');
                    }

                    // Total = Material + Machine
                    updatedProduct.plugTotalCost = materialCost + machineCost;
                    console.log(`✅ Plug total: ₹${updatedProduct.plugTotalCost}`);
                }
            }

            // 4. Seat
            console.log('📦 Calculating Seat cost...');
            if (p.seatMaterialId) {
                const seatData = await getSeatWeight(p.seriesId!, p.size!, p.rating!);
                const material = materials.find(m => m.id === p.seatMaterialId);

                if (!seatData) {
                    errors.push(`Seat Weight not found for: Series ${p.seriesNumber}, Size ${p.size}, Rating ${p.rating}`);
                    console.error('❌ Seat weight not found');
                } else if (!material) {
                    errors.push('Seat Material not found');
                    console.error('❌ Seat material not found');
                } else {
                    // Material cost
                    updatedProduct.seatWeight = seatData.weight;
                    updatedProduct.seatMaterialPrice = material.pricePerKg;
                    const materialCost = seatData.weight * material.pricePerKg;

                    // Machining cost - FIXED PRICE lookup (series + size + rating + trimType + material)
                    const machiningPrice = await getMachiningCostForSeat(
                        p.seriesId!, p.size!, p.rating!, p.trimType!, material.name
                    );
                    const machineCost = machiningPrice || 0;
                    updatedProduct.seatMachineCost = machineCost;
                    if (machiningPrice) {
                        console.log(`✅ Seat machining cost: ₹${machineCost} (fixed price)`);
                    } else {
                        console.warn('⚠️ Seat machining price not found - cost will be 0');
                    }

                    // Total = Material + Machine
                    updatedProduct.seatTotalCost = materialCost + machineCost;
                    console.log(`✅ Seat total: ₹${updatedProduct.seatTotalCost}`);
                }
            }

            // 5. Stem
            console.log('📦 Calculating Stem cost...');
            if (p.stemMaterialId) {
                const material = materials.find(m => m.id === p.stemMaterialId);
                if (!material) {
                    errors.push('Stem Material not found');
                    console.error('❌ Stem material not found');
                } else {
                    const fixedPrice = await getStemFixedPrice(p.seriesId!, p.size!, p.rating!, material.name);
                    if (!fixedPrice) {
                        errors.push(`Stem Fixed Price not found for: Series ${p.seriesNumber}, Size ${p.size}, Rating ${p.rating}, Material ${material.name}`);
                        console.error('❌ Stem fixed price not found');
                    } else {
                        // Material cost (fixed price)
                        updatedProduct.stemFixedPrice = fixedPrice;
                        const materialCost = fixedPrice;

                        // Machining cost - FIXED PRICE lookup (series + size + rating + trimType + material)
                        const machiningPrice = await getMachiningCostForStem(
                            p.seriesId!, p.size!, p.rating!, p.trimType!, material.name
                        );
                        const machineCost = machiningPrice || 0;
                        updatedProduct.stemMachineCost = machineCost;
                        if (machiningPrice) {
                            console.log(`✅ Stem machining cost: ₹${machineCost} (fixed price)`);
                        } else {
                            console.warn('⚠️ Stem machining price not found - cost will be 0');
                        }

                        // Total = Material + Machine
                        updatedProduct.stemTotalCost = materialCost + machineCost;
                        console.log(`✅ Stem total: ₹${updatedProduct.stemTotalCost}`);
                    }
                }
            }

            // 6. Cage
            if (p.hasCage && p.cageMaterialId) {
                console.log('📦 Calculating Cage cost...');
                const weight = await getCageWeight(p.seriesId!, p.size!, p.rating!);
                const material = materials.find(m => m.id === p.cageMaterialId);

                if (!weight) {
                    errors.push(`Cage Weight not found for: Series ${p.seriesNumber}, Size ${p.size}, Rating ${p.rating}`);
                    console.error('❌ Cage weight not found');
                } else if (!material) {
                    errors.push('Cage Material not found');
                    console.error('❌ Cage material not found');
                } else {
                    // Material cost
                    updatedProduct.cageWeight = weight;
                    updatedProduct.cageMaterialPrice = material.pricePerKg;
                    const materialCost = weight * material.pricePerKg;

                    // Machining cost - FIXED PRICE lookup (series + size + rating + trimType + material)
                    const machiningPrice = await getMachiningCostForCage(
                        p.seriesId!, p.size!, p.rating!, p.trimType!, material.name
                    );
                    const machineCost = machiningPrice || 0;
                    updatedProduct.cageMachineCost = machineCost;
                    if (machiningPrice) {
                        console.log(`✅ Cage machining cost: ₹${machineCost} (fixed price)`);
                    } else {
                        console.warn('⚠️ Cage machining price not found - cost will be 0');
                    }

                    // Total = Material + Machine
                    updatedProduct.cageTotalCost = materialCost + machineCost;
                    console.log(`✅ Cage total: ₹${updatedProduct.cageTotalCost}`);
                }
            }

            // 7. Seal Ring (NO machining cost - only fixed price)
            if (p.hasSealRing && p.sealType) {
                console.log('📦 Calculating Seal Ring price...');
                const price = await getSealRingPrice(p.seriesId!, p.sealType!, p.size!, p.rating!);
                if (!price) {
                    errors.push(`Seal Ring Price not found for: Series ${p.seriesNumber}, Seal Type ${p.sealType}, Size ${p.size}, Rating ${p.rating}`);
                    console.error('❌ Seal ring price not found');
                } else {
                    // Material cost (fixed price only - NO machining for Seal Ring)
                    updatedProduct.sealRingFixedPrice = price;
                    updatedProduct.sealRingTotalCost = price;
                    console.log(`✅ Seal Ring total: ₹${price} (no machining cost)`);
                }
            }

            // Show errors if any components failed
            if (errors.length > 0) {
                console.error('❌ Pricing errors:', errors);
                alert(`⚠️ Warning: Some pricing data could not be found: \n\n${errors.map(e => `• ${e}`).join('\n')} \n\nPlease ensure all necessary pricing data exists in the database or contact admin.`);
            }

            // Sum Body Sub-Assembly
            updatedProduct.bodySubAssemblyTotal = (updatedProduct.bodyTotalCost || 0) +
                (updatedProduct.bonnetTotalCost || 0) +
                (updatedProduct.plugTotalCost || 0) +
                (updatedProduct.seatTotalCost || 0) +
                (updatedProduct.stemTotalCost || 0) +
                (updatedProduct.cageTotalCost || 0) +
                (updatedProduct.sealRingTotalCost || 0);

            console.log('💰 Body Sub-Assembly Total:', updatedProduct.bodySubAssemblyTotal);

            // 8. Actuator
            if (p.hasActuator && p.actuatorType && p.actuatorSeries && p.actuatorModel && p.actuatorStandard) {
                const price = await getActuatorPrice(p.actuatorType!, p.actuatorSeries!, p.actuatorModel!, p.actuatorStandard!);
                if (price) {
                    updatedProduct.actuatorFixedPrice = price;
                    console.log('✅ Actuator calculated:', price);
                } else {
                    console.warn('⚠️ Actuator price not found');
                }
            } else {
                updatedProduct.actuatorFixedPrice = 0;
            }

            // 9. Handwheel
            if (p.hasHandwheel && p.handwheelType && p.handwheelSeries && p.handwheelModel && p.handwheelStandard) {
                const price = await getHandwheelPrice(p.handwheelType!, p.handwheelSeries!, p.handwheelModel!, p.handwheelStandard!);
                if (price) {
                    updatedProduct.handwheelFixedPrice = price;
                    console.log('✅ Handwheel calculated:', price);
                } else {
                    console.warn('⚠️ Handwheel price not found');
                }
            } else {
                updatedProduct.handwheelFixedPrice = 0;
            }

            updatedProduct.actuatorSubAssemblyTotal = (updatedProduct.actuatorFixedPrice || 0) + (updatedProduct.handwheelFixedPrice || 0);

            // 10. Others
            updatedProduct.tubingAndFitting = tubingAndFittingItems;
            updatedProduct.tubingAndFittingTotal = tubingAndFittingItems.reduce((sum, item) => sum + item.price, 0);

            updatedProduct.testing = testingItems;
            updatedProduct.testingTotal = testingItems.reduce((sum, item) => sum + item.price, 0);

            updatedProduct.accessories = accessoryItems;
            updatedProduct.accessoriesTotal = accessoryItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            // Totals
            // Manufacturing Cost = Body Sub-Assembly + Actuator Sub-Assembly + Tubing & Fitting + Testing
            updatedProduct.manufacturingCost = (updatedProduct.bodySubAssemblyTotal || 0) +
                (updatedProduct.actuatorSubAssemblyTotal || 0) +
                (updatedProduct.tubingAndFittingTotal || 0) +
                (updatedProduct.testingTotal || 0);

            updatedProduct.manufacturingProfitPercentage = manufacturingProfit;
            updatedProduct.manufacturingProfitAmount = (updatedProduct.manufacturingCost * manufacturingProfit) / 100;
            updatedProduct.manufacturingCostWithProfit = updatedProduct.manufacturingCost + updatedProduct.manufacturingProfitAmount;

            // Bought-out Item Cost = Accessories Total ONLY
            updatedProduct.boughtoutItemCost = updatedProduct.accessoriesTotal || 0;

            updatedProduct.boughtoutProfitPercentage = boughtoutProfit;
            updatedProduct.boughtoutProfitAmount = (updatedProduct.boughtoutItemCost * boughtoutProfit) / 100;
            updatedProduct.boughtoutCostWithProfit = updatedProduct.boughtoutItemCost + updatedProduct.boughtoutProfitAmount;

            updatedProduct.unitCost = updatedProduct.manufacturingCostWithProfit + updatedProduct.boughtoutCostWithProfit;
            updatedProduct.productTotalCost = updatedProduct.unitCost;
            updatedProduct.lineTotal = updatedProduct.unitCost * (updatedProduct.quantity || 1);

            console.log('✅ FINAL TOTAL COST:', updatedProduct.productTotalCost);

            if (errors.length === 0) {
                alert(`✅ Price calculated successfully!\n\nTotal Cost: ₹${updatedProduct.productTotalCost.toLocaleString('en-IN')} `);
            }

            setCurrentProduct(updatedProduct);
        } catch (error: any) {
            console.error('❌ Critical error calculating price:', error);
            alert(`❌ Error calculating price: \n\n${error.message} \n\nPlease check the browser console for details.`);
        } finally {
            setCalculating(false);
        }
    };

    return {
        currentProduct,
        setCurrentProduct,
        availableSizes,
        availableRatings,
        availableEndConnectTypes,
        availableBonnetTypes,
        availableSealTypes,
        availableActuatorTypes,
        availableActuatorSeries,
        availableActuatorModels,
        availableHandwheelTypes,
        availableHandwheelSeries,
        availableHandwheelModels,
        availableTrimTypes,
        tubingAndFittingItems,
        setTubingAndFittingItems,
        testingItems,
        setTestingItems,
        accessoryItems,
        setAccessoryItems,
        manufacturingProfit,
        setManufacturingProfit,
        boughtoutProfit,
        setBoughtoutProfit,
        calculating,
        bodyBonnetMaterials,
        plugMaterials,
        seatMaterials,
        stemMaterials,
        cageMaterials,
        handleSeriesChange,
        handleSizeChange,
        handleRatingChange,
        handleActuatorTypeChange,
        handleActuatorSeriesChange,
        handleHandwheelTypeChange,
        handleHandwheelSeriesChange,
        calculateProductPrice,
    };
}
