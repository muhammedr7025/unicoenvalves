import { useState, useEffect, useMemo } from 'react';
import {
    Material,
    Series,
    QuoteProduct,
    TubingAndFittingItem,
    TestingItem,
    AccessoryItem,
    DEFAULT_ACCESSORIES,
    QuotePricingMode,
} from '@/types';
import { useProductConfig } from '@/hooks/useProductConfig';
import SearchableSelect from '@/components/ui/SearchableSelect';


interface ProductConfigurationFormProps {
    initialProduct?: Partial<QuoteProduct>;
    series: Series[];
    materials: Material[];
    onSave: (product: QuoteProduct) => void;
    onCancel: () => void;
    pricingMode?: QuotePricingMode;
    dealerMarginPercentage?: number;
    isAdmin?: boolean;
}

export default function ProductConfigurationForm({
    initialProduct,
    series,
    materials,
    onSave,
    onCancel,
    pricingMode = 'standard',
    dealerMarginPercentage,
    isAdmin = false,
}: ProductConfigurationFormProps) {
    const {
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
        // Available presets for user selection
        availableTestingPresets,
        availableTubingPresets,
        addTestingPreset,
        addTubingPreset,
        manufacturingProfit,
        setManufacturingProfit,
        boughtoutProfit,
        setBoughtoutProfit,
        negotiationMargin,
        setNegotiationMargin,
        productDiscount,
        setProductDiscount,
        calculating,
        bodyBonnetMaterials,
        plugMaterials,
        seatMaterials,
        stemMaterials,
        cageMaterials,
        pilotPlugMaterials,
        handleSeriesChange,
        handleSizeChange,
        handleRatingChange,
        handleActuatorTypeChange,
        handleActuatorSeriesChange,
        handleHandwheelTypeChange,
        handleHandwheelSeriesChange,
        calculateProductPrice,
        marginsLoaded,
    } = useProductConfig({ initialProduct, series, materials, pricingMode, dealerMarginPercentage });

    // Temporary states for adding items
    const [newTubingTitle, setNewTubingTitle] = useState('');
    const [newTubingPrice, setNewTubingPrice] = useState(0);
    const [newTestingTitle, setNewTestingTitle] = useState('');
    const [newTestingPrice, setNewTestingPrice] = useState(0);
    const [newAccessoryTitle, setNewAccessoryTitle] = useState('');
    const [newAccessoryPrice, setNewAccessoryPrice] = useState(0);
    const [newAccessoryQuantity, setNewAccessoryQuantity] = useState(1);
    const [showAccessoryPriceInput, setShowAccessoryPriceInput] = useState<string | null>(null);
    const [customAccessoryPrice, setCustomAccessoryPrice] = useState<{ [key: string]: number }>({});

    // ======= MEMOIZED OPTIONS FOR SEARCHABLE SELECTS (Performance optimization) =======

    // Series options (memoized)
    const seriesOptions = useMemo(() =>
        series.map(s => ({
            value: s.id,
            label: `${s.seriesNumber} - ${s.name}`,
            sublabel: s.productType
        }))
        , [series]);

    // Body/Bonnet material options
    const bodyBonnetMaterialOptions = useMemo(() =>
        bodyBonnetMaterials.map(m => ({
            value: m.id,
            label: m.name,
            sublabel: `₹${m.pricePerKg}/kg`
        }))
        , [bodyBonnetMaterials]);

    // Plug material options
    const plugMaterialOptions = useMemo(() =>
        plugMaterials.map(m => ({
            value: m.id,
            label: m.name,
            sublabel: `₹${m.pricePerKg}/kg`
        }))
        , [plugMaterials]);

    // Seat material options
    const seatMaterialOptions = useMemo(() =>
        seatMaterials.map(m => ({
            value: m.id,
            label: m.name,
            sublabel: `₹${m.pricePerKg}/kg`
        }))
        , [seatMaterials]);

    // Stem material options
    const stemMaterialOptions = useMemo(() =>
        stemMaterials.map(m => ({
            value: m.id,
            label: m.name,
        }))
        , [stemMaterials]);

    // Cage material options
    const cageMaterialOptions = useMemo(() =>
        cageMaterials.map(m => ({
            value: m.id,
            label: m.name,
            sublabel: `₹${m.pricePerKg}/kg`
        }))
        , [cageMaterials]);

    // Pilot Plug material options (uses same materials as plug)
    const pilotPlugMaterialOptions = useMemo(() =>
        pilotPlugMaterials.map(m => ({
            value: m.id,
            label: m.name,
            sublabel: `₹${m.pricePerKg}/kg`
        }))
        , [pilotPlugMaterials]);

    // Size options
    const sizeOptions = useMemo(() =>
        availableSizes.map(s => ({
            value: s,
            label: s,
        }))
        , [availableSizes]);

    // Rating options
    const ratingOptions = useMemo(() =>
        availableRatings.map(r => ({
            value: r,
            label: r,
        }))
        , [availableRatings]);

    // End connect type options
    const endConnectTypeOptions = useMemo(() =>
        availableEndConnectTypes.map(t => ({
            value: t,
            label: t,
        }))
        , [availableEndConnectTypes]);

    // Bonnet type options
    const bonnetTypeOptions = useMemo(() =>
        availableBonnetTypes.map(t => ({
            value: t,
            label: t,
        }))
        , [availableBonnetTypes]);

    // Trim type options
    const trimTypeOptions = useMemo(() =>
        availableTrimTypes.map(t => ({
            value: t,
            label: t,
        }))
        , [availableTrimTypes]);

    // Seal type options
    const sealTypeOptions = useMemo(() =>
        availableSealTypes.map(t => ({
            value: t,
            label: t,
        }))
        , [availableSealTypes]);

    // Actuator type options
    const actuatorTypeOptions = useMemo(() =>
        availableActuatorTypes.map(t => ({
            value: t,
            label: t,
        }))
        , [availableActuatorTypes]);

    // Actuator series options
    const actuatorSeriesOptions = useMemo(() =>
        availableActuatorSeries.map(s => ({
            value: s,
            label: s,
        }))
        , [availableActuatorSeries]);

    // Actuator model options
    const actuatorModelOptions = useMemo(() =>
        availableActuatorModels.map(m => ({
            value: m,
            label: m,
        }))
        , [availableActuatorModels]);

    // Handwheel type options
    const handwheelTypeOptions = useMemo(() =>
        availableHandwheelTypes.map(t => ({
            value: t,
            label: t,
        }))
        , [availableHandwheelTypes]);

    // Handwheel series options
    const handwheelSeriesOptions = useMemo(() =>
        availableHandwheelSeries.map(s => ({
            value: s,
            label: s,
        }))
        , [availableHandwheelSeries]);

    // Handwheel model options
    const handwheelModelOptions = useMemo(() =>
        availableHandwheelModels.map(m => ({
            value: m,
            label: m,
        }))
        , [availableHandwheelModels]);


    // Tubing & Fitting functions
    const addTubingAndFittingItem = () => {
        if (!newTubingTitle.trim() || newTubingPrice <= 0) {
            alert('Please enter both title and price');
            return;
        }

        const newItem: TubingAndFittingItem = {
            id: `tubing-${Date.now()}`,
            title: newTubingTitle.trim(),
            price: newTubingPrice,
        };

        setTubingAndFittingItems([...tubingAndFittingItems, newItem]);
        setNewTubingTitle('');
        setNewTubingPrice(0);
    };

    const removeTubingAndFittingItem = (id: string) => {
        setTubingAndFittingItems(tubingAndFittingItems.filter(item => item.id !== id));
    };

    // Testing functions
    const addTestingItem = () => {
        if (!newTestingTitle.trim() || newTestingPrice <= 0) {
            alert('Please enter both title and price');
            return;
        }

        const newItem: TestingItem = {
            id: `testing-${Date.now()}`,
            title: newTestingTitle.trim(),
            price: newTestingPrice,
        };

        setTestingItems([...testingItems, newItem]);
        setNewTestingTitle('');
        setNewTestingPrice(0);
    };

    const removeTestingItem = (id: string) => {
        setTestingItems(testingItems.filter(item => item.id !== id));
    };

    // Accessories functions
    const addAccessoryItem = (title: string, price: number, quantity: number = 1, isDefault: boolean = false) => {
        const newItem: AccessoryItem = {
            id: `accessory-${Date.now()}-${Math.random()}`,
            title: title.trim(),
            price: price,
            quantity: quantity,
            isDefault: isDefault,
        };

        setAccessoryItems([...accessoryItems, newItem]);
    };

    const addCustomAccessory = () => {
        if (!newAccessoryTitle.trim() || newAccessoryPrice <= 0) {
            alert('Please enter both title and price');
            return;
        }

        addAccessoryItem(newAccessoryTitle, newAccessoryPrice, newAccessoryQuantity, false);
        setNewAccessoryTitle('');
        setNewAccessoryPrice(0);
        setNewAccessoryQuantity(1);
    };

    const updateAccessoryQuantity = (id: string, quantity: number) => {
        setAccessoryItems(accessoryItems.map(item =>
            item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
        ));
    };

    const removeAccessoryItem = (id: string) => {
        setAccessoryItems(accessoryItems.filter(item => item.id !== id));
    };

    const toggleDefaultAccessory = (title: string, price?: number) => {
        const exists = accessoryItems.find(item => item.title === title);

        if (exists) {
            removeAccessoryItem(exists.id);
            const newPrices = { ...customAccessoryPrice };
            delete newPrices[title];
            setCustomAccessoryPrice(newPrices);
        } else {
            if (price !== undefined) {
                addAccessoryItem(title, price, 1, true);
            } else {
                setShowAccessoryPriceInput(title);
            }
        }
    };

    const handleDefaultAccessoryPriceSubmit = (title: string) => {
        const price = customAccessoryPrice[title];
        if (!price || price <= 0) {
            alert('Please enter a valid price');
            return;
        }

        addAccessoryItem(title, price, 1, true);
        setShowAccessoryPriceInput(null);
    };

    const handleSave = () => {
        if (!currentProduct.productTotalCost) {
            alert('Please calculate the price first');
            return;
        }

        const product: QuoteProduct = {
            ...currentProduct,
            id: currentProduct.id || `product-${Date.now()}`,
        } as QuoteProduct;

        onSave(product);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">
                {initialProduct?.id ? 'Edit Product' : 'Configure Product'}
            </h2>

            {/* Product Tag/Name */}
            <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-lg p-4">
                <label className="block text-sm font-medium mb-2">Product Tag/Name *</label>
                <input
                    type="text"
                    value={currentProduct.productTag || ''}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, productTag: e.target.value })}
                    placeholder="e.g., Main Control Valve, Backup Unit, Emergency System"
                    className="w-full px-4 py-3 border-2 border-red-300 rounded-lg text-lg focus:ring-2 focus:ring-red-500"
                    required
                />

            </div>

            {/* Basic Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium mb-2">Series *</label>
                    <SearchableSelect
                        value={currentProduct.seriesId || ''}
                        onChange={(value) => handleSeriesChange(value)}
                        options={seriesOptions}
                        placeholder="Search series..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Size *</label>
                    <SearchableSelect
                        value={currentProduct.size || ''}
                        onChange={(value) => handleSizeChange(value)}
                        options={sizeOptions}
                        placeholder="Search size..."
                        disabled={!availableSizes.length}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Rating *</label>
                    <SearchableSelect
                        value={currentProduct.rating || ''}
                        onChange={(value) => handleRatingChange(value)}
                        options={ratingOptions}
                        placeholder="Search rating..."
                        disabled={!availableRatings.length}
                    />
                </div>
            </div>

            {/* Trim Type Selection - After Series/Size/Rating, Required for Machine Pricing */}
            {currentProduct.size && currentProduct.rating && (
                <div className="mb-6 bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
                    <label className="block text-sm font-medium mb-2">Trim Type </label>
                    <select
                        value={currentProduct.trimType || ''}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, trimType: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-orange-300 rounded-lg text-lg focus:ring-2 focus:ring-orange-500"
                        required
                    >
                        <option value="">Select Trim Type</option>
                        {availableTrimTypes.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>

                </div>
            )}

            {/* BODY SUB-ASSEMBLY */}
            {currentProduct.size && currentProduct.rating && (
                <div className="border-2 border-blue-200 rounded-lg p-6 mb-6 bg-blue-50">
                    <h3 className="text-xl font-bold mb-4 text-blue-900">🔧 Body Sub-Assembly</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Body */}
                        <div className="bg-white rounded-lg p-4 border-2 border-blue-300">
                            <h4 className="font-semibold mb-3 text-gray-900 flex items-center">

                                Body
                            </h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm mb-1">End Connect Type *</label>
                                    <SearchableSelect
                                        value={currentProduct.bodyEndConnectType || ''}
                                        onChange={(value) => setCurrentProduct({ ...currentProduct, bodyEndConnectType: value as any })}
                                        options={endConnectTypeOptions}
                                        placeholder="Search end connect..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">Material (Body & Bonnet) *</label>
                                    <SearchableSelect
                                        value={currentProduct.bodyBonnetMaterialId || ''}
                                        onChange={(value) => setCurrentProduct({ ...currentProduct, bodyBonnetMaterialId: value })}
                                        options={bodyBonnetMaterialOptions}
                                        placeholder="Search material..."
                                    />

                                </div>
                            </div>
                        </div>

                        {/* Bonnet */}
                        <div className="bg-white rounded-lg p-4 border-2 border-blue-300">
                            <h4 className="font-semibold mb-3 text-gray-900 flex items-center">
                                Bonnet
                            </h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm mb-1">Bonnet Type *</label>
                                    <SearchableSelect
                                        value={currentProduct.bonnetType || ''}
                                        onChange={(value) => setCurrentProduct({ ...currentProduct, bonnetType: value as any })}
                                        options={bonnetTypeOptions}
                                        placeholder="Search bonnet type..."
                                    />
                                </div>

                            </div>
                        </div>

                        {/* Plug */}
                        <div className="bg-white rounded-lg p-4 border-2 border-purple-300">
                            <h4 className="font-semibold mb-3 text-gray-900 flex items-center">
                                Plug
                            </h4>
                            <div className="space-y-3">
                                {/* REMOVED Plug Type selection */}
                                <div>
                                    <label className="block text-sm mb-1">Plug Material *</label>
                                    <SearchableSelect
                                        value={currentProduct.plugMaterialId || ''}
                                        onChange={(value) => setCurrentProduct({ ...currentProduct, plugMaterialId: value })}
                                        options={plugMaterialOptions}
                                        placeholder="Search material..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Seat */}
                        <div className="bg-white rounded-lg p-4 border-2 border-pink-300">
                            <h4 className="font-semibold mb-3 text-gray-900 flex items-center">
                                Seat
                            </h4>
                            <div className="space-y-3">
                                {/* REMOVED Seat Type selection */}
                                <div>
                                    <label className="block text-sm mb-1">Seat Material *</label>
                                    <SearchableSelect
                                        value={currentProduct.seatMaterialId || ''}
                                        onChange={(value) => setCurrentProduct({ ...currentProduct, seatMaterialId: value })}
                                        options={seatMaterialOptions}
                                        placeholder="Search material..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Stem */}
                        <div className="bg-white rounded-lg p-4 border-2 border-orange-300">
                            <h4 className="font-semibold mb-3 text-gray-900 flex items-center">
                                Stem
                            </h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm mb-1">Stem Material *</label>
                                    <SearchableSelect
                                        value={currentProduct.stemMaterialId || ''}
                                        onChange={(value) => setCurrentProduct({ ...currentProduct, stemMaterialId: value })}
                                        options={stemMaterialOptions}
                                        placeholder="Search material..."
                                    />

                                </div>
                            </div>
                        </div>

                        {/* Cage (conditional) */}
                        {currentProduct.hasCage && (
                            <div className="bg-white rounded-lg p-4 border-2 border-green-300">
                                <h4 className="font-semibold mb-3 text-gray-900 flex items-center">
                                    Cage
                                </h4>
                                <div className="space-y-3">
                                    <div className="bg-green-50 p-3 rounded">
                                        <p className="text-sm text-green-800">
                                            ✓ Cage available for this series
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-1">Cage Material *</label>
                                        <SearchableSelect
                                            value={currentProduct.cageMaterialId || ''}
                                            onChange={(value) => setCurrentProduct({ ...currentProduct, cageMaterialId: value })}
                                            options={cageMaterialOptions}
                                            placeholder="Search material..."
                                        />

                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Seal Ring (conditional) */}
                        {currentProduct.hasSealRing && (
                            <div className="bg-white rounded-lg p-4 border-2 border-indigo-300">
                                <h4 className="font-semibold mb-3 text-gray-900">Seal Ring</h4>
                                <div className="space-y-3">
                                    <div className="bg-indigo-50 p-3 rounded">
                                        <p className="text-sm text-indigo-800">
                                            ✓ Seal Ring available for this series
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-1">Seal Type *</label>
                                        <SearchableSelect
                                            value={currentProduct.sealType || ''}
                                            onChange={(value) => setCurrentProduct({ ...currentProduct, sealType: value })}
                                            options={sealTypeOptions}
                                            placeholder="Search seal type..."
                                            disabled={!availableSealTypes.length}
                                        />

                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Pilot Plug (optional - toggle to add) */}
                        <div className="bg-white rounded-lg p-4 border-2 border-emerald-300">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-gray-900 flex items-center">
                                    🔘 Pilot Plug
                                </h4>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={currentProduct.hasPilotPlug || false}
                                        onChange={(e) => setCurrentProduct({
                                            ...currentProduct,
                                            hasPilotPlug: e.target.checked,
                                            pilotPlugMaterialId: e.target.checked ? currentProduct.pilotPlugMaterialId : undefined,
                                        })}
                                        className="mr-2 w-5 h-5"
                                    />
                                    <span className="text-sm font-medium">Add Pilot Plug</span>
                                </label>
                            </div>
                            {currentProduct.hasPilotPlug && (
                                <div className="space-y-3">
                                    <div className="bg-emerald-50 p-3 rounded">
                                        <p className="text-sm text-emerald-800">
                                            ✓ Pilot Plug enabled - select material below
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-1">Pilot Plug Material *</label>
                                        <SearchableSelect
                                            value={currentProduct.pilotPlugMaterialId || ''}
                                            onChange={(value) => setCurrentProduct({ ...currentProduct, pilotPlugMaterialId: value })}
                                            options={pilotPlugMaterialOptions}
                                            placeholder="Search material..."
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )
            }

            {/* ACTUATOR SUB-ASSEMBLY */}
            {
                currentProduct.size && currentProduct.rating && (
                    <div className="border-2 border-purple-200 rounded-lg p-6 mb-6 bg-purple-50">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-purple-900">⚙️ Actuator Sub-Assembly</h3>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={currentProduct.hasActuator || false}
                                    onChange={(e) => setCurrentProduct({
                                        ...currentProduct,
                                        hasActuator: e.target.checked,
                                        hasHandwheel: false,
                                    })}
                                    className="mr-2 w-5 h-5"
                                />
                                <span className="text-sm font-medium">Add Actuator</span>
                            </label>
                        </div>

                        {currentProduct.hasActuator && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <label className="block text-sm font-medium mb-2">Actuator Type *</label>
                                    <SearchableSelect
                                        value={currentProduct.actuatorType || ''}
                                        onChange={(value) => handleActuatorTypeChange(value)}
                                        options={actuatorTypeOptions}
                                        placeholder="Search type..."
                                    />
                                </div>

                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <label className="block text-sm font-medium mb-2">Actuator Series *</label>
                                    <SearchableSelect
                                        value={currentProduct.actuatorSeries || ''}
                                        onChange={(value) => handleActuatorSeriesChange(value)}
                                        options={actuatorSeriesOptions}
                                        placeholder="Search series..."
                                        disabled={!availableActuatorSeries.length}
                                    />
                                </div>

                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <label className="block text-sm font-medium mb-2">Actuator Model *</label>
                                    <SearchableSelect
                                        value={currentProduct.actuatorModel || ''}
                                        onChange={(value) => setCurrentProduct({ ...currentProduct, actuatorModel: value })}
                                        options={actuatorModelOptions}
                                        placeholder="Search model..."
                                        disabled={!availableActuatorModels.length}
                                    />
                                </div>

                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <label className="block text-sm font-medium mb-2">Material *</label>
                                    <SearchableSelect
                                        value={currentProduct.actuatorStandard || ''}
                                        onChange={(value) => setCurrentProduct({ ...currentProduct, actuatorStandard: value as 'standard' | 'special' })}
                                        options={[
                                            { value: 'standard', label: 'Standard' },
                                            { value: 'special', label: 'Special' },
                                        ]}
                                        placeholder="Select configuration..."
                                    />
                                </div>

                                {/* Handwheel Section */}
                                <div className="bg-white rounded-lg p-4 border border-gray-200 col-span-2">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-semibold text-gray-900">Handwheel (Optional)</h4>
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={currentProduct.hasHandwheel || false}
                                                onChange={(e) => setCurrentProduct({
                                                    ...currentProduct,
                                                    hasHandwheel: e.target.checked,
                                                    handwheelType: '',
                                                    handwheelSeries: '',
                                                    handwheelModel: '',
                                                    handwheelStandard: undefined
                                                })}
                                                className="mr-2 w-5 h-5"
                                            />
                                            <span className="text-sm font-medium">Add Handwheel</span>
                                        </label>
                                    </div>

                                    {currentProduct.hasHandwheel && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Handwheel Type *</label>
                                                <SearchableSelect
                                                    value={currentProduct.handwheelType || ''}
                                                    onChange={(value) => handleHandwheelTypeChange(value)}
                                                    options={handwheelTypeOptions}
                                                    placeholder="Search type..."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">Actuator Series *</label>
                                                <SearchableSelect
                                                    value={currentProduct.handwheelSeries || ''}
                                                    onChange={(value) => handleHandwheelSeriesChange(value)}
                                                    options={handwheelSeriesOptions}
                                                    placeholder="Search series..."
                                                    disabled={!availableHandwheelSeries.length}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">Actuator Model *</label>
                                                <SearchableSelect
                                                    value={currentProduct.handwheelModel || ''}
                                                    onChange={(value) => setCurrentProduct({ ...currentProduct, handwheelModel: value })}
                                                    options={handwheelModelOptions}
                                                    placeholder="Search model..."
                                                    disabled={!availableHandwheelModels.length}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">Material *</label>
                                                <SearchableSelect
                                                    value={currentProduct.handwheelStandard || ''}
                                                    onChange={(value) => setCurrentProduct({ ...currentProduct, handwheelStandard: value as 'standard' | 'special' })}
                                                    options={[
                                                        { value: 'standard', label: 'Standard' },
                                                        { value: 'special', label: 'Special' },
                                                    ]}
                                                    placeholder="Select configuration..."
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {!currentProduct.hasActuator && (
                            <div className="text-center py-8 text-gray-500">
                                <p>Enable "Add Actuator" to configure actuator options</p>
                            </div>
                        )}
                    </div>
                )
            }

            {/* MISCELLANEOUS MODULE */}
            {
                currentProduct.size && currentProduct.rating && (
                    <div className="border-2 border-orange-200 rounded-lg p-6 mb-6 bg-orange-50">
                        <h3 className="text-xl font-bold mb-4 text-orange-900">📦 Miscellaneous</h3>

                        {/* Preset Selection */}
                        {availableTubingPresets.length > 0 && (
                            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 mb-4">
                                <p className="text-sm font-semibold text-rose-800 mb-3">📋 Available Presets (click to add):</p>
                                <div className="flex flex-wrap gap-2">
                                    {availableTubingPresets.map((preset) => {
                                        const isAlreadyAdded = tubingAndFittingItems.some(item => item.id === `preset-tubing-${preset.id}`);
                                        return (
                                            <button
                                                key={preset.id}
                                                onClick={() => addTubingPreset(preset)}
                                                disabled={isAlreadyAdded}
                                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${isAlreadyAdded
                                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                    : 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm hover:shadow'
                                                    }`}
                                            >
                                                <span>{isAlreadyAdded ? '✓' : '+'}</span>
                                                <span>{preset.itemName}</span>
                                                <span className="text-xs opacity-80">₹{preset.price.toLocaleString()}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Manual Input */}
                        <div className="bg-white rounded-lg p-4 mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={newTubingTitle}
                                        onChange={(e) => setNewTubingTitle(e.target.value)}
                                        placeholder="e.g., Cables, Fittings, Brackets, etc."
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Price (₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={newTubingPrice}
                                        onChange={(e) => setNewTubingPrice(parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={addTubingAndFittingItem}
                                className="mt-3 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 text-sm"
                            >
                                + Add Item
                            </button>
                        </div>

                        {tubingAndFittingItems.length > 0 && (
                            <div className="space-y-2">
                                {tubingAndFittingItems.map((item) => (
                                    <div key={item.id} className={`bg-white p-3 rounded-lg flex justify-between items-center ${item.isPreset ? 'border-l-4 border-rose-500' : ''}`}>
                                        <div>
                                            <p className="font-medium">
                                                {item.title}
                                                {item.isPreset && (
                                                    <span className="ml-2 text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                                                        Preset
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-sm text-gray-600">₹{item.price.toLocaleString('en-US')}</p>
                                        </div>
                                        <button
                                            onClick={() => removeTubingAndFittingItem(item.id)}
                                            className="text-red-600 hover:text-red-800 text-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                <div className="bg-orange-100 p-3 rounded-lg">
                                    <p className="font-bold text-orange-900">
                                        Miscellaneous Total: ₹{tubingAndFittingItems.reduce((sum, item) => sum + item.price, 0).toLocaleString('en-US')}
                                    </p>
                                </div>
                            </div>
                        )}

                        {tubingAndFittingItems.length === 0 && (
                            <div className="text-center py-4 text-gray-500">
                                <p className="text-sm">No items added yet</p>
                            </div>
                        )}
                    </div>
                )
            }

            {/* TESTING MODULE */}
            {
                currentProduct.size && currentProduct.rating && (
                    <div className="border-2 border-teal-200 rounded-lg p-6 mb-6 bg-teal-50">
                        <h3 className="text-xl font-bold mb-4 text-teal-900">🔬 Testing</h3>

                        {/* Preset Selection */}
                        {availableTestingPresets.length > 0 && (
                            <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 mb-4">
                                <p className="text-sm font-semibold text-violet-800 mb-3">📋 Available Presets (click to add):</p>
                                <div className="flex flex-wrap gap-2">
                                    {availableTestingPresets.map((preset) => {
                                        const isAlreadyAdded = testingItems.some(item => item.id === `preset-test-${preset.id}`);
                                        return (
                                            <button
                                                key={preset.id}
                                                onClick={() => addTestingPreset(preset)}
                                                disabled={isAlreadyAdded}
                                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${isAlreadyAdded
                                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                    : 'bg-violet-600 text-white hover:bg-violet-700 shadow-sm hover:shadow'
                                                    }`}
                                            >
                                                <span>{isAlreadyAdded ? '✓' : '+'}</span>
                                                <span>{preset.testName}</span>
                                                <span className="text-xs opacity-80">₹{preset.price.toLocaleString()}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Manual Input */}
                        <div className="bg-white rounded-lg p-4 mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-2">Test Title</label>
                                    <input
                                        type="text"
                                        value={newTestingTitle}
                                        onChange={(e) => setNewTestingTitle(e.target.value)}
                                        placeholder="e.g., Hydrostatic Pressure Test"
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Price (₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={newTestingPrice}
                                        onChange={(e) => setNewTestingPrice(parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={addTestingItem}
                                className="mt-3 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 text-sm"
                            >
                                + Add Test
                            </button>
                        </div>

                        {testingItems.length > 0 && (
                            <div className="space-y-2">
                                {testingItems.map((item) => (
                                    <div key={item.id} className={`bg-white p-3 rounded-lg flex justify-between items-center ${item.isPreset ? 'border-l-4 border-violet-500' : ''}`}>
                                        <div>
                                            <p className="font-medium">
                                                {item.title}
                                                {item.isPreset && (
                                                    <span className="ml-2 text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                                                        Preset
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-sm text-gray-600">₹{item.price.toLocaleString('en-US')}</p>
                                        </div>
                                        <button
                                            onClick={() => removeTestingItem(item.id)}
                                            className="text-red-600 hover:text-red-800 text-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                <div className="bg-teal-100 p-3 rounded-lg">
                                    <p className="font-bold text-teal-900">
                                        Testing Total: ₹{testingItems.reduce((sum, item) => sum + item.price, 0).toLocaleString('en-US')}
                                    </p>
                                </div>
                            </div>
                        )}

                        {testingItems.length === 0 && (
                            <div className="text-center py-4 text-gray-500">
                                <p className="text-sm">No tests added yet</p>
                            </div>
                        )}
                    </div>
                )
            }

            {/* ACCESSORIES MODULE */}
            {
                currentProduct.size && currentProduct.rating && (
                    <div className="border-2 border-pink-200 rounded-lg p-6 mb-6 bg-pink-50">
                        <h3 className="text-xl font-bold mb-4 text-pink-900">🎯 Accessories</h3>

                        <div className="bg-white rounded-lg p-4 mb-4">
                            <p className="text-sm font-medium mb-3">Default Accessories (Optional - Enter Custom Price)</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {DEFAULT_ACCESSORIES.map((title) => {
                                    const isChecked = accessoryItems.some(item => item.title === title);
                                    const showInput = showAccessoryPriceInput === title;

                                    return (
                                        <div key={title}>
                                            <label className="flex items-center cursor-pointer p-2 hover:bg-gray-50 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setShowAccessoryPriceInput(title);
                                                        } else {
                                                            toggleDefaultAccessory(title);
                                                        }
                                                    }}
                                                    className="mr-2 w-4 h-4"
                                                />
                                                <span className="text-sm">{title}</span>
                                            </label>

                                            {showInput && (
                                                <div className="ml-6 mt-2 flex items-center space-x-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        placeholder="Enter price"
                                                        value={customAccessoryPrice[title] || ''}
                                                        onChange={(e) => setCustomAccessoryPrice({
                                                            ...customAccessoryPrice,
                                                            [title]: parseFloat(e.target.value) || 0
                                                        })}
                                                        className="flex-1 px-3 py-1 border rounded text-sm"
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => handleDefaultAccessoryPriceSubmit(title)}
                                                        className="bg-pink-600 text-white px-3 py-1 rounded text-xs hover:bg-pink-700"
                                                    >
                                                        Add
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setShowAccessoryPriceInput(null);
                                                        }}
                                                        className="text-gray-600 hover:text-gray-800 text-xs"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 mb-4">
                            <p className="text-sm font-medium mb-3">Add Custom Accessory</p>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={newAccessoryTitle}
                                        onChange={(e) => setNewAccessoryTitle(e.target.value)}
                                        placeholder="e.g., Custom Mounting Bracket"
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-2">Unit Price (₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={newAccessoryPrice}
                                        onChange={(e) => setNewAccessoryPrice(parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-2">Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newAccessoryQuantity}
                                        onChange={(e) => setNewAccessoryQuantity(parseInt(e.target.value) || 1)}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={addCustomAccessory}
                                className="mt-3 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 text-sm"
                            >
                                + Add Accessory
                            </button>
                        </div>

                        {accessoryItems.length > 0 && (
                            <div className="space-y-2">
                                {accessoryItems.map((item) => (
                                    <div key={item.id} className="bg-white p-3 rounded-lg flex justify-between items-center">
                                        <div className="flex-1">
                                            <p className="font-medium">
                                                {item.title}
                                                {item.isDefault && <span className="ml-2 text-xs bg-pink-200 px-2 py-1 rounded">Default</span>}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                ₹{item.price.toLocaleString('en-US')} × {item.quantity} = ₹{(item.price * item.quantity).toLocaleString('en-US')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <label className="text-xs text-gray-500">Qty:</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => updateAccessoryQuantity(item.id, parseInt(e.target.value) || 1)}
                                                    className="w-16 px-2 py-1 border rounded text-sm text-center"
                                                />
                                            </div>
                                            <button
                                                onClick={() => removeAccessoryItem(item.id)}
                                                className="text-red-600 hover:text-red-800 text-sm"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <div className="bg-pink-100 p-3 rounded-lg">
                                    <p className="font-bold text-pink-900">
                                        Accessories Total: ₹{accessoryItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString('en-US')}
                                    </p>
                                </div>
                            </div>
                        )}

                        {accessoryItems.length === 0 && (
                            <div className="text-center py-4 text-gray-500">
                                <p className="text-sm">No accessories added yet</p>
                            </div>
                        )}
                    </div>
                )
            }

            {/* PROFIT & QUANTITY */}
            <div className="border-2 border-yellow-200 rounded-lg p-6 mb-6 bg-yellow-50">
                <h3 className="text-xl font-bold mb-4 text-yellow-900">💰 Profit, Margin & Quantity</h3>
                {!isAdmin && (
                    <p className="text-xs text-yellow-700 mb-3 bg-yellow-100 p-2 rounded">⚙️ Margins are set by admin in Settings. Contact admin to change.</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Manufacturing Profit (%)</label>
                        {isAdmin ? (
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={manufacturingProfit || ''}
                                onChange={(e) => setManufacturingProfit(parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        ) : (
                            <div className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-700 font-semibold">
                                {manufacturingProfit}%
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Bought-out Profit (%)</label>
                        {isAdmin ? (
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={boughtoutProfit || ''}
                                onChange={(e) => setBoughtoutProfit(parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        ) : (
                            <div className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-700 font-semibold">
                                {boughtoutProfit}%
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-purple-700">Negotiation Margin (%)</label>
                        {isAdmin ? (
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={negotiationMargin || ''}
                                onChange={(e) => setNegotiationMargin(parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                placeholder="0"
                            />
                        ) : (
                            <div className="w-full px-3 py-2 border border-purple-300 rounded-lg bg-purple-50 text-purple-700 font-semibold">
                                {negotiationMargin}%
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-orange-700">Discount (%)</label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={productDiscount || ''}
                            onChange={(e) => setProductDiscount(parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                            placeholder="0"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Quantity *</label>
                        <input
                            type="number"
                            min="1"
                            value={currentProduct.quantity || 1}
                            onChange={(e) => setCurrentProduct({ ...currentProduct, quantity: parseInt(e.target.value) || 1 })}
                            className="w-full px-3 py-2 border rounded-lg font-bold"
                        />
                    </div>
                </div>
            </div>

            {/* PRICE SUMMARY - Shows after calculation */}
            {
                currentProduct.productTotalCost && (
                    <div className="border-4 border-green-500 rounded-xl p-6 mb-6 bg-gradient-to-br from-green-50 to-emerald-50">
                        <h2 className="text-2xl font-bold mb-6 text-green-900 flex items-center">
                            <span className="text-3xl mr-3">💰</span>
                            Price Summary
                        </h2>

                        {/* Body Sub-Assembly Breakdown */}
                        <div className="bg-white rounded-lg p-4 mb-4">

                            {/* Specs Summary */}
                            <div className="bg-blue-50 rounded-lg p-3 mb-3 text-sm">
                                {/* Basic Specs Row */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    <div>
                                        <span className="text-gray-600">Series:</span>
                                        <span className="font-semibold ml-1">{currentProduct.seriesNumber}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Size:</span>
                                        <span className="font-semibold ml-1">{currentProduct.size}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Rating:</span>
                                        <span className="font-semibold ml-1">{currentProduct.rating}</span>
                                    </div>
                                    {currentProduct.trimType && (
                                        <div>
                                            <span className="text-gray-600">Trim type:</span>
                                            <span className="font-semibold ml-1">{currentProduct.trimType}</span>
                                        </div>
                                    )}
                                </div>
                                {/* Type/Connection Row */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                                    {currentProduct.bodyEndConnectType && (
                                        <div>
                                            <span className="text-gray-600">End connection:</span>
                                            <span className="font-semibold ml-1">{currentProduct.bodyEndConnectType}</span>
                                        </div>
                                    )}
                                    {currentProduct.bonnetType && (
                                        <div>
                                            <span className="text-gray-600">Bonnet Type:</span>
                                            <span className="font-semibold ml-1">{currentProduct.bonnetType}</span>
                                        </div>
                                    )}
                                    {currentProduct.sealType && (
                                        <div>
                                            <span className="text-gray-600">Seal:</span>
                                            <span className="font-semibold ml-1">{currentProduct.sealType}</span>
                                        </div>
                                    )}
                                    {currentProduct.actuatorSeries && (
                                        <div>
                                            <span className="text-gray-600">Actuator:</span>
                                            <span className="font-semibold ml-1">{currentProduct.actuatorSeries} / {currentProduct.actuatorModel}</span>
                                        </div>
                                    )}

                                </div>
                                {/* Materials Row */}
                                <div className="border-t border-blue-200 mt-3 pt-3">
                                    <div className="text-xs text-gray-500 mb-2 font-medium">Materials:</div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                                        {currentProduct.bodyBonnetMaterialId && (
                                            <div>
                                                <span className="text-gray-500">Body/Bonnet:</span>
                                                <span className="font-medium ml-1">
                                                    {bodyBonnetMaterials.find(m => m.id === currentProduct.bodyBonnetMaterialId)?.name || '-'}
                                                </span>
                                            </div>
                                        )}
                                        {currentProduct.plugMaterialId && (
                                            <div>
                                                <span className="text-gray-500">Plug:</span>
                                                <span className="font-medium ml-1">
                                                    {plugMaterials.find(m => m.id === currentProduct.plugMaterialId)?.name || '-'}
                                                </span>
                                            </div>
                                        )}
                                        {currentProduct.seatMaterialId && (
                                            <div>
                                                <span className="text-gray-500">Seat:</span>
                                                <span className="font-medium ml-1">
                                                    {seatMaterials.find(m => m.id === currentProduct.seatMaterialId)?.name || '-'}
                                                </span>
                                            </div>
                                        )}
                                        {currentProduct.stemMaterialId && (
                                            <div>
                                                <span className="text-gray-500">Stem:</span>
                                                <span className="font-medium ml-1">
                                                    {stemMaterials.find(m => m.id === currentProduct.stemMaterialId)?.name || '-'}
                                                </span>
                                            </div>
                                        )}
                                        {currentProduct.cageMaterialId && (
                                            <div>
                                                <span className="text-gray-500">Cage:</span>
                                                <span className="font-medium ml-1">
                                                    {cageMaterials.find(m => m.id === currentProduct.cageMaterialId)?.name || '-'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Body Sub-Assembly Total */}
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between font-bold text-blue-900 text-lg">
                                    <span>Body Sub-Assembly Total:</span>
                                    <span>₹{(currentProduct.bodySubAssemblyTotal || 0).toLocaleString('en-US')}</span>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between font-bold text-purple-900 text-lg">
                                    <span>Actuator Sub-Assembly Total:</span>
                                    <span>₹{(currentProduct.actuatorSubAssemblyTotal || 0).toLocaleString('en-US')}</span>
                                </div>
                            </div>
                        </div>



                        {/* Miscellaneous Breakdown */}
                        {(currentProduct.tubingAndFittingTotal || 0) > 0 && (
                            <div className="bg-white rounded-lg p-4 mb-4">
                                <h3 className="font-bold text-lg mb-3 text-orange-900">📦 Miscellaneous</h3>
                                <div className="space-y-2 text-sm">
                                    {currentProduct.tubingAndFitting?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between">
                                            <span>{item.title}</span>
                                            <span className="font-semibold">₹{item.price.toLocaleString('en-US')}</span>
                                        </div>
                                    ))}
                                    <div className="border-t pt-2 mt-2 flex justify-between font-bold text-orange-900">
                                        <span>Subtotal</span>
                                        <span>₹{(currentProduct.tubingAndFittingTotal || 0).toLocaleString('en-US')}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Testing Breakdown */}
                        {(currentProduct.testingTotal || 0) > 0 && (
                            <div className="bg-white rounded-lg p-4 mb-4">
                                <h3 className="font-bold text-lg mb-3 text-teal-900">🔬 Testing</h3>
                                <div className="space-y-2 text-sm">
                                    {currentProduct.testing?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between">
                                            <span>{item.title}</span>
                                            <span className="font-semibold">₹{item.price.toLocaleString('en-US')}</span>
                                        </div>
                                    ))}
                                    <div className="border-t pt-2 mt-2 flex justify-between font-bold text-teal-900">
                                        <span>Subtotal</span>
                                        <span>₹{(currentProduct.testingTotal || 0).toLocaleString('en-US')}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Accessories Breakdown */}
                        {(currentProduct.accessoriesTotal || 0) > 0 && (
                            <div className="bg-white rounded-lg p-4 mb-4">
                                <h3 className="font-bold text-lg mb-3 text-pink-900">🎯 Accessories (Bought-out Items)</h3>
                                <div className="space-y-2 text-sm">
                                    {currentProduct.accessories?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between">
                                            <span>
                                                {item.title}
                                                {item.isDefault && <span className="ml-2 text-xs bg-pink-200 px-2 py-0.5 rounded">Default</span>}
                                                <span className="ml-2 text-xs text-gray-500">×{item.quantity}</span>
                                            </span>
                                            <span className="font-semibold">₹{item.price.toLocaleString('en-US')} × {item.quantity} = ₹{(item.price * item.quantity).toLocaleString('en-US')}</span>
                                        </div>
                                    ))}
                                    <div className="border-t pt-2 mt-2 flex justify-between font-bold text-pink-900">
                                        <span>Subtotal</span>
                                        <span>₹{(currentProduct.accessoriesTotal || 0).toLocaleString('en-US')}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Final Totals */}
                        <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-6 border-2 border-green-300">
                            <div className="space-y-3">
                                <div className="flex justify-between text-xl font-bold text-emerald-900 bg-emerald-200 px-4 py-3 rounded-lg">
                                    <span>FINAL PRICE (Qty: {currentProduct.quantity || 1}):</span>
                                    <span>₹{(currentProduct.lineTotal || 0).toLocaleString('en-US')}</span>
                                </div>
                            </div>


                        </div>
                    </div>
                )
            }
            {/* ACTION BUTTONS */}
            <div className="flex justify-end space-x-4">
                <button
                    onClick={onCancel}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    onClick={calculateProductPrice}
                    disabled={calculating}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {calculating ? 'Calculating...' : 'Calculate Price'}
                </button>
                <button
                    onClick={handleSave}
                    disabled={!currentProduct.productTotalCost || calculating}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-bold"
                >
                    {initialProduct?.id ? 'Update Product' : 'Add Product'}
                </button>
            </div>
        </div >
    );
}
