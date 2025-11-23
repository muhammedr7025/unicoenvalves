'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/firebase/authContext';
import { getAllMaterials, getAllSeries } from '@/lib/firebase/pricingService';
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
import { Quote, QuoteProduct, Material, Series } from '@/types';
import { calculateQuoteTotals } from '@/utils/priceCalculator';
import Link from 'next/link';

export default function EditQuotePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Products
  const [products, setProducts] = useState<QuoteProduct[]>([]);
  
  // Pricing data
  const [materials, setMaterials] = useState<Material[]>([]);
  const [series, setSeries] = useState<Series[]>([]);

  // Current product being edited/added
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);
  const [currentProduct, setCurrentProduct] = useState<Partial<QuoteProduct>>({
    quantity: 1,
    hasCage: false,
  });

  // Dynamic options
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availableRatings, setAvailableRatings] = useState<string[]>([]);
  const [availableEndConnectTypes, setAvailableEndConnectTypes] = useState<string[]>([]);
  const [availableBonnetTypes, setAvailableBonnetTypes] = useState<string[]>([]);
  const [availablePlugTypes, setAvailablePlugTypes] = useState<string[]>([]);
  const [availableSeatTypes, setAvailableSeatTypes] = useState<string[]>([]);
  const [availableStemTypes, setAvailableStemTypes] = useState<string[]>([]);

  const [calculating, setCalculating] = useState(false);

  // Quote details
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(18);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'draft' | 'sent' | 'approved' | 'rejected'>('draft');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (params.id) {
      fetchQuote(params.id as string);
    }
  }, [params.id]);

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

  const fetchInitialData = async () => {
    const [materialsData, seriesData] = await Promise.all([
      getAllMaterials(),
      getAllSeries(),
    ]);
    setMaterials(materialsData.filter(m => m.isActive));
    setSeries(seriesData.filter(s => s.isActive));
  };

  const fetchQuote = async (quoteId: string) => {
    setLoading(true);
    try {
      const quoteRef = doc(db, 'quotes', quoteId);
      const quoteDoc = await getDoc(quoteRef);
      
      if (quoteDoc.exists()) {
        const data = quoteDoc.data();
        const loadedQuote = {
          id: quoteDoc.id,
          quoteNumber: data.quoteNumber,
          customerId: data.customerId,
          customerName: data.customerName,
          products: data.products || [],
          subtotal: data.subtotal || 0,
          discount: data.discount || 0,
          discountAmount: data.discountAmount || 0,
          tax: data.tax || 0,
          taxAmount: data.taxAmount || 0,
          total: data.total || 0,
          status: data.status || 'draft',
          createdBy: data.createdBy,
          createdByName: data.createdByName,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          notes: data.notes || '',
          isArchived: data.isArchived || false,
        } as Quote;

        setQuote(loadedQuote);
        setProducts(loadedQuote.products);
        setDiscount(loadedQuote.discount);
        setTax(loadedQuote.tax);
        setNotes(loadedQuote.notes || '');
        setStatus(loadedQuote.status);
      } else {
        alert('Quote not found');
        router.push('/employee');
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
      alert('Failed to load quote');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSizes = async (seriesNumber: string) => {
    const sizes = await getAvailableSizes(seriesNumber);
    setAvailableSizes(sizes);
  };

  const fetchAvailableRatings = async (seriesNumber: string, size: string) => {
    const ratings = await getAvailableRatings(seriesNumber, size);
    setAvailableRatings(ratings);
  };

  const fetchDependentOptions = async (seriesNumber: string, size: string, rating: string) => {
    const [endConnects, bonnets, plugs, seats, stems] = await Promise.all([
      getAvailableEndConnectTypes(seriesNumber, size, rating),
      getAvailableBonnetTypes(seriesNumber, size, rating),
      getAvailableComponentTypes(seriesNumber, 'plug', size, rating),
      getAvailableComponentTypes(seriesNumber, 'seat', size, rating),
      getAvailableComponentTypes(seriesNumber, 'stem', size, rating),
    ]);

    setAvailableEndConnectTypes(endConnects);
    setAvailableBonnetTypes(bonnets);
    setAvailablePlugTypes(plugs);
    setAvailableSeatTypes(seats);
    setAvailableStemTypes(stems);
  };

  const handleSeriesChange = async (seriesId: string) => {
    const selectedSeries = series.find(s => s.id === seriesId);
    if (!selectedSeries) return;

    setCurrentProduct({
      quantity: currentProduct.quantity || 1,
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

    await fetchAvailableSizes(selectedSeries.seriesNumber);
  };

  const handleSizeChange = async (size: string) => {
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
    setCurrentProduct({ 
      ...currentProduct, 
      rating 
    });

    if (currentProduct.seriesNumber && currentProduct.size) {
      await fetchDependentOptions(currentProduct.seriesNumber, currentProduct.size, rating);
    }
  };

  const calculateProductPrice = async () => {
    if (!currentProduct.seriesNumber || !currentProduct.size || !currentProduct.rating ||
        !currentProduct.bodyEndConnectType || !currentProduct.bonnetType ||
        !currentProduct.plugType || !currentProduct.seatType || !currentProduct.stemType ||
        !currentProduct.bodyMaterialId || !currentProduct.bonnetMaterialId ||
        !currentProduct.plugMaterialId || !currentProduct.seatMaterialId ||
        !currentProduct.stemMaterialId) {
      alert('Please fill all required fields');
      return;
    }

    setCalculating(true);

    try {
      const [bodyWeight, bonnetWeight, plugWeight, seatWeight, stemWeight] = await Promise.all([
        getBodyWeight(currentProduct.seriesNumber, currentProduct.size, currentProduct.rating, currentProduct.bodyEndConnectType),
        getBonnetWeight(currentProduct.seriesNumber, currentProduct.size, currentProduct.rating, currentProduct.bonnetType),
        getComponentWeight(currentProduct.seriesNumber, 'plug', currentProduct.size, currentProduct.rating, currentProduct.plugType),
        getComponentWeight(currentProduct.seriesNumber, 'seat', currentProduct.size, currentProduct.rating, currentProduct.seatType),
        getComponentWeight(currentProduct.seriesNumber, 'stem', currentProduct.size, currentProduct.rating, currentProduct.stemType),
      ]);

      const bodyMaterial = materials.find(m => m.id === currentProduct.bodyMaterialId);
      const bonnetMaterial = materials.find(m => m.id === currentProduct.bonnetMaterialId);
      const plugMaterial = materials.find(m => m.id === currentProduct.plugMaterialId);
      const seatMaterial = materials.find(m => m.id === currentProduct.seatMaterialId);
      const stemMaterial = materials.find(m => m.id === currentProduct.stemMaterialId);

      if (!bodyWeight || !bonnetWeight || !plugWeight || !seatWeight || !stemWeight ||
          !bodyMaterial || !bonnetMaterial || !plugMaterial || !seatMaterial || !stemMaterial) {
        alert('Data not found for selected configuration');
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
        const cagePrice = await getCagePrice(currentProduct.seriesNumber, currentProduct.size);
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
      alert('Failed to calculate price');
    } finally {
      setCalculating(false);
    }
  };

  const handleAddProduct = () => {
    setShowProductForm(true);
    setEditingProductIndex(null);
    setCurrentProduct({ quantity: 1, hasCage: false });
    setAvailableSizes([]);
    setAvailableRatings([]);
    setAvailableEndConnectTypes([]);
    setAvailableBonnetTypes([]);
    setAvailablePlugTypes([]);
    setAvailableSeatTypes([]);
    setAvailableStemTypes([]);
  };

  const handleEditProduct = (index: number) => {
    const product = products[index];
    setShowProductForm(true);
    setEditingProductIndex(index);
    setCurrentProduct(product);
    
    // Fetch options for the current product
    if (product.seriesNumber) {
      fetchAvailableSizes(product.seriesNumber);
      if (product.size) {
        fetchAvailableRatings(product.seriesNumber, product.size);
        if (product.rating) {
          fetchDependentOptions(product.seriesNumber, product.size, product.rating);
        }
      }
    }
  };

  const handleSaveProduct = () => {
    if (!currentProduct.productTotalCost) {
      alert('Please calculate the price first');
      return;
    }

    const { id: _, ...productData } = currentProduct;
    const product: QuoteProduct = {
      ...(productData as Omit<Required<QuoteProduct>, 'id'>),
      id: editingProductIndex !== null ? products[editingProductIndex].id : `product-${Date.now()}`,
    };

    if (editingProductIndex !== null) {
      const updatedProducts = [...products];
      updatedProducts[editingProductIndex] = product;
      setProducts(updatedProducts);
    } else {
      setProducts([...products, product]);
    }

    setShowProductForm(false);
    setCurrentProduct({ quantity: 1, hasCage: false });
    setEditingProductIndex(null);
  };

  const handleCancelProduct = () => {
    setShowProductForm(false);
    setCurrentProduct({ quantity: 1, hasCage: false });
    setEditingProductIndex(null);
    setAvailableSizes([]);
    setAvailableRatings([]);
  };

  const handleRemoveProduct = (index: number) => {
    if (confirm('Are you sure you want to remove this product?')) {
      setProducts(products.filter((_, i) => i !== index));
    }
  };

  const handleSaveQuote = async () => {
    if (!quote || products.length === 0) {
      alert('Please add at least one product');
      return;
    }

    setSaving(true);

    try {
      const totals = calculateQuoteTotals(products, discount, tax);

      const quoteRef = doc(db, 'quotes', quote.id);
      await updateDoc(quoteRef, {
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
        subtotal: totals.subtotal,
        discount,
        discountAmount: totals.discountAmount,
        tax,
        taxAmount: totals.taxAmount,
        total: totals.total,
        status,
        notes,
        updatedAt: Timestamp.now(),
      });

      alert('Quote updated successfully!');
      router.push(`/employee/quotes/${quote.id}`);
    } catch (error: any) {
      console.error('Error updating quote:', error);
      alert('Failed to update quote: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const totals = products.length > 0 
    ? calculateQuoteTotals(products, discount, tax)
    : { subtotal: 0, discountAmount: 0, taxableAmount: 0, taxAmount: 0, total: 0 };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Quote not found</p>
        <Link href="/employee" className="text-green-600 hover:underline mt-4 inline-block">
          Back to Quotes
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Link href={`/employee/quotes/${quote.id}`} className="text-green-600 hover:underline text-sm mb-4 inline-block">
          ← Back to Quote
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Quote - {quote.quoteNumber}</h1>
        <p className="text-gray-600">Customer: {quote.customerName}</p>
      </div>

      {/* Products Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Products ({products.length})</h2>
          {!showProductForm && (
            <button
              onClick={handleAddProduct}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </button>
          )}
        </div>

        {/* Product Form */}
        {showProductForm && (
          <div className="border-2 border-green-200 rounded-lg p-6 mb-6 bg-green-50">
            <h3 className="text-lg font-semibold mb-4">
              {editingProductIndex !== null ? 'Edit Product' : 'Add New Product'}
            </h3>

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

            {/* Component Configuration */}
            {currentProduct.size && currentProduct.rating && (
              <>
                <h4 className="font-semibold mb-4">Component Configuration</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Body */}
                  <div className="border rounded-lg p-4">
                    <h5 className="font-semibold mb-3">Body</h5>
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
                    <h5 className="font-semibold mb-3">Bonnet</h5>
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
                    <h5 className="font-semibold mb-3">Plug</h5>
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
                    <h5 className="font-semibold mb-3">Seat</h5>
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
                    <h5 className="font-semibold mb-3">Stem</h5>
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
                    <h5 className="font-semibold mb-3">Quantity</h5>
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
                onClick={handleCancelProduct}
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
                  onClick={handleSaveProduct}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {editingProductIndex !== null ? 'Update Product' : `Add Product (₹${currentProduct.lineTotal?.toLocaleString('en-IN')})`}
                </button>
              )}
            </div>

            {/* Price Breakdown */}
            {currentProduct.productTotalCost && (
              <div className="mt-6 p-4 bg-white rounded-lg">
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
        {!showProductForm && products.length > 0 && (
          <div className="space-y-2">
            {products.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-4 border-2 rounded-lg hover:border-green-300">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {product.productType} - Series {product.seriesNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    Size: {product.size} | Rating: {product.rating} | Qty: {product.quantity}
                  </p>
                </div>
                <div className="flex items-center space-x-6">
                  <p className="font-bold text-lg text-gray-900">₹{product.lineTotal.toLocaleString('en-IN')}</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditProduct(index)}
                      className="text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-600 rounded hover:bg-blue-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRemoveProduct(index)}
                      className="text-red-600 hover:text-red-800 px-3 py-1 border border-red-600 rounded hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!showProductForm && products.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No products added yet. Click "Add Product" to start.</p>
          </div>
        )}
      </div>

      {/* Quote Details */}
      {!showProductForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Quote Details</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tax (%)</label>
              <input
                type="number"
                min="0"
                value={tax}
                onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Add any notes or special instructions..."
            />
          </div>

          {/* Totals */}
          <div className="border-t pt-6 mb-6">
            <div className="flex justify-end">
              <div className="w-96 space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span className="font-semibold">₹{totals.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount ({discount}%):</span>
                    <span className="font-semibold">-₹{totals.discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>Tax ({tax}%):</span>
                  <span className="font-semibold">₹{totals.taxAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-2xl font-bold text-gray-900 pt-3 border-t-2">
                  <span>Total:</span>
                  <span>₹{totals.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex space-x-4">
            <Link
              href={`/employee/quotes/${quote.id}`}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-center hover:bg-gray-50 font-medium"
            >
              Cancel
            </Link>
            <button
              onClick={handleSaveQuote}
              disabled={saving || products.length === 0}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
            >
              {saving ? 'Saving...' : 'Save Quote'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}