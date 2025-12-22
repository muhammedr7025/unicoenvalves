'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Quote } from '@/types';
import { formatDate } from '@/utils/dateFormat';
import Link from 'next/link';
import { exportQuoteToExcel } from '@/utils/excelExport';
import { getAllMaterials } from '@/lib/firebase/pricingService';
import { generateOfferCoverLetter, generatePriceSummary, generateMergedPDF } from '@/utils/pdfGenerators';
import { Material } from '@/types';
export default function ViewQuotePage() {
  const params = useParams();
  const router = useRouter();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [customerDetails, setCustomerDetails] = useState<any>(null);
  useEffect(() => {
    if (params.id) {
      fetchQuote(params.id as string);
    }
  }, [params.id]);

  const fetchQuote = async (quoteId: string) => {
    setLoading(true);
    try {
      const [quoteDoc, materialsData] = await Promise.all([
        getDoc(doc(db, 'quotes', quoteId)),
        getAllMaterials(),
      ]);

      setMaterials(materialsData);

      if (quoteDoc.exists()) {
        const data = quoteDoc.data();

        // Fetch customer details
        if (data.customerId) {
          const customerDoc = await getDoc(doc(db, 'customers', data.customerId));
          if (customerDoc.exists()) {
            setCustomerDetails({
              id: customerDoc.id,
              ...customerDoc.data(),
            });
          }
        }

        setQuote({
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
          packagingPrice: data.packagingPrice || 0,
          total: data.total || 0,
          status: data.status || 'draft',
          createdBy: data.createdBy,
          createdByName: data.createdByName,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          notes: data.notes || '',
          // Commercial Terms
          priceType: data.priceType || 'Ex-Works INR each net',
          validity: data.validity || '30 days from the date of quote',
          delivery: data.delivery || '24 working weeks from the date of advance payment and approved technical documents (whichever comes later)',
          warranty: data.warranty || 'UVPL Standard Warranty - 18 months from shipping or 12 months from installation (on material & workmanship)',
          payment: data.payment || '20% with the order + 30% against drawings + Balance before shipping',
          isArchived: data.isArchived || false,
        } as Quote);
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

  const handlePrintCoverLetter = () => {
    if (!quote || !customerDetails) {
      alert('Quote or customer data not loaded');
      return;
    }
    generateOfferCoverLetter(quote, customerDetails);
  };

  const handlePrintPriceSummary = () => {
    if (!quote || !customerDetails) {
      alert('Quote or customer data not loaded');
      return;
    }
    generatePriceSummary(quote, customerDetails);
  };

  const handlePrintMergedPDF = () => {
    if (!quote || !customerDetails) {
      alert('Quote or customer data not loaded');
      return;
    }
    generateMergedPDF(quote, customerDetails);
  };

  const handleExportToExcel = () => {
    if (!quote) return;

    // Enhance quote with material names
    const enhancedQuote = {
      ...quote,
      products: quote.products.map(product => {
        const bodyBonnetMaterial = materials.find(m => m.id === product.bodyBonnetMaterialId);
        const plugMaterial = materials.find(m => m.id === product.plugMaterialId);
        const seatMaterial = materials.find(m => m.id === product.seatMaterialId);
        const stemMaterial = materials.find(m => m.id === product.stemMaterialId);
        const cageMaterial = materials.find(m => m.id === product.cageMaterialId);

        return {
          ...product,
          bodyMaterialName: bodyBonnetMaterial?.name || 'Unknown',
          plugMaterialName: plugMaterial?.name || 'Unknown',
          seatMaterialName: seatMaterial?.name || 'Unknown',
          stemMaterialName: stemMaterial?.name || 'Unknown',
          cageMaterialName: cageMaterial?.name || '',
        };
      }),
    };

    exportQuoteToExcel(enhancedQuote as any);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'approved': return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

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
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/employee" className="text-green-600 hover:underline text-sm mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <div className="flex items-center space-x-4">
          <span className={`px-4 py-2 rounded-lg font-semibold capitalize border-2 ${getStatusColor(quote.status)}`}>
            {quote.status}
          </span>

          {/* Export to Excel Button */}
          <button
            onClick={handleExportToExcel}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export to Excel</span>
          </button>

          {/* PDF Export Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrintCoverLetter}
              disabled={!customerDetails}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Cover Letter</span>
            </button>

            <button
              onClick={handlePrintPriceSummary}
              disabled={!customerDetails}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>Price Summary</span>
            </button>

            <button
              onClick={handlePrintMergedPDF}
              disabled={!customerDetails}
              className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>Complete PDF</span>
            </button>
          </div>

          <Link
            href={`/employee/edit-quote/${quote.id}`}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Edit Quote
          </Link>
        </div>
      </div>

      {/* Quote Details */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Customer</h3>
            <p className="text-lg font-semibold text-gray-900">{quote.customerName}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Created By</h3>
            <p className="text-lg text-gray-900">{quote.createdByName}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Project Name</h3>
            <p className="text-lg text-gray-900">{quote.projectName || <span className="text-gray-400 italic">Not specified</span>}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Enquiry ID</h3>
            <p className="text-lg text-gray-900">{quote.enquiryId || <span className="text-gray-400 italic">Not specified</span>}</p>
          </div>
        </div>

        {/* Products - Detailed View */}
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Products Details</h3>

        {quote.products.map((product, index) => (
          <div key={product.id} className="mb-8 p-6 border-2 border-gray-200 rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center space-x-3">
                  <h4 className="text-xl font-bold text-gray-900">
                    Product #{index + 1}: {product.productType} - Series {product.seriesNumber}
                  </h4>
                  {product.productTag && (
                    <span className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full font-medium">
                      {product.productTag}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mt-1">
                  Size: {product.size} | Rating: {product.rating} | Quantity: {product.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Line Total</p>
                <p className="text-2xl font-bold text-green-600">₹{product.lineTotal.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700 font-medium">Manufacturing</p>
                <p className="text-lg font-bold text-blue-900">₹{product.manufacturingCost?.toLocaleString('en-IN')}</p>
                {product.manufacturingProfitPercentage && product.manufacturingProfitPercentage > 0 && (
                  <p className="text-xs text-blue-600">+{product.manufacturingProfitPercentage}% profit</p>
                )}
              </div>

              <div className="bg-pink-50 p-3 rounded-lg border border-pink-200">
                <p className="text-xs text-pink-700 font-medium">Boughtout Items</p>
                <p className="text-lg font-bold text-pink-900">₹{product.boughtoutItemCost?.toLocaleString('en-IN')}</p>
                {product.boughtoutProfitPercentage && product.boughtoutProfitPercentage > 0 && (
                  <p className="text-xs text-pink-600">+{product.boughtoutProfitPercentage}% profit</p>
                )}
              </div>

              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-xs text-green-700 font-medium">Unit Cost</p>
                <p className="text-lg font-bold text-green-900">₹{product.unitCost?.toLocaleString('en-IN')}</p>
                <p className="text-xs text-green-600">with profit</p>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <p className="text-xs text-yellow-700 font-medium">Total Profit</p>
                <p className="text-lg font-bold text-yellow-900">
                  ₹{((product.manufacturingProfitAmount || 0) + (product.boughtoutProfitAmount || 0)).toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-yellow-600">on this item</p>
              </div>
            </div>

            {/* Body Sub-Assembly */}
            <div className="bg-blue-50 p-4 rounded-lg mb-4 border-2 border-blue-200">
              <h5 className="font-semibold text-blue-900 mb-3 flex items-center">
                <span className="text-lg mr-2">🔧</span>
                Body Sub-Assembly
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white p-3 rounded border border-blue-200">
                  <p className="text-gray-600 font-medium mb-1">Body</p>
                  <p className="font-semibold">{product.bodyEndConnectType}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Weight: {product.bodyWeight}kg × ₹{product.bodyMaterialPrice}/kg
                  </p>
                  <p className="text-green-700 font-semibold mt-1">₹{product.bodyTotalCost.toFixed(2)}</p>
                </div>
                <div className="bg-white p-3 rounded border border-blue-200">
                  <p className="text-gray-600 font-medium mb-1">Bonnet</p>
                  <p className="font-semibold">{product.bonnetType}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Weight: {product.bonnetWeight}kg × ₹{product.bonnetMaterialPrice}/kg
                  </p>
                  <p className="text-green-700 font-semibold mt-1">₹{product.bonnetTotalCost.toFixed(2)}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    ℹ️ Same material as Body (Group 1)
                  </p>
                </div>
                <div className="bg-white p-3 rounded border border-purple-200">
                  <p className="text-gray-600 font-medium mb-1">Plug</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Weight: {product.plugWeight}kg × ₹{product.plugMaterialPrice}/kg
                  </p>
                  <p className="text-green-700 font-semibold mt-1">₹{product.plugTotalCost.toFixed(2)}</p>
                  <p className="text-xs text-purple-600 mt-1">Material Group 2</p>
                </div>
                <div className="bg-white p-3 rounded border border-pink-200">
                  <p className="text-gray-600 font-medium mb-1">Seat</p>

                  <p className="text-xs text-gray-500 mt-1">
                    Weight: {product.seatWeight}kg × ₹{product.seatMaterialPrice}/kg
                  </p>
                  <p className="text-green-700 font-semibold mt-1">₹{product.seatTotalCost.toFixed(2)}</p>
                  <p className="text-xs text-pink-600 mt-1">Material Group 3</p>
                </div>
                <div className="bg-white p-3 rounded border border-orange-200">
                  <p className="text-gray-600 font-medium mb-1">Stem</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Fixed Price (Series, Size, Rating, Material)
                  </p>
                  <p className="text-green-700 font-semibold mt-1">₹{product.stemTotalCost.toFixed(2)}</p>
                  <p className="text-xs text-orange-600 mt-1">Material Group 4</p>
                </div>
                {product.hasCage && product.cageTotalCost && (
                  <div className="bg-white p-3 rounded border border-green-200">
                    <p className="text-gray-600 font-medium mb-1">Cage</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Weight: {product.cageWeight}kg × ₹{product.cageMaterialPrice}/kg
                    </p>
                    <p className="text-green-700 font-semibold mt-1">₹{product.cageTotalCost.toFixed(2)}</p>
                    <p className="text-xs text-green-600 mt-1">Material Group 5</p>
                  </div>
                )}
                {product.hasSealRing && product.sealRingTotalCost && (
                  <div className="bg-white p-3 rounded border border-indigo-200">
                    <p className="text-gray-600 font-medium mb-1">Seal Ring</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Fixed Price (Plug Type, Size, Rating)
                    </p>
                    <p className="text-green-700 font-semibold mt-1">₹{product.sealRingTotalCost.toFixed(2)}</p>
                  </div>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="font-bold text-blue-900">Body Sub-Assembly Total: ₹{product.bodySubAssemblyTotal.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Actuator Sub-Assembly */}
            {product.hasActuator && product.actuatorSubAssemblyTotal && (
              <div className="bg-purple-50 p-4 rounded-lg mb-4 border-2 border-purple-200">
                <h5 className="font-semibold text-purple-900 mb-3 flex items-center">
                  <span className="text-lg mr-2">⚙️</span>
                  Actuator Sub-Assembly
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white p-3 rounded">
                    <p className="text-gray-600">Type:</p>
                    <p className="font-semibold">{product.actuatorType}</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="text-gray-600">Series:</p>
                    <p className="font-semibold">{product.actuatorSeries}</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="text-gray-600">Model:</p>
                    <p className="font-semibold">{product.actuatorModel}</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="text-gray-600">Configuration:</p>
                    <p className="font-semibold capitalize">{product.actuatorStandard}</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="text-gray-600">Actuator Price:</p>
                    <p className="text-green-700 font-semibold">₹{product.actuatorFixedPrice?.toLocaleString('en-IN')}</p>
                  </div>
                  {product.hasHandwheel && product.handwheelFixedPrice && (
                    <div className="bg-white p-3 rounded">
                      <p className="text-gray-600">Handwheel:</p>
                      <p className="text-green-700 font-semibold">₹{product.handwheelFixedPrice.toLocaleString('en-IN')}</p>
                    </div>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-purple-200">
                  <p className="font-bold text-purple-900">Actuator Sub-Assembly Total: ₹{product.actuatorSubAssemblyTotal.toLocaleString('en-IN')}</p>
                </div>
              </div>
            )}

            {/* Tubing & Fitting */}
            {product.tubingAndFitting && product.tubingAndFitting.length > 0 && (
              <div className="bg-orange-50 p-4 rounded-lg mb-4 border-2 border-orange-200">
                <h5 className="font-semibold text-orange-900 mb-3 flex items-center">
                  <span className="text-lg mr-2">🔧</span>
                  Tubing & Fitting
                </h5>
                <div className="space-y-2 text-sm">
                  {product.tubingAndFitting.map((item) => (
                    <div key={item.id} className="flex justify-between bg-white p-2 rounded">
                      <span>{item.title}</span>
                      <span className="font-semibold text-green-700">₹{item.price.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-orange-200">
                  <p className="font-bold text-orange-900">Tubing & Fitting Total: ₹{product.tubingAndFittingTotal?.toLocaleString('en-IN')}</p>
                </div>
              </div>
            )}

            {/* Machine Cost */}
            {product.machineCost && product.machineCost.length > 0 && (
              <div className="bg-cyan-50 p-4 rounded-lg mb-4 border-2 border-cyan-200">
                <h5 className="font-semibold text-cyan-900 mb-3 flex items-center">
                  <span className="text-lg mr-2">⚙️</span>
                  Machine Cost
                </h5>
                <div className="space-y-2 text-sm">
                  {product.machineCost.map((item) => (
                    <div key={item.id} className="flex justify-between bg-white p-2 rounded">
                      <span>{item.title}</span>
                      <span className="font-semibold text-green-700">₹{item.price.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-cyan-200">
                  <p className="font-bold text-cyan-900">Machine Cost Total: ₹{product.machineCostTotal?.toLocaleString('en-IN')}</p>
                </div>
              </div>
            )}

            {/* Testing */}
            {product.testing && product.testing.length > 0 && (
              <div className="bg-teal-50 p-4 rounded-lg mb-4 border-2 border-teal-200">
                <h5 className="font-semibold text-teal-900 mb-3 flex items-center">
                  <span className="text-lg mr-2">🔬</span>
                  Testing
                </h5>
                <div className="space-y-2 text-sm">
                  {product.testing.map((item) => (
                    <div key={item.id} className="flex justify-between bg-white p-2 rounded">
                      <span>{item.title}</span>
                      <span className="font-semibold text-green-700">₹{item.price.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-teal-200">
                  <p className="font-bold text-teal-900">Testing Total: ₹{product.testingTotal?.toLocaleString('en-IN')}</p>
                </div>
              </div>
            )}

            {/* Accessories */}
            {product.accessories && product.accessories.length > 0 && (
              <div className="bg-pink-50 p-4 rounded-lg mb-4 border-2 border-pink-200">
                <h5 className="font-semibold text-pink-900 mb-3 flex items-center">
                  <span className="text-lg mr-2">🎯</span>
                  Accessories
                </h5>
                <div className="space-y-2 text-sm">
                  {product.accessories.map((item) => (
                    <div key={item.id} className="flex justify-between bg-white p-2 rounded">
                      <span>
                        {item.title}
                        {item.isDefault && <span className="ml-2 text-xs bg-pink-200 px-2 py-1 rounded">Default</span>}
                      </span>
                      <span className="font-semibold text-green-700">₹{item.price.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-pink-200">
                  <p className="font-bold text-pink-900">Accessories Total: ₹{product.accessoriesTotal?.toLocaleString('en-IN')}</p>
                </div>
              </div>
            )}

            {/* Product Cost Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border-2 border-green-200">
              <h5 className="font-bold text-lg mb-4 text-gray-900">📊 Product Cost Summary</h5>

              {/* Manufacturing Cost Section */}
              <div className="bg-white p-4 rounded-lg mb-4 border border-blue-200">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Manufacturing Cost (Base):</span>
                    <span className="font-bold text-blue-700">₹{product.manufacturingCost?.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-xs text-gray-500 pl-4">
                    (Body + Actuator + Tubing & Fitting + Machine Cost + Testing)
                  </p>

                  {product.manufacturingProfitPercentage && product.manufacturingProfitPercentage > 0 ? (
                    <>
                      <div className="flex justify-between items-center bg-blue-50 p-2 rounded">
                        <span className="text-blue-700">
                          <span className="font-semibold">Profit Margin:</span> {product.manufacturingProfitPercentage}%
                        </span>
                        <span className="font-semibold text-blue-700">+₹{product.manufacturingProfitAmount?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between font-bold text-blue-900 pt-2 border-t border-blue-200">
                        <span>Manufacturing Cost (with profit):</span>
                        <span>₹{product.manufacturingCostWithProfit?.toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  ) : (
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <span className="text-xs text-gray-500">No profit margin applied</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Boughtout Item Cost Section */}
              <div className="bg-white p-4 rounded-lg mb-4 border border-pink-200">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Boughtout Item Cost (Base):</span>
                    <span className="font-bold text-pink-700">₹{product.boughtoutItemCost?.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-xs text-gray-500 pl-4">
                    (Accessories)
                  </p>

                  {product.boughtoutProfitPercentage && product.boughtoutProfitPercentage > 0 ? (
                    <>
                      <div className="flex justify-between items-center bg-pink-50 p-2 rounded">
                        <span className="text-pink-700">
                          <span className="font-semibold">Profit Margin:</span> {product.boughtoutProfitPercentage}%
                        </span>
                        <span className="font-semibold text-pink-700">+₹{product.boughtoutProfitAmount?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between font-bold text-pink-900 pt-2 border-t border-pink-200">
                        <span>Boughtout Cost (with profit):</span>
                        <span>₹{product.boughtoutCostWithProfit?.toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  ) : (
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <span className="text-xs text-gray-500">No profit margin applied</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Final Totals */}
              <div className="space-y-3">
                <div className="flex justify-between text-lg font-bold pt-3 border-t-2 border-green-400">
                  <span>Unit Cost:</span>
                  <span className="text-green-700">₹{product.unitCost?.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-xs text-gray-500 pl-4">
                  (Manufacturing Cost + Boughtout Cost with profit margins)
                </p>

                <div className="flex justify-between text-lg font-bold bg-gray-50 p-3 rounded">
                  <span>Quantity:</span>
                  <span>×{product.quantity}</span>
                </div>

                <div className="flex justify-between text-2xl font-bold pt-2 border-t-4 border-green-600 bg-green-50 p-4 rounded-lg">
                  <span>Line Total:</span>
                  <span className="text-green-600">₹{product.lineTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Profit Summary Badge */}
              {((product.manufacturingProfitPercentage && product.manufacturingProfitPercentage > 0) ||
                (product.boughtoutProfitPercentage && product.boughtoutProfitPercentage > 0)) && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-green-50 border-2 border-yellow-300 rounded-lg">
                    <p className="text-sm font-semibold text-gray-800 mb-2">💰 Profit Summary:</p>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      {product.manufacturingProfitPercentage && product.manufacturingProfitPercentage > 0 && (
                        <div>
                          <p className="text-gray-600">Manufacturing Profit:</p>
                          <p className="font-bold text-blue-700">
                            {product.manufacturingProfitPercentage}% = ₹{product.manufacturingProfitAmount?.toLocaleString('en-IN')}
                          </p>
                        </div>
                      )}
                      {product.boughtoutProfitPercentage && product.boughtoutProfitPercentage > 0 && (
                        <div>
                          <p className="text-gray-600">Boughtout Profit:</p>
                          <p className="font-bold text-pink-700">
                            {product.boughtoutProfitPercentage}% = ₹{product.boughtoutProfitAmount?.toLocaleString('en-IN')}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 pt-2 border-t border-yellow-300">
                      <p className="text-sm font-bold text-green-700">
                        Total Profit: ₹{((product.manufacturingProfitAmount || 0) + (product.boughtoutProfitAmount || 0)).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                )}
            </div>
          </div>
        ))}

        {/* Quote Totals */}
        <div className="border-t-4 border-gray-300 pt-6 mt-6">
          <h3 className="text-xl font-bold mb-4">Quote Summary</h3>
          <div className="flex justify-end">
            <div className="w-96 space-y-3 text-lg">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span className="font-semibold">₹{quote.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {quote.discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount ({quote.discount}%):</span>
                  <span className="font-semibold">-₹{quote.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-700">
                <span>Tax ({quote.tax}%):</span>
                <span className="font-semibold">₹{quote.taxAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-3xl font-bold text-gray-900 pt-4 border-t-4 border-green-600">
                <span>Grand Total:</span>
                <span className="text-green-600">₹{quote.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {quote.notes && (
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Notes</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}