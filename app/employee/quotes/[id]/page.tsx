'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Quote } from '@/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import ProductDetailedView from '@/components/quotes/ProductDetailedView';
import QuoteSummary from '@/components/quotes/QuoteSummary';

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
        setQuote({
          id: quoteDoc.id,
          ...data,
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

  const generatePDF = () => {
    if (!quote) return;

    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text('UNICOEN VALVES', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Quotation', 105, 25, { align: 'center' });

    // Quote Info
    doc.setFontSize(10);
    doc.text(`Quote No: ${quote.quoteNumber}`, 14, 35);
    doc.text(`Date: ${quote.createdAt.toLocaleDateString()}`, 14, 40);
    doc.text(`Customer: ${quote.customerName}`, 14, 45);

    // Products Table
    const tableData = quote.products.map((p, index) => [
      index + 1,
      `${p.productType}\nSeries ${p.seriesNumber}\nSize: ${p.size}, Rating: ${p.rating}`,
      p.quantity,
      `Rs. ${p.unitCost?.toLocaleString('en-IN')}`,
      `Rs. ${p.lineTotal.toLocaleString('en-IN')}`
    ]);

    autoTable(doc, {
      startY: 55,
      head: [['S.No', 'Description', 'Qty', 'Unit Price', 'Total Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
    });

    // Totals
    const finalY = (doc as any).lastAutoTable.finalY || 60;
    doc.text(`Subtotal: Rs. ${quote.subtotal.toLocaleString('en-IN')}`, 140, finalY + 10);
    if (quote.discount > 0) {
      doc.text(`Discount (${quote.discount}%): -Rs. ${quote.discountAmount.toLocaleString('en-IN')}`, 140, finalY + 15);
    }
    doc.text(`Tax (${quote.tax}%): Rs. ${quote.taxAmount.toLocaleString('en-IN')}`, 140, finalY + 20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: Rs. ${quote.total.toLocaleString('en-IN')}`, 140, finalY + 30);

    doc.save(`Quote_${quote.quoteNumber}.pdf`);
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
          <button
            onClick={generatePDF}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            PDF
          </button>
        </div>
      </div>

      {/* Quote Info */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
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
        </div>

        {quote.notes && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
          </div>
        )}
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