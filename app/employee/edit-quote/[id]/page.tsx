'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/firebase/authContext';
import { getAllCustomers } from '@/lib/firebase/customerService';
import { getAllMaterials, getAllSeries } from '@/lib/firebase/pricingService';
import {
  Customer,
  Material,
  Series,
  Quote,
  QuoteProduct,
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
  const [notes, setNotes] = useState('');
  const [projectName, setProjectName] = useState('');
  const [enquiryId, setEnquiryId] = useState('');
  const [status, setStatus] = useState<'draft' | 'sent' | 'approved' | 'rejected'>('draft');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (params.id) {
      fetchQuote(params.id as string);
    }
  }, [params.id]);

  const fetchInitialData = async () => {
    const [customersData, allMaterials, seriesData] = await Promise.all([
      getAllCustomers(),
      getAllMaterials(),
      getAllSeries(),
    ]);

    setCustomers(customersData);
    setMaterials(allMaterials);
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
          projectName: data.projectName || '',
          enquiryId: data.enquiryId || '',
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
        setProjectName(loadedQuote.projectName || '');
        setEnquiryId(loadedQuote.enquiryId || '');
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

    setSaving(true);

    try {
      const totals = calculateQuoteTotals(products, discount, tax);

      const quoteRef = doc(db, 'quotes', quote.id);
      await updateDoc(quoteRef, {
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
        projectName: projectName || '',
        enquiryId: enquiryId || '',
        notes: notes || '',
        updatedAt: Timestamp.now(),
      });

      alert('Quote updated successfully!');
      router.push('/employee');
    } catch (error: any) {
      console.error('Save error:', error);
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
          />
        </div>
      )}

      {/* Quote Details Form */}
      {!showProductForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Quote Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Totals */}
          <div className="border-t-4 border-gray-300 pt-6">
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