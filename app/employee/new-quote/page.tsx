'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/authContext';
import { getAllCustomers } from '@/lib/firebase/customerService';
import { getMaterialsByGroup, getAllSeries } from '@/lib/firebase/pricingService';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  Customer,
  Material,
  Series,
  QuoteProduct,
} from '@/types';
import { calculateQuoteTotals } from '@/utils/priceCalculator';
import ProductList from '@/components/quotes/ProductList';
import ProductConfigurationForm from '@/components/quotes/ProductConfigurationForm';
import QuoteSummary from '@/components/quotes/QuoteSummary';

export default function NewQuotePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [materials, setMaterials] = useState<Material[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [products, setProducts] = useState<QuoteProduct[]>([]);

  const [showProductConfig, setShowProductConfig] = useState(false);
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);

  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(18);
  const [notes, setNotes] = useState('');
  const [projectName, setProjectName] = useState('');
  const [enquiryId, setEnquiryId] = useState('');
  const [status, setStatus] = useState<'draft' | 'sent'>('draft');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    const [
      customersData,
      bodyBonnetMats,
      plugMats,
      seatMats,
      stemMats,
      cageMats,
      seriesData,
    ] = await Promise.all([
      getAllCustomers(),
      getMaterialsByGroup('BodyBonnet'),
      getMaterialsByGroup('Plug'),
      getMaterialsByGroup('Seat'),
      getMaterialsByGroup('Stem'),
      getMaterialsByGroup('Cage'),
      getAllSeries(),
    ]);

    setCustomers(customersData);
    setMaterials([
      ...bodyBonnetMats,
      ...plugMats,
      ...seatMats,
      ...stemMats,
      ...cageMats,
    ]);
    setSeries(seriesData.filter(s => s.isActive));
    setLoading(false);
  };

  const handleAddProduct = () => {
    setEditingProductIndex(null);
    setShowProductConfig(true);
  };

  const handleEditProduct = (index: number) => {
    setEditingProductIndex(index);
    setShowProductConfig(true);
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
    setShowProductConfig(false);
    setEditingProductIndex(null);
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
          ...p,
          // Ensure undefined values are null for Firestore
          productTag: p.productTag || null,
          cageMaterialId: p.cageMaterialId || null,
          cageWeight: p.cageWeight || null,
          cageMaterialPrice: p.cageMaterialPrice || null,
          cageTotalCost: p.cageTotalCost || null,
          sealType: p.sealType || null,
          sealRingFixedPrice: p.sealRingFixedPrice || null,
          sealRingTotalCost: p.sealRingTotalCost || null,
          actuatorType: p.actuatorType || null,
          actuatorSeries: p.actuatorSeries || null,
          actuatorModel: p.actuatorModel || null,
          actuatorStandard: p.actuatorStandard || null,
          actuatorFixedPrice: p.actuatorFixedPrice || null,
          handwheelType: p.handwheelType || null,
          handwheelSeries: p.handwheelSeries || null,
          handwheelModel: p.handwheelModel || null,
          handwheelStandard: p.handwheelStandard || null,
          handwheelFixedPrice: p.handwheelFixedPrice || null,
          actuatorSubAssemblyTotal: p.actuatorSubAssemblyTotal || 0,
          tubingAndFitting: p.tubingAndFitting || [],
          tubingAndFittingTotal: p.tubingAndFittingTotal || 0,
          testing: p.testing || [],
          testingTotal: p.testingTotal || 0,
          accessories: p.accessories || [],
          accessoriesTotal: p.accessoriesTotal || 0,
        })),
        subtotal: totals.subtotal,
        discount,
        discountAmount: totals.discountAmount,
        tax,
        taxAmount: totals.taxAmount,
        total: totals.total,
        status,
        createdBy: user.id,
        createdByName: user.name,
        projectName: projectName || '',
        enquiryId: enquiryId || '',
        notes: notes || '',
        isArchived: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      alert('Quote created successfully!');
      router.push('/employee');
    } catch (error: any) {
      console.error('Save error:', error);
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
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= step ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
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
                className={`p-4 border-2 rounded-lg cursor-pointer hover:border-green-500 transition-colors ${selectedCustomer?.id === customer.id ? 'border-green-600 bg-green-50' : 'border-gray-200'
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

          {/* Product List */}
          {!showProductConfig && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Products ({products.length})</h2>
                <button
                  onClick={handleAddProduct}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Product
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
          {showProductConfig && (
            <ProductConfigurationForm
              initialProduct={editingProductIndex !== null ? products[editingProductIndex] : undefined}
              series={series}
              materials={materials}
              onSave={handleSaveProduct}
              onCancel={() => {
                setShowProductConfig(false);
                setEditingProductIndex(null);
              }}
            />
          )}

          {/* Navigation Buttons */}
          {!showProductConfig && products.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={() => setCurrentStep(3)}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-bold"
              >
                Next: Review & Save
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Review & Save */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Review Quote</h2>

            {/* Quote Details Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
              <div>
                <label className="block text-sm font-medium mb-2">Discount (%)</label>
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
                <label className="block text-sm font-medium mb-2">Tax/GST (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={tax}
                  onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg h-24"
                  placeholder="Additional terms, delivery details, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'draft' | 'sent')}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                </select>
              </div>
            </div>

            {/* Products Summary */}
            <h3 className="text-lg font-bold mb-4">Products</h3>
            <ProductList
              products={products}
              readOnly={true}
            />

            {/* Totals */}
            <div className="border-t-4 border-gray-300 pt-6 mt-6">
              <QuoteSummary
                subtotal={totals.subtotal}
                discount={discount}
                discountAmount={totals.discountAmount}
                tax={tax}
                taxAmount={totals.taxAmount}
                total={totals.total}
              />
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(2)}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
            >
              Back
            </button>
            <button
              onClick={handleSaveQuote}
              disabled={loading}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-bold disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Create Quote'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}