'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getProductsFromSubcollection } from '@/lib/firebase/productService';
import { Quote, QuoteProduct } from '@/types';
import * as XLSX from 'xlsx';
import ProductDetailedView from '@/components/quotes/ProductDetailedView';
import QuoteSummary from '@/components/quotes/QuoteSummary';
import { exportQuotePDF, PDFExportType } from '@/utils/pdfExporter';

export default function QuoteDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchQuote(params.id as string);
    }
  }, [params.id]);

  const fetchQuote = async (quoteId: string) => {
    try {
      const quoteRef = doc(db, 'quotes', quoteId);
      const quoteDoc = await getDoc(quoteRef);

      if (quoteDoc.exists()) {
        const data = quoteDoc.data();

        // Load products from subcollection first
        let products: QuoteProduct[] = [];
        try {
          products = await getProductsFromSubcollection(quoteId);
        } catch (e) {
          console.log('No products subcollection found');
        }

        // Fallback to legacy embedded products if subcollection is empty
        if (products.length === 0 && data.products && data.products.length > 0) {
          products = data.products;
        }

        setQuote({
          id: quoteDoc.id,
          ...data,
          products, // Use products from subcollection or legacy
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
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

  const exportToExcel = () => {
    if (!quote) return;

    const data = quote.products.map((p, index) => ({
      'S.No': index + 1,
      'Product': `${p.productType} - Series ${p.seriesNumber}`,
      'Size': p.size,
      'Rating': p.rating,
      'Qty': p.quantity,
      'Unit Price': p.unitCost,
      'Total Price': p.lineTotal,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Quote Details');
    XLSX.writeFile(wb, `Quote_${quote.quoteNumber}.xlsx`);
  };

  const handlePDFExport = async (exportType: PDFExportType) => {
    if (!quote) return;

    try {
      // Fetch customer details
      const customerRef = doc(db, 'customers', quote.customerId);
      const customerDoc = await getDoc(customerRef);

      const customerDetails = customerDoc.exists()
        ? customerDoc.data()
        : {
          name: quote.customerName,
          address: '',
          country: '',
        };

      exportQuotePDF(quote, customerDetails, exportType);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!quote) return null;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quote Details</h1>
          <p className="text-gray-600 mt-1">{quote.quoteNumber}</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => router.push(`/employee/edit-quote/${quote.id}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Quote
          </button>
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Excel
          </button>

          {/* PDF Export Dropdown */}
          <div className="relative group">
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Export PDF
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-2">
                <button
                  onClick={() => handlePDFExport('cover')}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-start transition-colors"
                >
                  <svg className="w-5 h-5 mr-3 mt-0.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <div className="font-semibold text-gray-900">Cover Letter + Terms & Conditions</div>
                    <div className="text-xs text-gray-500">Formal offer covering letter</div>
                  </div>
                </button>

                <button
                  onClick={() => handlePDFExport('pricing')}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-start transition-colors border-t border-gray-100"
                >
                  <svg className="w-5 h-5 mr-3 mt-0.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <div className="font-semibold text-gray-900">Price Summary Only</div>
                    <div className="text-xs text-gray-500">Pricing with terms & conditions</div>
                  </div>
                </button>

                <button
                  onClick={() => handlePDFExport('both')}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-start transition-colors border-t border-gray-100"
                >
                  <svg className="w-5 h-5 mr-3 mt-0.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                  <div>
                    <div className="font-semibold text-gray-900">Complete Quote</div>
                    <div className="text-xs text-gray-500">Cover letter + price summary + terms & conditions</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quote Info */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Customer</h3>
            <p className="text-lg font-semibold text-gray-900">{quote.customerName}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Project Name</h3>
            <p className="text-lg font-semibold text-gray-900">{quote.projectName || '-'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Enquiry ID</h3>
            <p className="text-lg font-semibold text-gray-900">{quote.enquiryId || '-'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1
              ${quote.status === 'approved' ? 'bg-green-100 text-green-800' :
                quote.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  quote.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'}`}>
              {quote.status === 'sent' ? 'Submitted' : quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Created By</h3>
            <p className="text-lg font-semibold text-gray-900">{quote.createdByName}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Date</h3>
            <p className="text-lg font-semibold text-gray-900">{quote.createdAt.toLocaleDateString()}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">📅 Validity</h3>
            <p className="text-lg font-semibold text-purple-700">{quote.validity || '30 days'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">💰 Pricing Type</h3>
            <p className="text-lg font-semibold text-green-700">{quote.pricingType || 'Ex-Works'}</p>
          </div>
        </div>

        {/* New Settings Row */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Warranty Terms */}
            <div className="bg-blue-50 rounded-lg p-3">
              <h3 className="text-sm font-medium text-blue-700 mb-1">🛡️ Warranty (Months)</h3>
              <div className="flex space-x-4">
                <div>
                  <span className="text-xs text-gray-500">From Despatch:</span>
                  <span className="ml-1 font-semibold text-blue-800">{quote.warrantyTerms?.shipmentDays || 12}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500">From Installation:</span>
                  <span className="ml-1 font-semibold text-blue-800">{quote.warrantyTerms?.installationDays || 12}</span>
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="bg-teal-50 rounded-lg p-3">
              <h3 className="text-sm font-medium text-teal-700 mb-1">🚚 Delivery</h3>
              <p className="font-semibold text-teal-800">{quote.deliveryDays || '-'}</p>
            </div>

            {/* Payment Terms */}
            <div className="bg-green-50 rounded-lg p-3">
              <h3 className="text-sm font-medium text-green-700 mb-1">💳 Payment Terms</h3>
              <div className="flex space-x-4">
                <div>
                  <span className="text-xs text-gray-500">Advance:</span>
                  <span className="ml-1 font-semibold text-green-800">{quote.paymentTerms?.advancePercentage || 30}%</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Approval:</span>
                  <span className="ml-1 font-semibold text-green-800">{quote.paymentTerms?.approvalPercentage || 70}%</span>
                </div>
              </div>
              {quote.paymentTerms?.customTerms && (
                <p className="text-xs text-gray-500 mt-1">Custom: {quote.paymentTerms.customTerms}</p>
              )}
            </div>

            {/* Currency Exchange (if applicable) */}
            {quote.currencyExchangeRate && (
              <div className="bg-amber-50 rounded-lg p-3">
                <h3 className="text-sm font-medium text-amber-700 mb-1">💱 Exchange Rate</h3>
                <p className="font-semibold text-amber-800">1 USD = ₹{quote.currencyExchangeRate}</p>
              </div>
            )}
          </div>
        </div>

        {quote.notes && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
          </div>
        )}
      </div>

      {/* Item Details Table (Pricing Summary) */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <span className="mr-2">📋</span>
          Item Details
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-900 text-white">
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold">S.No</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Tag No.</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Item Description</th>
                <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Unit Price (INR)</th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Qty</th>
                <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Total Price (INR)</th>
              </tr>
            </thead>
            <tbody>
              {quote.products.map((product, index) => {
                // Build description - values only, comma separated
                const descParts: string[] = [];
                descParts.push(`${product.seriesNumber}`);
                if (product.size) descParts.push(`${product.size}`);
                if (product.rating) descParts.push(`${product.rating}`);
                if (product.bodyEndConnectType) descParts.push(`${product.bodyEndConnectType}`);
                if (product.bodyBonnetMaterialName) descParts.push(`${product.bodyBonnetMaterialName}`);
                if (product.actuatorSeries && product.actuatorModel) {
                  descParts.push(`${product.actuatorSeries}/${product.actuatorModel}`);
                }
                if (product.accessories && product.accessories.length > 0) {
                  const accessoryNames = product.accessories.map(a => a.title).join(', ');
                  descParts.push(accessoryNames);
                }

                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 text-center">{index + 1}</td>
                    <td className="border border-gray-300 px-4 py-3">{product.productTag || `Item ${index + 1}`}</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">{descParts.join(', ')}</td>
                    <td className="border border-gray-300 px-4 py-3 text-right font-medium">
                      ₹{(product.unitCost || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">{product.quantity}</td>
                    <td className="border border-gray-300 px-4 py-3 text-right font-bold text-green-700">
                      ₹{(product.lineTotal || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-bold">
                <td colSpan={5} className="border border-gray-300 px-4 py-3 text-right">Subtotal:</td>
                <td className="border border-gray-300 px-4 py-3 text-right text-green-700">
                  ₹{(quote.subtotal || 0).toLocaleString('en-IN')}
                </td>
              </tr>
              {quote.packagePrice && quote.packagePrice > 0 && (
                <tr className="bg-gray-50">
                  <td colSpan={5} className="border border-gray-300 px-4 py-3 text-right">Packing Charges:</td>
                  <td className="border border-gray-300 px-4 py-3 text-right">
                    ₹{quote.packagePrice.toLocaleString('en-IN')}
                  </td>
                </tr>
              )}
              {quote.discount && quote.discount > 0 && (
                <tr className="bg-gray-50">
                  <td colSpan={5} className="border border-gray-300 px-4 py-3 text-right">Discount ({quote.discount}%):</td>
                  <td className="border border-gray-300 px-4 py-3 text-right text-red-600">
                    -₹{(quote.discountAmount || 0).toLocaleString('en-IN')}
                  </td>
                </tr>
              )}
              <tr className="bg-gray-50">
                <td colSpan={5} className="border border-gray-300 px-4 py-3 text-right">IGST ({quote.tax || 18}%):</td>
                <td className="border border-gray-300 px-4 py-3 text-right">
                  ₹{(quote.taxAmount || 0).toLocaleString('en-IN')}
                </td>
              </tr>
              <tr className="bg-green-100 font-bold text-lg">
                <td colSpan={5} className="border border-gray-300 px-4 py-4 text-right">Grand Total:</td>
                <td className="border border-gray-300 px-4 py-4 text-right text-green-700">
                  ₹{(quote.total || 0).toLocaleString('en-IN')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Products */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">Product Details</h2>

        {quote.products.map((product, index) => (
          <ProductDetailedView
            key={index}
            product={product}
            index={index}
          />
        ))}

        {/* Totals */}
        <div className="border-t-4 border-gray-300 pt-6 mt-6">
          <QuoteSummary
            subtotal={quote.subtotal}
            productsSubtotal={quote.products.reduce((sum, p) => sum + (p.lineTotal || 0), 0)}
            packagePrice={quote.packagePrice}
            discount={quote.discount}
            discountAmount={quote.discountAmount}
            tax={quote.tax}
            taxAmount={quote.taxAmount}
            total={quote.total}
          />

        </div>
      </div>
    </div>
  );
}