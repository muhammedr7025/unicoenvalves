'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/authContext';
import { getAllCustomers } from '@/lib/firebase/customerService';
import { getAllMaterials, getAllSeries } from '@/lib/firebase/pricingService';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { generateQuoteNumber } from '@/utils/quoteNumber';

import { createQuote } from '@/lib/firebase/quoteService';
import {
  getAvailableSizes,
  getAvailableRatings,
  getAvailableEndConnectTypes,
  getAvailableBonnetTypes,
  getAvailableComponentTypes,
  getBodyWeight,
  getBonnetWeight,
  getComponentWeight,
  getCagePrice,
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
  });

  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availableRatings, setAvailableRatings] = useState<string[]>([]);
  const [availableEndConnectTypes, setAvailableEndConnectTypes] = useState<string[]>([]);
  const [availableBonnetTypes, setAvailableBonnetTypes] = useState<string[]>([]);
  const [availablePlugTypes, setAvailablePlugTypes] = useState<string[]>([]);
  const [availableSeatTypes, setAvailableSeatTypes] = useState<string[]>([]);
  const [availableStemTypes, setAvailableStemTypes] = useState<string[]>([]);

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
    const [customersData, materialsData, seriesData] = await Promise.all([
      getAllCustomers(),
      getAllMaterials(),
      getAllSeries(),
    ]);
    setCustomers(customersData);
    setMaterials(materialsData.filter(m => m.isActive));
    setSeries(seriesData.filter(s => s.isActive));
    setLoading(false);
  };

// REPLACE WITH THIS:

const fetchAvailableSizes = async (seriesNumber: string) => {
  console.log('Fetching sizes for seriesNumber:', seriesNumber);
  try {
    const sizes = await getAvailableSizes(seriesNumber);
    console.log('Available sizes:', sizes);
    setAvailableSizes(sizes);
  } catch (error) {
    console.error('Error fetching sizes:', error);
  }
};

const fetchAvailableRatings = async (seriesNumber: string, size: string) => {
  console.log('Fetching ratings for:', seriesNumber, size);
  try {
    const ratings = await getAvailableRatings(seriesNumber, size);
    console.log('Available ratings:', ratings);
    setAvailableRatings(ratings);
  } catch (error) {
    console.error('Error fetching ratings:', error);
  }
};

const fetchDependentOptions = async (seriesNumber: string, size: string, rating: string) => {
  console.log('Fetching component options for:', seriesNumber, size, rating);
  try {
    const [endConnects, bonnets, plugs, seats, stems] = await Promise.all([
      getAvailableEndConnectTypes(seriesNumber, size, rating),
      getAvailableBonnetTypes(seriesNumber, size, rating),
      getAvailableComponentTypes(seriesNumber, 'plug', size, rating),
      getAvailableComponentTypes(seriesNumber, 'seat', size, rating),
      getAvailableComponentTypes(seriesNumber, 'stem', size, rating),
    ]);

    console.log('Available options:', { endConnects, bonnets, plugs, seats, stems });

    setAvailableEndConnectTypes(endConnects);
    setAvailableBonnetTypes(bonnets);
    setAvailablePlugTypes(plugs);
    setAvailableSeatTypes(seats);
    setAvailableStemTypes(stems);
  } catch (error) {
    console.error('Error fetching component options:', error);
  }
};

const handleSeriesChange = async (seriesId: string) => {
  console.log('Series changed to:', seriesId);
  const selectedSeries = series.find(s => s.id === seriesId);
  if (!selectedSeries) return;

  console.log('Selected series data:', selectedSeries);

  // Reset everything first
  setCurrentProduct({
    quantity: 1,
    seriesId,
    seriesNumber: selectedSeries.seriesNumber,
    productType: selectedSeries.productType,
    hasCage: selectedSeries.hasCage,
  });
  
  setAvailableSizes([]);
  setAvailableRatings([]);
  setAvailableEndConnectTypes([]);
  setAvailableBonnetTypes([]);
  setAvailablePlugTypes([]);
  setAvailableSeatTypes([]);
  setAvailableStemTypes([]);

  // Fetch available sizes using seriesNumber, not seriesId
  await fetchAvailableSizes(selectedSeries.seriesNumber);
};

const handleSizeChange = async (size: string) => {
  console.log('Size changed to:', size);
  setCurrentProduct({ 
    ...currentProduct, 
    size,
    rating: undefined
  });
  
  setAvailableRatings([]);
  setAvailableEndConnectTypes([]);
  setAvailableBonnetTypes([]);
  setAvailablePlugTypes([]);
  setAvailableSeatTypes([]);
  setAvailableStemTypes([]);

  if (currentProduct.seriesNumber) {
    await fetchAvailableRatings(currentProduct.seriesNumber, size);
  }
};

