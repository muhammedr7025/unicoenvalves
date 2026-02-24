'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  getProductsFromSubcollection,
  updateProductsInSubcollection
} from '@/lib/firebase/productService';
import { useAuth } from '@/lib/firebase/authContext';
import { getAllCustomers } from '@/lib/firebase/customerService';
import { getAllMaterials, getAllSeries } from '@/lib/firebase/pricingService';
import { getExchangeRate } from '@/lib/firebase/marginService';
import {
  Customer,
  Material,
  Series,
  Quote,
  QuoteProduct,
  ValidityPeriod,
  PricingType,
  CustomPricingCharge,
  QuotePricingMode,
} from '@/types';
import { calculateQuoteTotals } from '@/utils/priceCalculator';
import ProductList from '@/components/quotes/ProductList';
import ProductConfigurationForm from '@/components/quotes/ProductConfigurationForm';
import QuoteSummary from '@/components/quotes/QuoteSummary';

export default function EditQuotePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [products, setProducts] = useState<QuoteProduct[]>([]);

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);

  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(18);
  const [packagePrice, setPackagePrice] = useState(0);
  const [notes, setNotes] = useState('');
  const [projectName, setProjectName] = useState('');
  const [enquiryId, setEnquiryId] = useState('');
  const [status, setStatus] = useState<'draft' | 'sent' | 'approved' | 'rejected'>('draft');

  // NEW: Additional quote settings
  const [customQuoteNumber, setCustomQuoteNumber] = useState('');
  const [validity, setValidity] = useState<ValidityPeriod>('30 days');
  const [warrantyShipment, setWarrantyShipment] = useState(12);
  const [warrantyInstallation, setWarrantyInstallation] = useState(12);
  const [deliveryDays, setDeliveryDays] = useState('');
  const [advancePercentage, setAdvancePercentage] = useState(30);
  const [approvalPercentage, setApprovalPercentage] = useState(0);
  const [beforeDespatchPercentage, setBeforeDespatchPercentage] = useState(70);
  const [customPaymentTerms, setCustomPaymentTerms] = useState('');
  const [currencyExchangeRate, setCurrencyExchangeRate] = useState<number | null>(null);
  const [pricingType, setPricingType] = useState<PricingType>('Ex-Works');
  const [freightPrice, setFreightPrice] = useState(0);
  const [pricingMode, setPricingMode] = useState<QuotePricingMode>('standard');

  // Agent/Dealer Commission (editable per-quote)
  const [agentCommission, setAgentCommission] = useState(0);

  // Custom pricing charges (for Custom pricing type, up to 3 items)
  const [customPricingCharges, setCustomPricingCharges] = useState<CustomPricingCharge[]>([]);
  const [customPricingLabel, setCustomPricingLabel] = useState('');


  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (params.id) {
      fetchQuote(params.id as string);
    }
  }, [params.id]);

  const fetchInitialData = async () => {
    const [customersData, allMaterials, seriesData, adminExchangeRate] = await Promise.all([
      getAllCustomers(),
      getAllMaterials(),
      getAllSeries(),
      getExchangeRate(),
    ]);

    setCustomers(customersData);
    setMaterials(allMaterials);
    setSeries(seriesData.filter(s => s.isActive));
    if (adminExchangeRate) {
      setCurrencyExchangeRate(adminExchangeRate);
    }
  };

  const fetchQuote = async (quoteId: string) => {
    setLoading(true);
    try {
      const quoteRef = doc(db, 'quotes', quoteId);
      const quoteDoc = await getDoc(quoteRef);

      if (quoteDoc.exists()) {
        const data = quoteDoc.data();

        // Try to load products from subcollection first
        let loadedProducts: QuoteProduct[] = [];
        try {
          loadedProducts = await getProductsFromSubcollection(quoteId);
        } catch (e) {
          console.log('No products subcollection, checking legacy products array');
        }

        // Fallback to legacy embedded products if subcollection is empty
        if (loadedProducts.length === 0 && data.products && data.products.length > 0) {
          console.log('Using legacy embedded products array');
          loadedProducts = data.products;
        }

        const loadedQuote = {
          id: quoteDoc.id,
          quoteNumber: data.quoteNumber,
          customQuoteNumber: data.customQuoteNumber || '',
          customerId: data.customerId,
          customerName: data.customerName,
          projectName: data.projectName || '',
          enquiryId: data.enquiryId || '',
          validity: data.validity || '30 days',
          warrantyTerms: data.warrantyTerms || { shipmentDays: 12, installationDays: 12 },
          deliveryDays: data.deliveryDays || '',
          paymentTerms: data.paymentTerms || { advancePercentage: 30, approvalPercentage: 0, beforeDespatchPercentage: 70, customTerms: '' },
          currencyExchangeRate: data.currencyExchangeRate || null,
          pricingType: data.pricingType || 'Ex-Works',
          products: loadedProducts, // Use products from subcollection or legacy
          subtotal: data.subtotal ?? 0,
          discount: data.discount ?? 0,
          discountAmount: data.discountAmount ?? 0,
          tax: data.tax ?? 18,
          taxAmount: data.taxAmount ?? 0,
          total: data.total ?? 0,
          packagePrice: data.packagePrice ?? 0,
          freightPrice: data.freightPrice ?? 0,
          status: data.status || 'draft',
          createdBy: data.createdBy,
          createdByName: data.createdByName,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          notes: data.notes || '',
          isArchived: data.isArchived || false,
        } as Quote;


        setQuote(loadedQuote);
        setProducts(loadedProducts);
        setDiscount(loadedQuote.discount ?? 0);
        setTax(loadedQuote.tax ?? 18);
        setPackagePrice(loadedQuote.packagePrice ?? 0);
        setNotes(loadedQuote.notes || '');
        setProjectName(loadedQuote.projectName || '');
        setEnquiryId(loadedQuote.enquiryId || '');
        setStatus(loadedQuote.status);

        // NEW: Load additional quote settings
        setCustomQuoteNumber(loadedQuote.customQuoteNumber || '');
        setValidity(loadedQuote.validity || '30 days');
        setWarrantyShipment(loadedQuote.warrantyTerms?.shipmentDays ?? 12);
        setWarrantyInstallation(loadedQuote.warrantyTerms?.installationDays ?? 12);
        setDeliveryDays(loadedQuote.deliveryDays || '');
        setAdvancePercentage(loadedQuote.paymentTerms?.advancePercentage ?? 30);
        setApprovalPercentage(loadedQuote.paymentTerms?.approvalPercentage ?? 0);
        setBeforeDespatchPercentage(loadedQuote.paymentTerms?.beforeDespatchPercentage ?? 70);
        setCustomPaymentTerms(loadedQuote.paymentTerms?.customTerms || '');
        setCurrencyExchangeRate(loadedQuote.currencyExchangeRate ?? null);
        setPricingType(loadedQuote.pricingType || 'Ex-Works');
        setFreightPrice(loadedQuote.freightPrice ?? 0);
        setPricingMode((data.pricingMode as QuotePricingMode) || 'standard');
        setAgentCommission(data.agentCommission ?? 0);
        setCustomPricingCharges(data.customPricingCharges || []);
        setCustomPricingLabel(data.customPricingLabel || '');
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

  const handleAddProduct = () => {
    setEditingProductIndex(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (index: number) => {
    setEditingProductIndex(index);
    setShowProductForm(true);
  };

  const handleRemoveProduct = (index: number) => {
    if (confirm('Are you sure you want to remove this product?')) {
      setProducts(products.filter((_, i) => i !== index));
    }
  };

  const handleSaveProduct = (product: QuoteProduct) => {
    if (editingProductIndex !== null) {
      const updatedProducts = [...products];
      updatedProducts[editingProductIndex] = product;
      setProducts(updatedProducts);
    } else {
      setProducts([...products, product]);
    }
    setShowProductForm(false);
    setEditingProductIndex(null);
  };

  const handleSaveQuote = async () => {
    if (!quote || products.length === 0) {
      alert('Please add at least one product');
      return;
    }

    if (pricingType === 'F.O.R.' && (!freightPrice || freightPrice <= 0)) {
      alert('⚠️ Freight price is required for F.O.R. pricing and must be greater than 0.');
      return;
    }

    if (!customPaymentTerms.trim() && (advancePercentage + approvalPercentage + beforeDespatchPercentage) > 100) {
      alert('⚠️ Payment terms total exceeds 100%. Please adjust the values before saving.');
      return;
    }

    setSaving(true);

    try {
      // Calculate totals - discount applies only to product subtotal (not package/freight)
      const baseTotals = calculateQuoteTotals(products, discount, tax);
      const productSubtotal = baseTotals.subtotal;
      const discountAmount = (productSubtotal * discount) / 100;
      const discountedProductTotal = productSubtotal - discountAmount;
      // Additional charges based on pricing type
      const freightToIncludeCalc = pricingType === 'F.O.R.' ? freightPrice : 0;
      const customChargesToInclude = pricingType === 'Custom' ? customPricingCharges.reduce((sum, c) => sum + (c.price || 0), 0) : 0;
      const subtotalWithPackageAndFreight = discountedProductTotal + packagePrice + freightToIncludeCalc + customChargesToInclude;
      const taxAmountWithPackageAndFreight = (subtotalWithPackageAndFreight * tax) / 100;
      const totalWithPackageAndFreight = subtotalWithPackageAndFreight + taxAmountWithPackageAndFreight;

      const quoteRef = doc(db, 'quotes', quote.id);

      // Update quote document WITHOUT products (products in subcollection)
      await updateDoc(quoteRef, {
        quoteNumber: customQuoteNumber || quote.quoteNumber, // Use custom if provided
        customQuoteNumber: customQuoteNumber || null,
        // Products stored in subcollection - only keep count here
        productCount: products.length,
        subtotal: subtotalWithPackageAndFreight,
        discount,
        discountAmount: discountAmount,
        tax,
        taxAmount: taxAmountWithPackageAndFreight,
        total: totalWithPackageAndFreight,
        packagePrice: packagePrice,
        status,
        projectName: projectName || '',
        enquiryId: enquiryId || '',
        notes: notes || '',
        // NEW: Additional quote settings for PDF generation
        validity: validity,
        warrantyTerms: {
          shipmentDays: warrantyShipment,
          installationDays: warrantyInstallation,
        },
        deliveryDays: deliveryDays || null,
        paymentTerms: {
          advancePercentage: advancePercentage,
          approvalPercentage: approvalPercentage,
          beforeDespatchPercentage: beforeDespatchPercentage,
          customTerms: customPaymentTerms || null,
        },
        currencyExchangeRate: currencyExchangeRate || null,
        pricingType: pricingType,
        freightPrice: pricingType === 'F.O.R.' ? freightPrice : null,
        customPricingCharges: pricingType === 'Custom' ? customPricingCharges : [],
        customPricingLabel: pricingType === 'Custom' ? customPricingLabel : null,
        pricingMode: pricingMode,
        agentCommission: agentCommission || 0,
        updatedAt: Timestamp.now(),

      });

      // Update products in subcollection (supports 400+ products)
      await updateProductsInSubcollection(quote.id, products);

      alert('Quote updated successfully!');
      router.push('/employee');
    } catch (error: any) {
      console.error('Save error:', error);
      alert('Failed to update quote: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Calculate totals including package price and freight (for F.O.R.) for display
  const baseTotals = products.length > 0
    ? calculateQuoteTotals(products, discount, tax)
    : { subtotal: 0, discountAmount: 0, taxableAmount: 0, taxAmount: 0, total: 0 };

  // Discount applies only to product subtotal (not package price or freight)
  // Freight is included in total only for F.O.R. pricing
  const productSubtotalForDisplay = baseTotals.subtotal;
  const displayDiscountAmount = (productSubtotalForDisplay * discount) / 100;
  const discountedProductTotal = productSubtotalForDisplay - displayDiscountAmount;
  const freightToInclude = pricingType === 'F.O.R.' ? freightPrice : 0;
  const displayCustomCharges = pricingType === 'Custom' ? customPricingCharges.reduce((sum, c) => sum + (c.price || 0), 0) : 0;
  const displaySubtotal = discountedProductTotal + packagePrice + freightToInclude + displayCustomCharges;
  const displayTaxAmount = (displaySubtotal * tax) / 100;
  const displayTotal = displaySubtotal + displayTaxAmount;



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
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Quote</h1>
            <p className="text-gray-600 mt-1">{quote.quoteNumber}</p>
          </div>
          <button
            onClick={() => router.push('/employee')}
            className="text-blue-600 hover:underline"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-900">
          <strong>Customer:</strong> {quote.customerName}
        </p>
      </div>

      {/* Products List */}
      {!showProductForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Products ({products.length})</h2>
            <button
              onClick={handleAddProduct}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              + Add Product
            </button>
          </div>

          <ProductList
            products={products}
            onEdit={handleEditProduct}
            onRemove={handleRemoveProduct}
          />
        </div>
      )}

      {/* Product Configuration Form */}
      {showProductForm && (
        <div className="mb-6">
          <ProductConfigurationForm
            initialProduct={editingProductIndex !== null ? products[editingProductIndex] : undefined}
            series={series}
            materials={materials}
            onSave={handleSaveProduct}
            onCancel={() => {
              setShowProductForm(false);
              setEditingProductIndex(null);
            }}
            pricingMode={pricingMode}
            dealerMarginPercentage={agentCommission || (() => {
              const customer = customers.find(c => c.id === quote?.customerId);
              return customer?.dealerMarginPercentage;
            })()}
            isAdmin={user?.role === 'admin'}
          />
        </div>
      )}

      {/* Quote Details Form */}
      {!showProductForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Quote Details</h2>

          {/* Basic Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Custom Quote Number */}
            <div>
              <label className="block text-sm font-medium mb-2">📝 Custom Quote Number</label>
              <input
                type="text"
                value={customQuoteNumber}
                onChange={(e) => setCustomQuoteNumber(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg border-blue-300 focus:ring-blue-500 focus:border-blue-500"
                placeholder={quote?.quoteNumber || 'Leave blank for auto-generate'}
              />
              <p className="text-xs text-gray-500 mt-1">Current: {quote?.quoteNumber}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Project Name</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., Refinery Expansion Project"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Enquiry ID/Ref</label>
              <input
                type="text"
                value={enquiryId}
                onChange={(e) => setEnquiryId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., RFQ-2023-001"
              />
            </div>

            {/* Pricing Mode */}
            <div>
              <label className="block text-sm font-medium mb-2">📊 Pricing Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPricingMode('standard')}
                  className={`p-2 rounded-lg border-2 text-center text-sm font-medium transition-all ${pricingMode === 'standard'
                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300'
                    }`}
                >
                  📦 Standard
                </button>
                <button
                  type="button"
                  onClick={() => setPricingMode('project')}
                  className={`p-2 rounded-lg border-2 text-center text-sm font-medium transition-all ${pricingMode === 'project'
                    ? 'border-purple-500 bg-purple-50 text-purple-800'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300'
                    }`}
                >
                  🏗️ Project
                </button>
              </div>
            </div>

            {/* Validity Period Dropdown */}
            <div>
              <label className="block text-sm font-medium mb-2">📅 Validity Period</label>
              <select
                value={validity}
                onChange={(e) => setValidity(e.target.value as ValidityPeriod)}
                className="w-full px-3 py-2 border rounded-lg border-purple-300 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="15 days">15 Days</option>
                <option value="30 days">30 Days</option>
                <option value="45 days">45 Days</option>
                <option value="50 days">50 Days</option>
                <option value="60 days">60 Days</option>
                <option value="90 days">90 Days</option>
              </select>
            </div>

            {/* Pricing Type Dropdown */}
            <div>
              <label className="block text-sm font-medium mb-2">💰 Pricing Type</label>
              <select
                value={pricingType}
                onChange={(e) => {
                  const newType = e.target.value as PricingType;
                  setPricingType(newType);
                  if (newType === 'Ex-Works') {
                    setFreightPrice(0);
                    setCustomPricingCharges([]);
                  } else if (newType === 'F.O.R.') {
                    setCustomPricingCharges([]);
                  } else if (newType === 'Custom') {
                    setFreightPrice(0);
                    if (customPricingCharges.length === 0) {
                      setCustomPricingCharges([{ title: '', price: 0 }]);
                    }
                  }
                }}
                className="w-full px-3 py-2 border rounded-lg border-green-300 focus:ring-green-500 focus:border-green-500"
              >
                <option value="Ex-Works">Ex-Works</option>
                <option value="F.O.R.">F.O.R.</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
            {/* Custom Pricing Label - shown for Custom pricing type */}
            {pricingType === 'Custom' && (
              <div>
                <label className="block text-sm font-medium mb-2">🏷️ Custom Pricing Label</label>
                <input
                  type="text"
                  value={customPricingLabel}
                  onChange={(e) => setCustomPricingLabel(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg border-violet-300 focus:ring-violet-500 focus:border-violet-500"
                  placeholder="e.g., C.I.F., F.O.B., DDP"
                />
              </div>
            )}

            {/* Delivery Days */}
            <div>
              <label className="block text-sm font-medium mb-2">🚚 Delivery Timeline (Weeks)</label>
              <input
                type="number"
                min="1"
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg border-teal-300 focus:ring-teal-500 focus:border-teal-500"
                placeholder="e.g., 4"
              />
            </div>

            {/* Agent/Dealer Commission */}
            <div>
              <label className="block text-sm font-medium mb-2">🤝 Agent Commission (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={agentCommission || ''}
                onChange={(e) => setAgentCommission(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded-lg border-amber-300 focus:ring-amber-500 focus:border-amber-500"
                placeholder="0"
              />
            </div>

          </div>


          {/* Warranty Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6">
            <h3 className="text-md font-bold text-blue-800 mb-3">🛡️ Warranty Terms (Months)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">From Despatch</label>
                <input
                  type="number"
                  min="0"
                  value={warrantyShipment || ''}
                  onChange={(e) => setWarrantyShipment(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-lg border-blue-300 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">From Installation</label>
                <input
                  type="number"
                  min="0"
                  value={warrantyInstallation || ''}
                  onChange={(e) => setWarrantyInstallation(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-lg border-blue-300 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 12"
                />
              </div>
            </div>
          </div>

          {/* Payment Terms Section */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6">
            <h3 className="text-md font-bold text-green-800 mb-3">💳 Payment Terms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Advance against PO (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={advancePercentage || ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    const max = 100 - approvalPercentage - beforeDespatchPercentage;
                    setAdvancePercentage(Math.min(Math.max(val, 0), Math.max(max, 0)));
                  }}
                  disabled={!!customPaymentTerms.trim()}
                  className={`w-full px-3 py-2 border rounded-lg border-green-300 focus:ring-green-500 focus:border-green-500 ${customPaymentTerms.trim() ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Advance against approval (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={approvalPercentage || ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    const max = 100 - advancePercentage - beforeDespatchPercentage;
                    setApprovalPercentage(Math.min(Math.max(val, 0), Math.max(max, 0)));
                  }}
                  disabled={!!customPaymentTerms.trim()}
                  className={`w-full px-3 py-2 border rounded-lg border-green-300 focus:ring-green-500 focus:border-green-500 ${customPaymentTerms.trim() ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Before despatch (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={beforeDespatchPercentage || ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    const max = 100 - advancePercentage - approvalPercentage;
                    setBeforeDespatchPercentage(Math.min(Math.max(val, 0), Math.max(max, 0)));
                  }}
                  disabled={!!customPaymentTerms.trim()}
                  className={`w-full px-3 py-2 border rounded-lg border-green-300 focus:ring-green-500 focus:border-green-500 ${customPaymentTerms.trim() ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Custom Terms (Overrides %)</label>
                <input
                  type="text"
                  value={customPaymentTerms}
                  onChange={(e) => setCustomPaymentTerms(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg border-green-300 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., Net 30"
                />
              </div>
            </div>
            {!customPaymentTerms.trim() && (
              <p className="text-xs text-green-600 mt-2">
                Total: {advancePercentage + approvalPercentage + beforeDespatchPercentage}%
                {advancePercentage + approvalPercentage + beforeDespatchPercentage !== 100 && (
                  <span className={`ml-2 ${advancePercentage + approvalPercentage + beforeDespatchPercentage > 100 ? 'text-red-600' : 'text-amber-600'}`}>
                    ⚠️ {advancePercentage + approvalPercentage + beforeDespatchPercentage > 100 ? 'Exceeds 100%' : `${100 - advancePercentage - approvalPercentage - beforeDespatchPercentage}% unallocated`}
                  </span>
                )}
              </p>
            )}
            {customPaymentTerms.trim() && (
              <p className="text-xs text-blue-600 mt-2">
                📋 Using custom terms: <strong>{customPaymentTerms.trim()}</strong>
              </p>
            )}
          </div>


          {/* International Customer - Exchange Rate (admin-set, read-only) */}
          {(() => {
            const customer = customers.find(c => c.id === quote?.customerId);
            const isInternational = customer && customer.country !== 'India';
            if (!isInternational) return null;
            return (
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 mb-6">
                <h3 className="text-md font-bold text-amber-800 mb-3">💱 International Customer — USD Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-amber-700 mb-2">Exchange Rate (1 USD = ₹)</label>
                    <div className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg bg-amber-100 text-amber-900 text-lg font-bold">
                      {currencyExchangeRate ? `₹${currencyExchangeRate}` : 'Not set'}
                    </div>
                    <p className="text-xs text-amber-600 mt-1">⚙️ Set by admin in Settings. Contact admin to change.</p>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-white rounded-lg p-3 border border-amber-200 w-full">
                      <p className="text-sm text-amber-700">
                        <strong>Country:</strong> {customer?.country}
                      </p>
                      <p className="text-sm text-amber-600">
                        All prices will be shown in <strong>USD ($)</strong> on the quote
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Pricing & Tax Section */}
          <div className={`grid grid-cols-1 md:grid-cols-2 ${pricingType === 'F.O.R.' ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-6 mb-6`}>
            <div>
              <label className="block text-sm font-medium mb-2">Discount (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={discount || ''}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tax/GST (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={tax || ''}
                onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">📦 Packing Price (₹)</label>
              <input
                type="number"
                min="0"
                value={packagePrice || ''}
                onChange={(e) => setPackagePrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded-lg border-orange-300 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter packaging cost"
              />
            </div>
            {/* Freight Price - only shown for F.O.R. pricing */}
            {pricingType === 'F.O.R.' && (
              <div>
                <label className="block text-sm font-medium mb-2">🚛 Freight Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={freightPrice || ''}
                  onChange={(e) => setFreightPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-lg border-cyan-300 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="Enter freight charges"
                />
              </div>
            )}
            {/* Custom Pricing Charges - shown for Custom pricing type */}
            {pricingType === 'Custom' && (
              <div className="md:col-span-3">
                <label className="block text-sm font-medium mb-2">📋 Custom Charges</label>
                <div className="space-y-2">
                  {customPricingCharges.map((charge, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={charge.title}
                        onChange={(e) => {
                          const updated = [...customPricingCharges];
                          updated[idx] = { ...updated[idx], title: e.target.value };
                          setCustomPricingCharges(updated);
                        }}
                        className="flex-1 px-3 py-2 border rounded-lg border-violet-300 focus:ring-violet-500 focus:border-violet-500"
                        placeholder={`Charge ${idx + 1} title (e.g., Freight, Insurance)`}
                      />
                      <input
                        type="number"
                        min="0"
                        value={charge.price || ''}
                        onChange={(e) => {
                          const updated = [...customPricingCharges];
                          updated[idx] = { ...updated[idx], price: parseFloat(e.target.value) || 0 };
                          setCustomPricingCharges(updated);
                        }}
                        className="w-40 px-3 py-2 border rounded-lg border-violet-300 focus:ring-violet-500 focus:border-violet-500"
                        placeholder="₹ Price"
                      />
                      <button
                        type="button"
                        onClick={() => setCustomPricingCharges(customPricingCharges.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:text-red-700 px-2 py-1"
                      >✕</button>
                    </div>
                  ))}
                  {customPricingCharges.length < 3 && (
                    <button
                      type="button"
                      onClick={() => setCustomPricingCharges([...customPricingCharges, { title: '', price: 0 }])}
                      className="text-sm text-violet-600 hover:text-violet-800 font-medium"
                    >+ Add Charge</button>
                  )}
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="draft">Draft</option>
                <option value="sent">Submitted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>


          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg h-24"
              placeholder="Additional terms, delivery details, etc."
            />
          </div>

          {/* Totals */}
          <div className="border-t-4 border-gray-300 pt-6">
            <QuoteSummary
              subtotal={displaySubtotal}
              productsSubtotal={baseTotals.subtotal}
              discount={discount}
              discountAmount={displayDiscountAmount}
              tax={tax}
              taxAmount={displayTaxAmount}
              total={displayTotal}
              packagePrice={packagePrice}
              freightPrice={freightPrice}
              pricingType={pricingType}
              customPricingCharges={customPricingCharges}
            />


          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!showProductForm && (
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => router.push('/employee')}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveQuote}
            disabled={saving}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-bold disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Update Quote'}
          </button>
        </div>
      )}
    </div>
  );
}