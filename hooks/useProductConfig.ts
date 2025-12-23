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

        const sizes = await getAvailableSizes(selectedSeries.seriesNumber);
        setAvailableSizes(sizes);
    };

    const handleSizeChange = async (size: string, resetChildren = true) => {
        if (resetChildren) {
            setCurrentProduct(prev => ({ ...prev, size, rating: '' }));
        }
        if (currentProduct.seriesNumber) {
            const ratings = await getAvailableRatings(currentProduct.seriesNumber, size);
            setAvailableRatings(ratings);
        }
    };

    const handleRatingChange = async (rating: string, resetChildren = true) => {
        if (resetChildren) {
            setCurrentProduct(prev => ({ ...prev, rating }));
        }
        if (currentProduct.seriesNumber && currentProduct.size) {
            const endConnects = await getAvailableEndConnectTypes(currentProduct.seriesNumber, currentProduct.size, rating);
            setAvailableEndConnectTypes(endConnects);

            const bonnets = await getAvailableBonnetTypes(currentProduct.seriesNumber, currentProduct.size, rating);
            setAvailableBonnetTypes(bonnets);

            const seals = await getAvailableSealTypes(currentProduct.seriesNumber, currentProduct.size, rating);
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
        if (!currentProduct.seriesNumber || !currentProduct.size || !currentProduct.rating) {
            alert('Please select Series, Size, and Rating');
            return;
        }

        setCalculating(true);
        try {
            const p = currentProduct;
            let updatedProduct = { ...p };

            // 1. Body Sub-Assembly
            if (p.bodyEndConnectType && p.bodyBonnetMaterialId) {
                const weight = await getBodyWeight(p.seriesNumber!, p.size!, p.rating!, p.bodyEndConnectType!);
                const material = materials.find(m => m.id === p.bodyBonnetMaterialId);
                if (weight && material) {
                    updatedProduct.bodyWeight = weight;
                    updatedProduct.bodyMaterialPrice = material.pricePerKg;
                    updatedProduct.bodyTotalCost = weight * material.pricePerKg;
                }
            }

            // 2. Bonnet
            if (p.bonnetType && p.bodyBonnetMaterialId) {
                const weight = await getBonnetWeight(p.seriesNumber!, p.size!, p.rating!, p.bonnetType!);
                const material = materials.find(m => m.id === p.bodyBonnetMaterialId);
                if (weight && material) {
                    updatedProduct.bonnetWeight = weight;
                    updatedProduct.bonnetMaterialPrice = material.pricePerKg;
                    updatedProduct.bonnetTotalCost = weight * material.pricePerKg;
                }
            }

            // 3. Plug
            if (p.plugMaterialId) {
                const plugData = await getPlugWeight(p.seriesNumber!, p.size!, p.rating!);
                const material = materials.find(m => m.id === p.plugMaterialId);
                if (plugData && material) {
                    updatedProduct.plugWeight = plugData.weight;
                    updatedProduct.plugMaterialPrice = material.pricePerKg;
                    updatedProduct.plugTotalCost = plugData.weight * material.pricePerKg;
                }
            }

            // 4. Seat
            if (p.seatMaterialId) {
                const seatData = await getSeatWeight(p.seriesNumber!, p.size!, p.rating!);
                const material = materials.find(m => m.id === p.seatMaterialId);
                if (seatData && material) {
                    updatedProduct.seatWeight = seatData.weight;
                    updatedProduct.seatMaterialPrice = material.pricePerKg;
                    updatedProduct.seatTotalCost = seatData.weight * material.pricePerKg;
                }
            }

            // 5. Stem
            if (p.stemMaterialId) {
                const material = materials.find(m => m.id === p.stemMaterialId);
                if (material) {
                    const fixedPrice = await getStemFixedPrice(p.seriesNumber!, p.size!, p.rating!, material.name);
                    if (fixedPrice) {
                        updatedProduct.stemFixedPrice = fixedPrice;
                        updatedProduct.stemTotalCost = fixedPrice;
                    }
                }
            }

            // 6. Cage
            if (p.hasCage && p.cageMaterialId) {
                const weight = await getCageWeight(p.seriesNumber!, p.size!, p.rating!);
                const material = materials.find(m => m.id === p.cageMaterialId);
                if (weight && material) {
                    updatedProduct.cageWeight = weight;
                    updatedProduct.cageMaterialPrice = material.pricePerKg;
                    updatedProduct.cageTotalCost = weight * material.pricePerKg;
                }
            }

            // 7. Seal Ring
            if (p.hasSealRing && p.sealType) {
                const price = await getSealRingPrice(p.seriesNumber!, p.sealType!, p.size!, p.rating!);
                if (price) {
                    updatedProduct.sealRingFixedPrice = price;
                    updatedProduct.sealRingTotalCost = price;
                }
            }

            // Sum Body Sub-Assembly
            updatedProduct.bodySubAssemblyTotal = (updatedProduct.bodyTotalCost || 0) +
                (updatedProduct.bonnetTotalCost || 0) +
                (updatedProduct.plugTotalCost || 0) +
                (updatedProduct.seatTotalCost || 0) +
                (updatedProduct.stemTotalCost || 0) +
                (updatedProduct.cageTotalCost || 0) +
                (updatedProduct.sealRingTotalCost || 0);

            // 8. Actuator
            if (p.hasActuator && p.actuatorType && p.actuatorSeries && p.actuatorModel && p.actuatorStandard) {
                const price = await getActuatorPrice(p.actuatorType!, p.actuatorSeries!, p.actuatorModel!, p.actuatorStandard!);
                if (price) {
                    updatedProduct.actuatorFixedPrice = price;
                }
            } else {
                updatedProduct.actuatorFixedPrice = 0;
            }

            // 9. Handwheel
            if (p.hasHandwheel && p.handwheelType && p.handwheelSeries && p.handwheelModel && p.handwheelStandard) {
                const price = await getHandwheelPrice(p.handwheelType!, p.handwheelSeries!, p.handwheelModel!, p.handwheelStandard!);
                if (price) {
                    updatedProduct.handwheelFixedPrice = price;
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
            updatedProduct.accessoriesTotal = accessoryItems.reduce((sum, item) => sum + item.price, 0);

            // Totals
            updatedProduct.manufacturingCost = updatedProduct.bodySubAssemblyTotal;
            updatedProduct.manufacturingProfitPercentage = manufacturingProfit;
            updatedProduct.manufacturingProfitAmount = (updatedProduct.manufacturingCost * manufacturingProfit) / 100;
            updatedProduct.manufacturingCostWithProfit = updatedProduct.manufacturingCost + updatedProduct.manufacturingProfitAmount;

            updatedProduct.boughtoutItemCost = (updatedProduct.actuatorSubAssemblyTotal || 0) +
                (updatedProduct.tubingAndFittingTotal || 0) +
                (updatedProduct.testingTotal || 0) +
                (updatedProduct.accessoriesTotal || 0);

            updatedProduct.boughtoutProfitPercentage = boughtoutProfit;
            updatedProduct.boughtoutProfitAmount = (updatedProduct.boughtoutItemCost * boughtoutProfit) / 100;
            updatedProduct.boughtoutCostWithProfit = updatedProduct.boughtoutItemCost + updatedProduct.boughtoutProfitAmount;

            updatedProduct.unitCost = updatedProduct.manufacturingCostWithProfit + updatedProduct.boughtoutCostWithProfit;
            updatedProduct.productTotalCost = updatedProduct.unitCost;
            updatedProduct.lineTotal = updatedProduct.unitCost * (updatedProduct.quantity || 1);

            setCurrentProduct(updatedProduct);
        } catch (error) {
            console.error('Error calculating price:', error);
            alert('Error calculating price. Please check console.');
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
