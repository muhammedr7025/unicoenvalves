import { useState, useEffect, useMemo } from 'react';
import {
    Material,
    Series,
    QuoteProduct,
    TubingAndFittingItem,
    TestingItem,
    AccessoryItem,
    DEFAULT_ACCESSORIES,
} from '@/types';
import { useProductConfig } from '@/hooks/useProductConfig';
import SearchableSelect from '@/components/ui/SearchableSelect';


interface ProductConfigurationFormProps {
    initialProduct?: Partial<QuoteProduct>;
    series: Series[];
    materials: Material[];
    onSave: (product: QuoteProduct) => void;
    onCancel: () => void;
}

export default function ProductConfigurationForm({
    initialProduct,
    series,
    materials,
    onSave,
    onCancel,
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
    } = useProductConfig({ initialProduct, series, materials });

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
                <p className="text-xs text-red-700 mt-2 font-medium">
                    ⚠️ Required: Add a custom identifier to easily distinguish this product in the quote
                </p>
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
                    <label className="block text-sm font-medium mb-2">Trim Type * (Used for Plug, Seat, Stem, Cage pricing)</label>
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
                    <p className="text-xs text-orange-700 mt-2 font-medium">
                        ⚠️ Required: Same trim type applies to Plug, Seat, Stem, and Cage components
                    </p>
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
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">Material Group 1</span>
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
                                    <p className="text-xs text-gray-500 mt-1">
                                        * This material is shared for both Body and Bonnet
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Bonnet */}
                        <div className="bg-white rounded-lg p-4 border-2 border-blue-300">
                            <h4 className="font-semibold mb-3 text-gray-900 flex items-center">
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">Material Group 1</span>
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
                                <div className="bg-blue-50 p-3 rounded">
                                    <p className="text-xs text-blue-800">
                                        ℹ️ Uses the same material as Body (Material Group 1)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Plug */}
                        <div className="bg-white rounded-lg p-4 border-2 border-purple-300">
                            <h4 className="font-semibold mb-3 text-gray-900 flex items-center">
                                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs mr-2">Material Group 2</span>
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
                                <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded text-xs mr-2">Material Group 3</span>
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
                                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs mr-2">Material Group 4</span>
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
                                    <p className="text-xs text-gray-500 mt-1">
                                        * Stem price = Fixed price based on series, size, rating, and material
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Cage (conditional) */}
                        {currentProduct.hasCage && (
                            <div className="bg-white rounded-lg p-4 border-2 border-green-300">
                                <h4 className="font-semibold mb-3 text-gray-900 flex items-center">
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs mr-2">Material Group 5</span>
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
                                        <p className="text-xs text-gray-500 mt-1">
                                            * Cage price = Weight × Material price
                                        </p>
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
                                        <p className="text-xs text-gray-500 mt-1">
                                            Fixed price based on seal type, size, and rating
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
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
                                    <label className="block text-sm font-medium mb-2">Configuration *</label>
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
                                                <label className="block text-sm font-medium mb-2">Handwheel Series *</label>
                                                <SearchableSelect
                                                    value={currentProduct.handwheelSeries || ''}
                                                    onChange={(value) => handleHandwheelSeriesChange(value)}
                                                    options={handwheelSeriesOptions}
                                                    placeholder="Search series..."
                                                    disabled={!availableHandwheelSeries.length}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">Handwheel Model *</label>
                                                <SearchableSelect
                                                    value={currentProduct.handwheelModel || ''}
                                                    onChange={(value) => setCurrentProduct({ ...currentProduct, handwheelModel: value })}
                                                    options={handwheelModelOptions}
                                                    placeholder="Search model..."
                                                    disabled={!availableHandwheelModels.length}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">Configuration *</label>
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
                                    <div key={item.id} className="bg-white p-3 rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{item.title}</p>
                                            <p className="text-sm text-gray-600">₹{item.price.toLocaleString('en-IN')}</p>
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
                                        Miscellaneous Total: ₹{tubingAndFittingItems.reduce((sum, item) => sum + item.price, 0).toLocaleString('en-IN')}
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
                                    <div key={item.id} className="bg-white p-3 rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{item.title}</p>
                                            <p className="text-sm text-gray-600">₹{item.price.toLocaleString('en-IN')}</p>
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
                                        Testing Total: ₹{testingItems.reduce((sum, item) => sum + item.price, 0).toLocaleString('en-IN')}
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
                                                ₹{item.price.toLocaleString('en-IN')} × {item.quantity} = ₹{(item.price * item.quantity).toLocaleString('en-IN')}
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
                                        Accessories Total: ₹{accessoryItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString('en-IN')}
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
                <h3 className="text-xl font-bold mb-4 text-yellow-900">💰 Profit & Quantity</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Manufacturing Profit (%)</label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={manufacturingProfit}
                            onChange={(e) => setManufacturingProfit(parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Bought-out Profit (%)</label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={boughtoutProfit}
                            onChange={(e) => setBoughtoutProfit(parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border rounded-lg"
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
                            <h3 className="font-bold text-lg mb-3 text-blue-900">🔧 Body Sub-Assembly</h3>
                            <div className="space-y-2 text-sm">
                                {(currentProduct.bodyTotalCost || 0) > 0 && (
                                    <div className="border-l-4 border-blue-400 pl-3 py-2 bg-blue-50">
                                        <div className="font-semibold text-blue-900 mb-1">Body</div>
                                        <div className="flex justify-between text-xs">
                                            <span>Material: {currentProduct.bodyWeight}kg × ₹{currentProduct.bodyMaterialPrice}/kg</span>
                                            <span>₹{((currentProduct.bodyWeight || 0) * (currentProduct.bodyMaterialPrice || 0)).toLocaleString('en-IN')}</span>
                                        </div>
                                        {(currentProduct.bodyMachineCost || 0) > 0 && (
                                            <div className="flex justify-between text-xs text-purple-700">
                                                <span>Machine: {currentProduct.bodyWorkHours}hr × ₹{currentProduct.bodyMachineRate}/hr ({currentProduct.bodyMachineTypeName})</span>
                                                <span>₹{(currentProduct.bodyMachineCost || 0).toLocaleString('en-IN')}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-sm mt-1 pt-1 border-t border-blue-200">
                                            <span>Body Total:</span>
                                            <span>₹{(currentProduct.bodyTotalCost || 0).toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                )}
                                {(currentProduct.bonnetTotalCost || 0) > 0 && (
                                    <div className="border-l-4 border-green-400 pl-3 py-2 bg-green-50">
                                        <div className="font-semibold text-green-900 mb-1">Bonnet</div>
                                        <div className="flex justify-between text-xs">
                                            <span>Material: {currentProduct.bonnetWeight}kg × ₹{currentProduct.bonnetMaterialPrice}/kg</span>
                                            <span>₹{((currentProduct.bonnetWeight || 0) * (currentProduct.bonnetMaterialPrice || 0)).toLocaleString('en-IN')}</span>
                                        </div>
                                        {(currentProduct.bonnetMachineCost || 0) > 0 && (
                                            <div className="flex justify-between text-xs text-purple-700">
                                                <span>Machine: {currentProduct.bonnetWorkHours}hr × ₹{currentProduct.bonnetMachineRate}/hr ({currentProduct.bonnetMachineTypeName})</span>
                                                <span>₹{(currentProduct.bonnetMachineCost || 0).toLocaleString('en-IN')}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-sm mt-1 pt-1 border-t border-green-200">
                                            <span>Bonnet Total:</span>
                                            <span>₹{(currentProduct.bonnetTotalCost || 0).toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                )}
                                {(currentProduct.plugTotalCost || 0) > 0 && (
                                    <div className="border-l-4 border-orange-400 pl-3 py-2 bg-orange-50">
                                        <div className="font-semibold text-orange-900 mb-1">Plug</div>
                                        <div className="flex justify-between text-xs">
                                            <span>Material: {currentProduct.plugWeight}kg × ₹{currentProduct.plugMaterialPrice}/kg</span>
                                            <span>₹{((currentProduct.plugWeight || 0) * (currentProduct.plugMaterialPrice || 0)).toLocaleString('en-IN')}</span>
                                        </div>
                                        {(currentProduct.plugMachineCost || 0) > 0 && (
                                            <div className="flex justify-between text-xs text-purple-700">
                                                <span>Machine: {currentProduct.plugWorkHours}hr × ₹{currentProduct.plugMachineRate}/hr ({currentProduct.plugMachineTypeName})</span>
                                                <span>₹{(currentProduct.plugMachineCost || 0).toLocaleString('en-IN')}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-sm mt-1 pt-1 border-t border-orange-200">
                                            <span>Plug Total:</span>
                                            <span>₹{(currentProduct.plugTotalCost || 0).toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                )}
                                {(currentProduct.seatTotalCost || 0) > 0 && (
                                    <div className="border-l-4 border-red-400 pl-3 py-2 bg-red-50">
                                        <div className="font-semibold text-red-900 mb-1">Seat</div>
                                        <div className="flex justify-between text-xs">
                                            <span>Material: {currentProduct.seatWeight}kg × ₹{currentProduct.seatMaterialPrice}/kg</span>
                                            <span>₹{((currentProduct.seatWeight || 0) * (currentProduct.seatMaterialPrice || 0)).toLocaleString('en-IN')}</span>
                                        </div>
                                        {(currentProduct.seatMachineCost || 0) > 0 && (
                                            <div className="flex justify-between text-xs text-purple-700">
                                                <span>Machine: {currentProduct.seatWorkHours}hr × ₹{currentProduct.seatMachineRate}/hr ({currentProduct.seatMachineTypeName})</span>
                                                <span>₹{(currentProduct.seatMachineCost || 0).toLocaleString('en-IN')}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-sm mt-1 pt-1 border-t border-red-200">
                                            <span>Seat Total:</span>
                                            <span>₹{(currentProduct.seatTotalCost || 0).toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                )}
                                {(currentProduct.stemTotalCost || 0) > 0 && (
                                    <div className="border-l-4 border-yellow-400 pl-3 py-2 bg-yellow-50">
                                        <div className="font-semibold text-yellow-900 mb-1">Stem</div>
                                        <div className="flex justify-between text-xs">
                                            <span>Material: Fixed Price</span>
                                            <span>₹{(currentProduct.stemFixedPrice || 0).toLocaleString('en-IN')}</span>
                                        </div>
                                        {(currentProduct.stemMachineCost || 0) > 0 && (
                                            <div className="flex justify-between text-xs text-purple-700">
                                                <span>Machine: {currentProduct.stemWorkHours}hr × ₹{currentProduct.stemMachineRate}/hr ({currentProduct.stemMachineTypeName})</span>
                                                <span>₹{(currentProduct.stemMachineCost || 0).toLocaleString('en-IN')}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-sm mt-1 pt-1 border-t border-yellow-200">
                                            <span>Stem Total:</span>
                                            <span>₹{(currentProduct.stemTotalCost || 0).toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                )}
                                {(currentProduct.cageTotalCost || 0) > 0 && (
                                    <div className="border-l-4 border-indigo-400 pl-3 py-2 bg-indigo-50">
                                        <div className="font-semibold text-indigo-900 mb-1">Cage</div>
                                        <div className="flex justify-between text-xs">
                                            <span>Material: {currentProduct.cageWeight}kg × ₹{currentProduct.cageMaterialPrice}/kg</span>
                                            <span>₹{((currentProduct.cageWeight || 0) * (currentProduct.cageMaterialPrice || 0)).toLocaleString('en-IN')}</span>
                                        </div>
                                        {(currentProduct.cageMachineCost || 0) > 0 && (
                                            <div className="flex justify-between text-xs text-purple-700">
                                                <span>Machine: {currentProduct.cageWorkHours}hr × ₹{currentProduct.cageMachineRate}/hr ({currentProduct.cageMachineTypeName})</span>
                                                <span>₹{(currentProduct.cageMachineCost || 0).toLocaleString('en-IN')}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-sm mt-1 pt-1 border-t border-indigo-200">
                                            <span>Cage Total:</span>
                                            <span>₹{(currentProduct.cageTotalCost || 0).toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                )}
                                {(currentProduct.sealRingTotalCost || 0) > 0 && (
                                    <div className="border-l-4 border-pink-400 pl-3 py-2 bg-pink-50">
                                        <div className="font-semibold text-pink-900 mb-1">Seal Ring</div>
                                        <div className="flex justify-between text-xs">
                                            <span>Material: Fixed Price</span>
                                            <span>₹{(currentProduct.sealRingFixedPrice || 0).toLocaleString('en-IN')}</span>
                                        </div>
                                        {(currentProduct.sealRingMachineCost || 0) > 0 && (
                                            <div className="flex justify-between text-xs text-purple-700">
                                                <span>Machine: {currentProduct.sealRingWorkHours}hr × ₹{currentProduct.sealRingMachineRate}/hr ({currentProduct.sealRingMachineTypeName})</span>
                                                <span>₹{(currentProduct.sealRingMachineCost || 0).toLocaleString('en-IN')}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-sm mt-1 pt-1 border-t border-pink-200">
                                            <span>Seal Ring Total:</span>
                                            <span>₹{(currentProduct.sealRingTotalCost || 0).toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                )}
                                <div className="border-t pt-2 mt-2 flex justify-between font-bold text-blue-900">
                                    <span>Subtotal</span>
                                    <span>₹{(currentProduct.bodySubAssemblyTotal || 0).toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actuator Sub-Assembly Breakdown */}
                        {(currentProduct.actuatorSubAssemblyTotal || 0) > 0 && (
                            <div className="bg-white rounded-lg p-4 mb-4">
                                <h3 className="font-bold text-lg mb-3 text-purple-900">⚙️ Actuator Sub-Assembly</h3>
                                <div className="space-y-2 text-sm">
                                    {(currentProduct.actuatorFixedPrice || 0) > 0 && (
                                        <div className="flex justify-between">
                                            <span>Actuator ({currentProduct.actuatorType} - {currentProduct.actuatorSeries} - {currentProduct.actuatorModel})</span>
                                            <span className="font-semibold">₹{(currentProduct.actuatorFixedPrice || 0).toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                    {(currentProduct.handwheelFixedPrice || 0) > 0 && (
                                        <div className="flex justify-between">
                                            <span>Handwheel ({currentProduct.handwheelType} - {currentProduct.handwheelSeries} - {currentProduct.handwheelModel})</span>
                                            <span className="font-semibold">₹{(currentProduct.handwheelFixedPrice || 0).toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                    <div className="border-t pt-2 mt-2 flex justify-between font-bold text-purple-900">
                                        <span>Subtotal</span>
                                        <span>₹{(currentProduct.actuatorSubAssemblyTotal || 0).toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Miscellaneous Breakdown */}
                        {(currentProduct.tubingAndFittingTotal || 0) > 0 && (
                            <div className="bg-white rounded-lg p-4 mb-4">
                                <h3 className="font-bold text-lg mb-3 text-orange-900">📦 Miscellaneous</h3>
                                <div className="space-y-2 text-sm">
                                    {currentProduct.tubingAndFitting?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between">
                                            <span>{item.title}</span>
                                            <span className="font-semibold">₹{item.price.toLocaleString('en-IN')}</span>
                                        </div>
                                    ))}
                                    <div className="border-t pt-2 mt-2 flex justify-between font-bold text-orange-900">
                                        <span>Subtotal</span>
                                        <span>₹{(currentProduct.tubingAndFittingTotal || 0).toLocaleString('en-IN')}</span>
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
                                            <span className="font-semibold">₹{item.price.toLocaleString('en-IN')}</span>
                                        </div>
                                    ))}
                                    <div className="border-t pt-2 mt-2 flex justify-between font-bold text-teal-900">
                                        <span>Subtotal</span>
                                        <span>₹{(currentProduct.testingTotal || 0).toLocaleString('en-IN')}</span>
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
                                            <span className="font-semibold">₹{item.price.toLocaleString('en-IN')} × {item.quantity} = ₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                        </div>
                                    ))}
                                    <div className="border-t pt-2 mt-2 flex justify-between font-bold text-pink-900">
                                        <span>Subtotal</span>
                                        <span>₹{(currentProduct.accessoriesTotal || 0).toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Final Totals */}
                        <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-6 border-2 border-green-300">
                            <div className="space-y-3">
                                {/* Manufacturing Cost Breakdown */}
                                <div className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
                                    <div className="text-sm font-semibold text-gray-700 mb-2">Manufacturing Cost Breakdown:</div>
                                    <div className="space-y-1 text-sm">
                                        {(() => {
                                            const totalMaterialCost = (
                                                ((currentProduct.bodyWeight || 0) * (currentProduct.bodyMaterialPrice || 0)) +
                                                ((currentProduct.bonnetWeight || 0) * (currentProduct.bonnetMaterialPrice || 0)) +
                                                ((currentProduct.plugWeight || 0) * (currentProduct.plugMaterialPrice || 0)) +
                                                ((currentProduct.seatWeight || 0) * (currentProduct.seatMaterialPrice || 0)) +
                                                (currentProduct.stemFixedPrice || 0) +
                                                ((currentProduct.cageWeight || 0) * (currentProduct.cageMaterialPrice || 0)) +
                                                (currentProduct.sealRingFixedPrice || 0)
                                            );
                                            const totalMachineCost = (
                                                (currentProduct.bodyMachineCost || 0) +
                                                (currentProduct.bonnetMachineCost || 0) +
                                                (currentProduct.plugMachineCost || 0) +
                                                (currentProduct.seatMachineCost || 0) +
                                                (currentProduct.stemMachineCost || 0) +
                                                (currentProduct.cageMachineCost || 0) +
                                                (currentProduct.sealRingMachineCost || 0)
                                            );
                                            return (
                                                <>
                                                    <div className="flex justify-between text-blue-700">
                                                        <span>• Material Costs (Body Sub-Assembly)</span>
                                                        <span className="font-semibold">₹{totalMaterialCost.toLocaleString('en-IN')}</span>
                                                    </div>
                                                    {totalMachineCost > 0 && (
                                                        <div className="flex justify-between text-purple-700">
                                                            <span>• Machine Costs (Body Sub-Assembly)</span>
                                                            <span className="font-semibold">₹{totalMachineCost.toLocaleString('en-IN')}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between text-gray-700">
                                                        <span>• Actuator + Miscellaneous + Testing</span>
                                                        <span className="font-semibold">₹{(
                                                            (currentProduct.actuatorSubAssemblyTotal || 0) +
                                                            (currentProduct.tubingAndFittingTotal || 0) +
                                                            (currentProduct.testingTotal || 0)
                                                        ).toLocaleString('en-IN')}</span>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>

                                <div className="flex justify-between text-lg">
                                    <div>
                                        <div>Manufacturing Cost:</div>
                                        <div className="text-xs text-gray-600 mt-1">
                                            (Body Sub-Assembly + Actuator + Miscellaneous + Testing)
                                        </div>
                                    </div>
                                    <span className="font-semibold">₹{(currentProduct.manufacturingCost || 0).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-sm text-green-700">
                                    <span>+  Profit ({currentProduct.manufacturingProfitPercentage}%):</span>
                                    <span>₹{(currentProduct.manufacturingProfitAmount || 0).toLocaleString('en-IN')}</span>
                                </div>

                                <div className="flex justify-between font-semibold border-b pb-2">
                                    <span>Manufacturing with Profit:</span>
                                    <span>₹{(currentProduct.manufacturingCostWithProfit || 0).toLocaleString('en-IN')}</span>
                                </div>

                                <div className="flex justify-between text-lg">
                                    <div>
                                        <div>Bought-out Items:</div>
                                        <div className="text-xs text-gray-600 mt-1">
                                            (Accessories only)
                                        </div>
                                    </div>
                                    <span className="font-semibold">₹{(currentProduct.boughtoutItemCost || 0).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-sm text-green-700">
                                    <span>+ Profit ({currentProduct.boughtoutProfitPercentage}%):</span>
                                    <span>₹{(currentProduct.boughtoutProfitAmount || 0).toLocaleString('en-IN')}</span>
                                </div>

                                <div className="flex justify-between text-2xl font-bold text-green-900 pt-3 border-t-4 border-green-500">
                                    <span>UNIT COST:</span>
                                    <span>₹{(currentProduct.unitCost || 0).toLocaleString('en-IN')}</span>
                                </div>

                                <div className="flex justify-between text-xl font-bold text-emerald-900 bg-emerald-200 px-4 py-3 rounded-lg mt-4">
                                    <span>TOTAL (Qty: {currentProduct.quantity || 1}):</span>
                                    <span>₹{(currentProduct.lineTotal || 0).toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                                <p className="text-sm text-yellow-900">
                                    ✅ <strong>Price calculated successfully!</strong> You can:
                                </p>
                                <ul className="list-disc list-inside text-sm text-yellow-900 ml-4 mt-2">
                                    <li>Click "Add Product" to save this to the quote</li>
                                    <li>Modify fields above and click "Calculate Price" again</li>
                                    <li>Click "Cancel" to discard</li>
                                </ul>
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
