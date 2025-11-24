'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/authContext';
import { getAllCustomers } from '@/lib/firebase/customerService';
import { getAllMaterials, getAllSeries } from '@/lib/firebase/pricingService';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  getAvailableSizes,
  getAvailableRatings,
  getAvailableEndConnectTypes,
  getAvailableBonnetTypes,
  getAvailableComponentTypes,
  getBodyWeight,
  getBonnetWeight,
  getComponentWeight,
  getStemWeight,
  getCagePriceBySeat,
  getAvailableActuatorTypes,
  getAvailableActuatorSeries,
  getAvailableActuatorModels,
  getActuatorPrice,
  getHandwheelPrice,
} from '@/lib/firebase/productConfigHelper';
import { Customer, Material, Series, QuoteProduct } from '@/types';
import { calculateQuoteTotals } from '@/utils/priceCalculator';

export default function NewQuotePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [products, setProducts] = useState<QuoteProduct[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Partial<QuoteProduct>>({
    quantity: 1,
    hasCage: false,
    hasActuator: false,
    hasHandwheel: false,
  });

  // Dynamic options for body sub-assembly
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availableRatings, setAvailableRatings] = useState<string[]>([]);
  const [availableEndConnectTypes, setAvailableEndConnectTypes] = useState<string[]>([]);
  const [availableBonnetTypes, setAvailableBonnetTypes] = useState<string[]>([]);
  const [availablePlugTypes, setAvailablePlugTypes] = useState<string[]>([]);
  const [availableSeatTypes, setAvailableSeatTypes] = useState<string[]>([]);

  // Dynamic options for actuator sub-assembly
  const [availableActuatorTypes, setAvailableActuatorTypes] = useState<string[]>([]);
  const [availableActuatorSeries, setAvailableActuatorSeries] = useState<string[]>([]);
  const [availableActuatorModels, setAvailableActuatorModels] = useState<string[]>([]);

  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(18);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'draft' | 'sent'>('draft');
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [showProductConfig, setShowProductConfig] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    const [customersData, materialsData, seriesData, actuatorTypes] = await Promise.all([
      getAllCustomers(),
      getAllMaterials(),
      getAllSeries(),
      getAvailableActuatorTypes(),
    ]);
    setCustomers(customersData);
    setMaterials(materialsData.filter(m => m.isActive));
    setSeries(seriesData.filter(s => s.isActive));
    setAvailableActuatorTypes(actuatorTypes);
    setLoading(false);
  };

  useEffect(() => {
    if (currentProduct.seriesNumber) {
      fetchAvailableSizes(currentProduct.seriesNumber);
    }
  }, [currentProduct.seriesNumber]);

  useEffect(() => {
    if (currentProduct.seriesNumber && currentProduct.size) {
      fetchAvailableRatings(currentProduct.seriesNumber, currentProduct.size);
    }
  }, [currentProduct.seriesNumber, currentProduct.size]);

  useEffect(() => {
    if (currentProduct.seriesNumber && currentProduct.size && currentProduct.rating) {
      fetchDependentOptions(currentProduct.seriesNumber, currentProduct.size, currentProduct.rating);
    }
  }, [currentProduct.seriesNumber, currentProduct.size, currentProduct.rating]);

  useEffect(() => {
    if (currentProduct.actuatorType) {
      fetchActuatorSeries(currentProduct.actuatorType);
    }
  }, [currentProduct.actuatorType]);

  useEffect(() => {
    if (currentProduct.actuatorType && currentProduct.actuatorSeries) {
      fetchActuatorModels(currentProduct.actuatorType, currentProduct.actuatorSeries);
    }
  }, [currentProduct.actuatorType, currentProduct.actuatorSeries]);

  const fetchAvailableSizes = async (seriesNumber: string) => {
    const sizes = await getAvailableSizes(seriesNumber);
    setAvailableSizes(sizes);
  };

  const fetchAvailableRatings = async (seriesNumber: string, size: string) => {
    const ratings = await getAvailableRatings(seriesNumber, size);
    setAvailableRatings(ratings);
  };

  const fetchDependentOptions = async (seriesNumber: string, size: string, rating: string) => {
    const [endConnects, bonnets, plugs, seats] = await Promise.all([
      getAvailableEndConnectTypes(seriesNumber, size, rating),
      getAvailableBonnetTypes(seriesNumber, size, rating),
      getAvailableComponentTypes(seriesNumber, 'plug', size, rating),
      getAvailableComponentTypes(seriesNumber, 'seat', size, rating),
    ]);

    setAvailableEndConnectTypes(endConnects);
    setAvailableBonnetTypes(bonnets);
    setAvailablePlugTypes(plugs);
    setAvailableSeatTypes(seats);
  };

  const fetchActuatorSeries = async (type: string) => {
    const series = await getAvailableActuatorSeries(type);
    setAvailableActuatorSeries(series);
  };

  const fetchActuatorModels = async (type: string, series: string) => {
    const models = await getAvailableActuatorModels(type, series);
    setAvailableActuatorModels(models);
  };

  const handleSeriesChange = async (seriesId: string) => {
    const selectedSeries = series.find(s => s.id === seriesId);
    if (!selectedSeries) return;

    setCurrentProduct({
      quantity: 1,
      seriesId,
      seriesNumber: selectedSeries.seriesNumber,
      productType: selectedSeries.productType,
      hasCage: selectedSeries.hasCage,
      hasActuator: false,
      hasHandwheel: false,
    });
    
    setAvailableSizes([]);
    setAvailableRatings([]);
    await fetchAvailableSizes(selectedSeries.seriesNumber);
  };

  const handleSizeChange = async (size: string) => {
    setCurrentProduct({ 
      ...currentProduct, 
      size,
      rating: undefined
    });
    
    setAvailableRatings([]);
    if (currentProduct.seriesNumber) {
      await fetchAvailableRatings(currentProduct.seriesNumber, size);
    }
  };

  const handleRatingChange = async (rating: string) => {
    setCurrentProduct({ 
      ...currentProduct, 
      rating 
    });

    if (currentProduct.seriesNumber && currentProduct.size) {
      await fetchDependentOptions(currentProduct.seriesNumber, currentProduct.size, rating);
    }
  };

  const calculateProductPrice = async () => {
    // Validation
    if (!currentProduct.seriesNumber || !currentProduct.size || !currentProduct.rating) {
      alert('Please select Series, Size, and Rating');
      return;
    }

    if (!currentProduct.bodyEndConnectType || !currentProduct.bonnetType ||
        !currentProduct.plugType || !currentProduct.seatType) {
      alert('Please select all body component types');
      return;
    }

    if (!currentProduct.bodyMaterialId || !currentProduct.bonnetMaterialId ||
        !currentProduct.plugMaterialId || !currentProduct.seatMaterialId ||
        !currentProduct.stemMaterialId) {
      alert('Please select materials for all components');
      return;
    }

    // Actuator validation
    if (currentProduct.hasActuator) {
      if (!currentProduct.actuatorType || !currentProduct.actuatorSeries || 
          !currentProduct.actuatorModel || !currentProduct.actuatorStandard) {
        alert('Please complete actuator configuration');
        return;
      }
    }

    setCalculating(true);

    try {
      // Get body sub-assembly weights
      const [bodyWeight, bonnetWeight, plugWeight, seatWeight, stemWeight] = await Promise.all([
        getBodyWeight(currentProduct.seriesNumber, currentProduct.size, currentProduct.rating, currentProduct.bodyEndConnectType),
        getBonnetWeight(currentProduct.seriesNumber, currentProduct.size, currentProduct.rating, currentProduct.bonnetType),
        getComponentWeight(currentProduct.seriesNumber, 'plug', currentProduct.size, currentProduct.rating, currentProduct.plugType),
        getComponentWeight(currentProduct.seriesNumber, 'seat', currentProduct.size, currentProduct.rating, currentProduct.seatType),
        getStemWeight(currentProduct.seriesNumber, currentProduct.size, currentProduct.rating),
      ]);

      const bodyMaterial = materials.find(m => m.id === currentProduct.bodyMaterialId);
      const bonnetMaterial = materials.find(m => m.id === currentProduct.bonnetMaterialId);
      const plugMaterial = materials.find(m => m.id === currentProduct.plugMaterialId);
      const seatMaterial = materials.find(m => m.id === currentProduct.seatMaterialId);
      const stemMaterial = materials.find(m => m.id === currentProduct.stemMaterialId);

      if (!bodyWeight || !bonnetWeight || !plugWeight || !seatWeight || !stemWeight) {
        alert('Weight data not found for selected configuration. Please check pricing data.');
        setCalculating(false);
        return;
      }

      if (!bodyMaterial || !bonnetMaterial || !plugMaterial || !seatMaterial || !stemMaterial) {
        alert('Material data not found');
        setCalculating(false);
        return;
      }

      // Calculate body sub-assembly costs
      const bodyTotalCost = bodyWeight * bodyMaterial.pricePerKg;
      const bonnetTotalCost = bonnetWeight * bonnetMaterial.pricePerKg;
      const plugTotalCost = plugWeight * plugMaterial.pricePerKg;
      const seatTotalCost = seatWeight * seatMaterial.pricePerKg;
      const stemTotalCost = stemWeight * stemMaterial.pricePerKg;

      // Cage price (based on seat type)
      let cageTotalCost = 0;
      let cageFixedPrice = 0;
      
      if (currentProduct.hasCage && currentProduct.seatType) {
        const cagePrice = await getCagePriceBySeat(
          currentProduct.seriesNumber, 
          currentProduct.size, 
          currentProduct.seatType
        );
        if (cagePrice) {
          cageFixedPrice = cagePrice;
          cageTotalCost = cagePrice;
        }
      }

      const bodySubAssemblyTotal = bodyTotalCost + bonnetTotalCost + plugTotalCost + 
                                    seatTotalCost + stemTotalCost + cageTotalCost;

      // Calculate actuator sub-assembly
      let actuatorFixedPrice = 0;
      let handwheelFixedPrice = 0;
      let actuatorSubAssemblyTotal = 0;

      if (currentProduct.hasActuator && currentProduct.actuatorType && 
          currentProduct.actuatorSeries && currentProduct.actuatorModel && 
          currentProduct.actuatorStandard) {
        
        const actuatorPrice = await getActuatorPrice(
          currentProduct.actuatorType,
          currentProduct.actuatorSeries,
          currentProduct.actuatorModel,
          currentProduct.actuatorStandard
        );

        if (actuatorPrice) {
          actuatorFixedPrice = actuatorPrice;
          actuatorSubAssemblyTotal += actuatorPrice;
        }

        // Handwheel
        if (currentProduct.hasHandwheel && currentProduct.actuatorModel) {
          const handwheelPrice = await getHandwheelPrice(currentProduct.actuatorModel);
          if (handwheelPrice) {
            handwheelFixedPrice = handwheelPrice;
            actuatorSubAssemblyTotal += handwheelPrice;
          }
        }
      }

      const productTotalCost = bodySubAssemblyTotal + actuatorSubAssemblyTotal;

      setCurrentProduct({
        ...currentProduct,
        // Body sub-assembly
        bodyWeight,
        bodyMaterialPrice: bodyMaterial.pricePerKg,
        bodyTotalCost,
        bonnetWeight,
        bonnetMaterialPrice: bonnetMaterial.pricePerKg,
        bonnetTotalCost,
        plugWeight,
        plugMaterialPrice: plugMaterial.pricePerKg,
        plugTotalCost,
        seatWeight,
        seatMaterialPrice: seatMaterial.pricePerKg,
        seatTotalCost,
        stemWeight,
        stemMaterialPrice: stemMaterial.pricePerKg,
        stemTotalCost,
        cageFixedPrice: currentProduct.hasCage ? cageFixedPrice : undefined,
        cageTotalCost: currentProduct.hasCage ? cageTotalCost : undefined,
        bodySubAssemblyTotal,
        // Actuator sub-assembly
        actuatorFixedPrice: currentProduct.hasActuator ? actuatorFixedPrice : undefined,
        handwheelFixedPrice: currentProduct.hasHandwheel ? handwheelFixedPrice : undefined,
        actuatorSubAssemblyTotal: currentProduct.hasActuator ? actuatorSubAssemblyTotal : undefined,
        // Total
        productTotalCost,
        lineTotal: productTotalCost * (currentProduct.quantity || 1),
      });

      alert('Price calculated successfully!');
    } catch (error) {
      console.error('Calculation error:', error);
      alert('Failed to calculate price');
    } finally {
      setCalculating(false);
    }
  };

  const addProductToQuote = () => {
    if (!currentProduct.productTotalCost) {
      alert('Please calculate the price first');
      return;
    }
  
    const { id, ...productData } = currentProduct; // Remove id if exists
    
    const product: QuoteProduct = {
      id: `product-${Date.now()}`,
      ...(productData as Required<Omit<QuoteProduct, 'id'>>),
    } as QuoteProduct;
  
    setProducts([...products, product]);
    
    // Reset form
    setCurrentProduct({ 
      quantity: 1, 
      hasCage: false,
      hasActuator: false,
      hasHandwheel: false,
    });
    setShowProductConfig(false);
    setAvailableSizes([]);
    setAvailableRatings([]);
  };

  const removeProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
  };

  const handleSaveQuote = async () => {
    if (!selectedCustomer || products.length === 0 || !user) {
      alert('Please complete all required fields');
      return;
    }

    setLoading(true);

    try {
      const totals = calculateQuoteTotals(products, discount, tax);
      
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      let fyStartYear: number;
      let fyEndYear: number;
      
      if (currentMonth >= 3) {
        fyStartYear = currentYear;
        fyEndYear = currentYear + 1;
      } else {
        fyStartYear = currentYear - 1;
        fyEndYear = currentYear;
      }
      
      const fyStart2Digit = fyStartYear.toString().slice(-2);
      const fyEnd2Digit = fyEndYear.toString().slice(-2);
      const fyCode = `${fyStart2Digit}${fyEnd2Digit}`;
      const sequenceStr = Date.now().toString().slice(-4);
      const quoteNumber = `UC-EN-${fyCode}-${sequenceStr}`;

      const quotesRef = collection(db, 'quotes');
      await addDoc(quotesRef, {
        quoteNumber: quoteNumber,
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        products: products.map(p => ({
          id: p.id,
          productType: p.productType,
          seriesId: p.seriesId,
          seriesNumber: p.seriesNumber,
          size: p.size,
          rating: p.rating,
          // Body sub-assembly
          bodyEndConnectType: p.bodyEndConnectType,
          bodyMaterialId: p.bodyMaterialId,
          bodyWeight: p.bodyWeight,
          bodyMaterialPrice: p.bodyMaterialPrice,
          bodyTotalCost: p.bodyTotalCost,
          bonnetType: p.bonnetType,
          bonnetMaterialId: p.bonnetMaterialId,
          bonnetWeight: p.bonnetWeight,
          bonnetMaterialPrice: p.bonnetMaterialPrice,
          bonnetTotalCost: p.bonnetTotalCost,
          plugType: p.plugType,
          plugMaterialId: p.plugMaterialId,
          plugWeight: p.plugWeight,
          plugMaterialPrice: p.plugMaterialPrice,
          plugTotalCost: p.plugTotalCost,
          seatType: p.seatType,
          seatMaterialId: p.seatMaterialId,
          seatWeight: p.seatWeight,
          seatMaterialPrice: p.seatMaterialPrice,
          seatTotalCost: p.seatTotalCost,
          stemMaterialId: p.stemMaterialId,
          stemWeight: p.stemWeight,
          stemMaterialPrice: p.stemMaterialPrice,
          stemTotalCost: p.stemTotalCost,
          hasCage: p.hasCage,
          cageFixedPrice: p.cageFixedPrice || null,
          cageTotalCost: p.cageTotalCost || null,
          bodySubAssemblyTotal: p.bodySubAssemblyTotal,
          // Actuator sub-assembly
          hasActuator: p.hasActuator,
          actuatorType: p.actuatorType || null,
          actuatorSeries: p.actuatorSeries || null,
          actuatorModel: p.actuatorModel || null,
          actuatorStandard: p.actuatorStandard || null,
          actuatorFixedPrice: p.actuatorFixedPrice || null,
          hasHandwheel: p.hasHandwheel || false,
          handwheelFixedPrice: p.handwheelFixedPrice || null,
          actuatorSubAssemblyTotal: p.actuatorSubAssemblyTotal || 0,
          // Totals
          productTotalCost: p.productTotalCost,
          quantity: p.quantity,
          lineTotal: p.lineTotal,
        })),
        subtotal: totals.subtotal,
        discount: discount,
        discountAmount: totals.discountAmount,
        tax: tax,
        taxAmount: totals.taxAmount,
        total: totals.total,
        status: status,
        createdBy: user.id,
        createdByName: user.name,
        notes: notes || '',
        isArchived: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      alert('Quote created successfully!');
      router.push('/employee');
    } catch (error: any) {
      alert('Failed to create quote: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const totals = products.length > 0 
    ? calculateQuoteTotals(products, discount, tax)
    : { subtotal: 0, discountAmount: 0, taxableAmount: 0, taxAmount: 0, total: 0 };

  if (loading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Quote</h1>

      {/* Steps */}
      <div className="mb-8 flex justify-center">
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                currentStep >= step ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 3 && <div className="w-16 h-1 bg-gray-300 mx-2"></div>}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Customer Selection */}
      {currentStep === 1 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Select Customer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map((customer) => (
              <div
                key={customer.id}
                onClick={() => {
                  setSelectedCustomer(customer);
                  setCurrentStep(2);
                }}
                className={`p-4 border-2 rounded-lg cursor-pointer hover:border-green-500 transition-colors ${
                  selectedCustomer?.id === customer.id ? 'border-green-600 bg-green-50' : 'border-gray-200'
                }`}
              >
                <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                <p className="text-sm text-gray-600">{customer.email}</p>
                <p className="text-sm text-gray-500">{customer.country}</p>
              </div>
            ))}
          </div>
        </div>
      )}

     {/* Step 2: Add Products */}
     {currentStep === 2 && (
        <div className="space-y-6">
          {/* Selected Customer Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Customer:</strong> {selectedCustomer?.name}
            </p>
            <button
              onClick={() => setCurrentStep(1)}
              className="text-blue-600 text-sm hover:underline mt-2"
            >
              Change Customer
            </button>
          </div>

          {/* Add New Product Button */}
          {!showProductConfig && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <button
                onClick={() => setShowProductConfig(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Product
              </button>
            </div>
          )}

          {/* Product Configuration Form */}
          {showProductConfig && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6">Configure Product</h2>
              
              {/* Basic Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Series *</label>
                  <select
                    value={currentProduct.seriesId || ''}
                    onChange={(e) => handleSeriesChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Series</option>
                    {series.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.productType})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Size *</label>
                  <select
                    value={currentProduct.size || ''}
                    onChange={(e) => handleSizeChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    disabled={!availableSizes.length}
                  >
                    <option value="">Select Size</option>
                    {availableSizes.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Rating *</label>
                  <select
                    value={currentProduct.rating || ''}
                    onChange={(e) => handleRatingChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    disabled={!availableRatings.length}
                  >
                    <option value="">Select Rating</option>
                    {availableRatings.map((rating) => (
                      <option key={rating} value={rating}>{rating}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* BODY SUB-ASSEMBLY */}
              {currentProduct.size && currentProduct.rating && (
                <div className="border-2 border-blue-200 rounded-lg p-6 mb-6 bg-blue-50">
                  <h3 className="text-xl font-bold mb-4 text-blue-900">🔧 Body Sub-Assembly</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Body */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold mb-3 text-gray-900">Body</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm mb-1">End Connect Type *</label>
                          <select
                            value={currentProduct.bodyEndConnectType || ''}
                            onChange={(e) => setCurrentProduct({ ...currentProduct, bodyEndConnectType: e.target.value as any })}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          >
                            <option value="">Select</option>
                            {availableEndConnectTypes.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm mb-1">Material *</label>
                          <select
                            value={currentProduct.bodyMaterialId || ''}
                            onChange={(e) => setCurrentProduct({ ...currentProduct, bodyMaterialId: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          >
                            <option value="">Select Material</option>
                            {materials.map((m) => (
                              <option key={m.id} value={m.id}>{m.name} (₹{m.pricePerKg}/kg)</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Bonnet */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold mb-3 text-gray-900">Bonnet</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm mb-1">Bonnet Type *</label>
                          <select
                            value={currentProduct.bonnetType || ''}
                            onChange={(e) => setCurrentProduct({ ...currentProduct, bonnetType: e.target.value as any })}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          >
                            <option value="">Select</option>
                            {availableBonnetTypes.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm mb-1">Material *</label>
                          <select
                            value={currentProduct.bonnetMaterialId || ''}
                            onChange={(e) => setCurrentProduct({ ...currentProduct, bonnetMaterialId: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          >
                            <option value="">Select Material</option>
                            {materials.map((m) => (
                              <option key={m.id} value={m.id}>{m.name} (₹{m.pricePerKg}/kg)</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Plug */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold mb-3 text-gray-900">Plug</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm mb-1">Plug Type *</label>
                          <select
                            value={currentProduct.plugType || ''}
                            onChange={(e) => setCurrentProduct({ ...currentProduct, plugType: e.target.value as any })}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          >
                            <option value="">Select</option>
                            {availablePlugTypes.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm mb-1">Material *</label>
                          <select
                            value={currentProduct.plugMaterialId || ''}
                            onChange={(e) => setCurrentProduct({ ...currentProduct, plugMaterialId: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          >
                            <option value="">Select Material</option>
                            {materials.map((m) => (
                              <option key={m.id} value={m.id}>{m.name} (₹{m.pricePerKg}/kg)</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Seat */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold mb-3 text-gray-900">Seat</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm mb-1">Seat Type *</label>
                          <select
                            value={currentProduct.seatType || ''}
                            onChange={(e) => setCurrentProduct({ ...currentProduct, seatType: e.target.value as any })}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          >
                            <option value="">Select</option>
                            {availableSeatTypes.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm mb-1">Material *</label>
                          <select
                            value={currentProduct.seatMaterialId || ''}
                            onChange={(e) => setCurrentProduct({ ...currentProduct, seatMaterialId: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          >
                            <option value="">Select Material</option>
                            {materials.map((m) => (
                              <option key={m.id} value={m.id}>{m.name} (₹{m.pricePerKg}/kg)</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Stem */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold mb-3 text-gray-900">Stem</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm mb-1">Material *</label>
                          <select
                            value={currentProduct.stemMaterialId || ''}
                            onChange={(e) => setCurrentProduct({ ...currentProduct, stemMaterialId: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          >
                            <option value="">Select Material</option>
                            {materials.map((m) => (
                              <option key={m.id} value={m.id}>{m.name} (₹{m.pricePerKg}/kg)</option>
                            ))}
                          </select>
                          <p className="text-xs text-gray-500 mt-1">
                            * Stem price = Size × Rating × Material price
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Cage (if applicable) */}
                    {currentProduct.hasCage && currentProduct.seatType && (
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <h4 className="font-semibold mb-3 text-gray-900">Cage</h4>
                        <div className="bg-green-50 p-3 rounded">
                          <p className="text-sm text-green-800">
                            ✓ Cage available for {currentProduct.seatType}
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            Price will be calculated based on seat type
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Quantity */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold mb-3 text-gray-900">Quantity</h4>
                      <input
                        type="number"
                        min="1"
                        value={currentProduct.quantity || 1}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, quantity: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ACTUATOR SUB-ASSEMBLY */}
              {currentProduct.size && currentProduct.rating && (
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
                      {/* Actuator Type */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <label className="block text-sm font-medium mb-2">Actuator Type *</label>
                        <select
                          value={currentProduct.actuatorType || ''}
                          onChange={(e) => {
                            setCurrentProduct({ 
                              ...currentProduct, 
                              actuatorType: e.target.value,
                              actuatorSeries: undefined,
                              actuatorModel: undefined,
                            });
                            setAvailableActuatorSeries([]);
                            setAvailableActuatorModels([]);
                          }}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="">Select Type</option>
                          {availableActuatorTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      {/* Actuator Series */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <label className="block text-sm font-medium mb-2">Actuator Series *</label>
                        <select
                          value={currentProduct.actuatorSeries || ''}
                          onChange={(e) => {
                            setCurrentProduct({ 
                              ...currentProduct, 
                              actuatorSeries: e.target.value,
                              actuatorModel: undefined,
                            });
                            setAvailableActuatorModels([]);
                          }}
                          className="w-full px-3 py-2 border rounded-lg"
                          disabled={!availableActuatorSeries.length}
                        >
                          <option value="">Select Series</option>
                          {availableActuatorSeries.map((series) => (
                            <option key={series} value={series}>{series}</option>
                          ))}
                        </select>
                      </div>

                      {/* Actuator Model */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <label className="block text-sm font-medium mb-2">Actuator Model *</label>
                        <select
                          value={currentProduct.actuatorModel || ''}
                          onChange={(e) => setCurrentProduct({ ...currentProduct, actuatorModel: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                          disabled={!availableActuatorModels.length}
                        >
                          <option value="">Select Model</option>
                          {availableActuatorModels.map((model) => (
                            <option key={model} value={model}>{model}</option>
                          ))}
                        </select>
                      </div>

                      {/* Standard/Special */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <label className="block text-sm font-medium mb-2">Configuration *</label>
                        <select
                          value={currentProduct.actuatorStandard || ''}
                          onChange={(e) => setCurrentProduct({ ...currentProduct, actuatorStandard: e.target.value as 'standard' | 'special' })}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="">Select Configuration</option>
                          <option value="standard">Standard</option>
                          <option value="special">Special</option>
                        </select>
                      </div>

                      {/* Handwheel */}
                      {currentProduct.actuatorModel && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200 col-span-2">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={currentProduct.hasHandwheel || false}
                              onChange={(e) => setCurrentProduct({ ...currentProduct, hasHandwheel: e.target.checked })}
                              className="mr-2 w-5 h-5"
                            />
                            <span className="text-sm font-medium">Add Handwheel (Optional)</span>
                          </label>
                          <p className="text-xs text-gray-500 mt-2">
                            Handwheel price depends on actuator model
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {!currentProduct.hasActuator && (
                    <div className="text-center py-8 text-gray-500">
                      <p>Enable "Add Actuator" to configure actuator options</p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowProductConfig(false);
                    setCurrentProduct({ quantity: 1, hasCage: false, hasActuator: false, hasHandwheel: false });
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                
                <button
                  onClick={calculateProductPrice}
                  disabled={calculating}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {calculating ? 'Calculating...' : 'Calculate Price'}
                </button>

                {currentProduct.productTotalCost && (
                  <button
                    onClick={addProductToQuote}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Add to Quote (₹{currentProduct.lineTotal?.toLocaleString('en-IN')})
                  </button>
                )}
              </div>

              {/* Price Breakdown */}
              {currentProduct.productTotalCost && (
                <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
                  <h4 className="font-bold text-lg mb-4 text-gray-900">💰 Price Breakdown</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Body Sub-Assembly */}
                    <div className="bg-white p-4 rounded-lg">
                      <h5 className="font-semibold text-blue-900 mb-2">Body Sub-Assembly</h5>
                      <div className="text-sm space-y-1">
                        <p>Body: ₹{currentProduct.bodyTotalCost?.toFixed(2)}</p>
                        <p>Bonnet: ₹{currentProduct.bonnetTotalCost?.toFixed(2)}</p>
                        <p>Plug: ₹{currentProduct.plugTotalCost?.toFixed(2)}</p>
                        <p>Seat: ₹{currentProduct.seatTotalCost?.toFixed(2)}</p>
                        <p>Stem: ₹{currentProduct.stemTotalCost?.toFixed(2)}</p>
                        {currentProduct.cageTotalCost && (
                          <p>Cage: ₹{currentProduct.cageTotalCost?.toFixed(2)}</p>
                        )}
                        <p className="font-bold pt-2 border-t text-blue-900">
                          Subtotal: ₹{currentProduct.bodySubAssemblyTotal?.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Actuator Sub-Assembly */}
                    {currentProduct.hasActuator && currentProduct.actuatorSubAssemblyTotal && (
                      <div className="bg-white p-4 rounded-lg">
                        <h5 className="font-semibold text-purple-900 mb-2">Actuator Sub-Assembly</h5>
                        <div className="text-sm space-y-1">
                          <p>Actuator: ₹{currentProduct.actuatorFixedPrice?.toFixed(2)}</p>
                          {currentProduct.hasHandwheel && currentProduct.handwheelFixedPrice && (
                            <p>Handwheel: ₹{currentProduct.handwheelFixedPrice?.toFixed(2)}</p>
                          )}
                          <p className="font-bold pt-2 border-t text-purple-900">
                            Subtotal: ₹{currentProduct.actuatorSubAssemblyTotal?.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Grand Total */}
                  <div className="mt-4 pt-4 border-t-2 border-green-300">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Product Total:</span>
                      <span className="text-2xl font-bold text-green-600">
                        ₹{currentProduct.productTotalCost?.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-lg font-bold text-gray-900">
                        Line Total (×{currentProduct.quantity}):
                      </span>
                      <span className="text-2xl font-bold text-green-700">
                        ₹{currentProduct.lineTotal?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Products List */}
          {products.length > 0 && !showProductConfig && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold mb-4">Products Added ({products.length})</h3>
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border-2 rounded-lg hover:border-green-300">
                    <div>
                      <p className="font-semibold">{product.seriesNumber} - Size {product.size} - Rating {product.rating}</p>
                      <p className="text-sm text-gray-600">
                        Qty: {product.quantity} | Body: ₹{product.bodySubAssemblyTotal.toFixed(2)}
                        {product.hasActuator && ` | Actuator: ₹${product.actuatorSubAssemblyTotal?.toFixed(2)}`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <p className="font-bold text-lg">₹{product.lineTotal.toLocaleString('en-IN')}</p>
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentStep(3)}
                className="mt-6 w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
              >
                Continue to Review →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Review */}
      {currentStep === 3 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-6">Review Quote</h2>
          
          <div className="space-y-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Customer</p>
              <p className="font-semibold">{selectedCustomer?.name}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-2">Products ({products.length})</p>
              {products.map((product) => (
                <div key={product.id} className="text-sm mb-2 p-3 bg-gray-50 rounded">
                  <p className="font-medium">
                    {product.seriesNumber} - {product.size}/{product.rating} (×{product.quantity})
                  </p>
                  <p className="text-gray-600">
                    Body Sub-Assembly: ₹{product.bodySubAssemblyTotal.toLocaleString('en-IN')}
                    {product.hasActuator && ` | Actuator: ₹${product.actuatorSubAssemblyTotal?.toLocaleString('en-IN')}`}
                  </p>
                  <p className="font-semibold text-green-700">
                    Total: ₹{product.lineTotal.toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Tax (%)</label>
                <input
                  type="number"
                  min="0"
                  value={tax}
                  onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'sent')}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
              </select>
            </div>

            <div className="pt-4 border-t">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{totals.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount ({discount}%):</span>
                    <span>-₹{totals.discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax ({tax}%):</span>
                  <span>₹{totals.taxAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span>₹{totals.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50"
            >
              Back to Products
            </button>
            <button
              onClick={handleSaveQuote}
              disabled={loading}
              className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Quote'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
 
  