const handleRatingChange = async (rating: string) => {
  console.log('Rating changed to:', rating);
  setCurrentProduct({ 
    ...currentProduct, 
    rating 
  });

  if (currentProduct.seriesNumber && currentProduct.size) {
    await fetchDependentOptions(currentProduct.seriesNumber, currentProduct.size, rating);
  }
};



// REMOVE THE OLD useEffect HOOKS - WE DON'T NEED THEM ANYMORE

  const calculateProductPrice = async () => {
    // Validation
    if (!currentProduct.seriesId || !currentProduct.size || !currentProduct.rating) {
      alert('Please select Series, Size, and Rating');
      return;
    }

    if (!currentProduct.bodyEndConnectType || !currentProduct.bonnetType ||
        !currentProduct.plugType || !currentProduct.seatType || !currentProduct.stemType) {
      alert('Please select all component types');
      return;
    }

    if (!currentProduct.bodyMaterialId || !currentProduct.bonnetMaterialId ||
        !currentProduct.plugMaterialId || !currentProduct.seatMaterialId ||
        !currentProduct.stemMaterialId) {
      alert('Please select materials for all components');
      return;
    }

    setCalculating(true);

    try {
      const [bodyWeight, bonnetWeight, plugWeight, seatWeight, stemWeight] = await Promise.all([
        getBodyWeight(currentProduct.seriesNumber!, currentProduct.size!, currentProduct.rating!, currentProduct.bodyEndConnectType!),
        getBonnetWeight(currentProduct.seriesNumber!, currentProduct.size!, currentProduct.rating!, currentProduct.bonnetType!),
        getComponentWeight(currentProduct.seriesNumber!, 'plug', currentProduct.size!, currentProduct.rating!, currentProduct.plugType!),
        getComponentWeight(currentProduct.seriesNumber!, 'seat', currentProduct.size!, currentProduct.rating!, currentProduct.seatType!),
        getComponentWeight(currentProduct.seriesNumber!, 'stem', currentProduct.size!, currentProduct.rating!, currentProduct.stemType!),
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

      const bodyTotalCost = bodyWeight * bodyMaterial.pricePerKg;
      const bonnetTotalCost = bonnetWeight * bonnetMaterial.pricePerKg;
      const plugTotalCost = plugWeight * plugMaterial.pricePerKg;
      const seatTotalCost = seatWeight * seatMaterial.pricePerKg;
      const stemTotalCost = stemWeight * stemMaterial.pricePerKg;

      let cageTotalCost = 0;
      let cageFixedPrice = 0;
      
      if (currentProduct.hasCage) {
        const cagePrice = await getCagePrice(currentProduct.seriesNumber!, currentProduct.size!);
        if (cagePrice) {
          cageFixedPrice = cagePrice;
          cageTotalCost = cagePrice;
        }
      }

      const productTotalCost = bodyTotalCost + bonnetTotalCost + plugTotalCost + 
                               seatTotalCost + stemTotalCost + cageTotalCost;

      setCurrentProduct({
        ...currentProduct,
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

    const product: QuoteProduct = {
      id: `product-${Date.now()}`,
      ...(currentProduct as Required<QuoteProduct>),
    };

    setProducts([...products, product]);
    
    // Reset form
    setCurrentProduct({ quantity: 1, hasCage: false });
    setShowProductConfig(false);
    setAvailableSizes([]);
    setAvailableRatings([]);
    setAvailableEndConnectTypes([]);
    setAvailableBonnetTypes([]);
    setAvailablePlugTypes([]);
    setAvailableSeatTypes([]);
    setAvailableStemTypes([]);
  };

  const removeProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
  };

  const handleSaveQuote = async () => {
    if (!selectedCustomer) {
      alert('Please select a customer');
      return;
    }
  
    if (products.length === 0) {
      alert('Please add at least one product');
      return;
    }
  
    if (!user) {
      alert('User not authenticated');
      return;
    }
  
    setLoading(true);
  
    try {
      const quoteTotals = calculateQuoteTotals(products, discount, tax);
      
      // Generate quote number manually (temporary)
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
      const sequenceStr = Date.now().toString().slice(-4); // Temporary sequence
      const quoteNumber = await generateQuoteNumber();
  
      console.log('About to write to Firestore with quote number:', quoteNumber);
      console.log('User ID (createdBy):', user.id);
  
      // Direct Firestore write
      const quotesRef = collection(db, 'quotes');
      const docRef = await addDoc(quotesRef, {
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
          stemType: p.stemType,
          stemMaterialId: p.stemMaterialId,
          stemWeight: p.stemWeight,
          stemMaterialPrice: p.stemMaterialPrice,
          stemTotalCost: p.stemTotalCost,
          hasCage: p.hasCage,
          cageFixedPrice: p.cageFixedPrice || null,
          cageTotalCost: p.cageTotalCost || null,
          productTotalCost: p.productTotalCost,
          quantity: p.quantity,
          lineTotal: p.lineTotal,
        })),
        subtotal: quoteTotals.subtotal,
        discount: discount,
        discountAmount: quoteTotals.discountAmount,
        tax: tax,
        taxAmount: quoteTotals.taxAmount,
        total: quoteTotals.total,
        status: status,
        createdBy: user.id,
        createdByName: user.name,
        notes: notes || '',
        isArchived: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
  
      console.log('Quote created successfully with ID:', docRef.id);
      alert('Quote created successfully!');
      router.push('/employee');
    } catch (error: any) {
      console.error('Save quote error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
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
              <h2 className="text-xl font-bold mb-6">Configure Product</h2>
              
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

                {/* REPLACE THE SIZE SELECT WITH THIS: */}
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
  {!availableSizes.length && currentProduct.seriesId && (
    <p className="text-xs text-red-500 mt-1">No sizes available for this series</p>
  )}
</div>

{/* REPLACE THE RATING SELECT WITH THIS: */}
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
  {!availableRatings.length && currentProduct.size && (
    <p className="text-xs text-red-500 mt-1">No ratings available for this size</p>
  )}
</div>
{/* 
                <div>
                  <label className="block text-sm font-medium mb-2">Rating *</label>
                  <select
                    value={currentProduct.rating || ''}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, rating: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    disabled={!availableRatings.length}
                  >
                    <option value="">Select Rating</option>
                    {availableRatings.map((rating) => (
                      <option key={rating} value={rating}>{rating}</option>
                    ))}
                  </select>
                </div> */}
              </div>

              {/* Component Configuration */}
              {currentProduct.size && currentProduct.rating && (
                <>
                  <h3 className="font-semibold mb-4">Component Configuration</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Body */}
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">Body</h4>
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
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">Bonnet</h4>
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
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">Plug</h4>
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
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">Seat</h4>
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
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">Stem</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm mb-1">Stem Type *</label>
                          <select
                            value={currentProduct.stemType || ''}
                            onChange={(e) => setCurrentProduct({ ...currentProduct, stemType: e.target.value as any })}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          >
                            <option value="">Select</option>
                            {availableStemTypes.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
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
                        </div>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">Quantity</h4>
                      <input
                        type="number"
                        min="1"
                        value={currentProduct.quantity || 1}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, quantity: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowProductConfig(false);
                    setCurrentProduct({ quantity: 1, hasCage: false });
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
                    Add to Quote (₹{currentProduct.lineTotal?.toLocaleString()})
                  </button>
                )}
              </div>

              {/* Price Breakdown */}
              {currentProduct.productTotalCost && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Price Breakdown</h4>
                  <div className="text-sm space-y-1">
                    <p>Body: ₹{currentProduct.bodyTotalCost?.toFixed(2)}</p>
                    <p>Bonnet: ₹{currentProduct.bonnetTotalCost?.toFixed(2)}</p>
                    <p>Plug: ₹{currentProduct.plugTotalCost?.toFixed(2)}</p>
                    <p>Seat: ₹{currentProduct.seatTotalCost?.toFixed(2)}</p>
                    <p>Stem: ₹{currentProduct.stemTotalCost?.toFixed(2)}</p>
                    {currentProduct.cageTotalCost && <p>Cage: ₹{currentProduct.cageTotalCost?.toFixed(2)}</p>}
                    <p className="font-bold pt-2 border-t">Total: ₹{currentProduct.productTotalCost?.toFixed(2)}</p>
                    <p className="font-bold">Line Total (×{currentProduct.quantity}): ₹{currentProduct.lineTotal?.toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Products List */}
          {products.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold mb-4">Products Added ({products.length})</h3>
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">{product.seriesNumber} - Size {product.size} - Rating {product.rating}</p>
                      <p className="text-sm text-gray-600">Qty: {product.quantity} × ₹{product.productTotalCost.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <p className="font-bold">₹{product.lineTotal.toLocaleString()}</p>
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
                className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Continue to Review
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
                <p key={product.id} className="text-sm">
                  {product.seriesNumber} - {product.size}/{product.rating} (×{product.quantity}) - ₹{product.lineTotal.toLocaleString()}
                </p>
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
                  <span>₹{totals.subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount ({discount}%):</span>
                    <span>-₹{totals.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax ({tax}%):</span>
                  <span>₹{totals.taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span>₹{totals.total.toLocaleString()}</span>
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
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Quote'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}