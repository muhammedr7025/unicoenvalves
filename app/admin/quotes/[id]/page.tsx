'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Quote } from '@/types';
import { formatDate } from '@/utils/dateFormat';
import Link from 'next/link';
import ProductDetailedView from '@/components/quotes/ProductDetailedView';
import QuoteSummary from '@/components/quotes/QuoteSummary';

export default function AdminViewQuotePage() {
  const params = useParams();
  const router = useRouter();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchQuote(params.id as string);
    }
  }, [params.id]);

  const fetchQuote = async (quoteId: string) => {
    setLoading(true);
    try {
      const quoteRef = doc(db, 'quotes', quoteId);
      const quoteDoc = await getDoc(quoteRef);

      if (quoteDoc.exists()) {
        const data = quoteDoc.data();
        setQuote({
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
        } as Quote);
      } else {
        alert('Quote not found');
        router.push('/admin/quotes');
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
      alert('Failed to load quote');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: 'draft' | 'sent' | 'approved' | 'rejected') => {
    if (!quote) return;

    if (!confirm(`Are you sure you want to change status to "${newStatus === 'sent' ? 'Submitted' : newStatus}"?`)) {
      return;
    }

    setUpdating(true);
    try {
      const quoteRef = doc(db, 'quotes', quote.id);
      await updateDoc(quoteRef, {
        status: newStatus,
      });

      setQuote({ ...quote, status: newStatus });
      alert('Status updated successfully!');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
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
        <Link href="/admin/quotes" className="text-green-600 hover:underline mt-4 inline-block">
          Back to Quotes
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/quotes" className="text-green-600 hover:underline text-sm mb-4 inline-block">
          ← Back to All Quotes
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{quote.quoteNumber}</h1>
            <p className="text-gray-600">Created on {formatDate(quote.createdAt)} by {quote.createdByName}</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.print()}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Status Management */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Quote Status</h3>
        <div className="flex items-center space-x-4">
          <span className={`px-4 py-2 rounded-lg font-semibold capitalize border-2 ${getStatusColor(quote.status)}`}>
            Current: {quote.status === 'sent' ? 'Submitted' : quote.status}
          </span>

          <div className="flex space-x-2">
            {quote.status !== 'draft' && (
              <button
                onClick={() => handleStatusChange('draft')}
                disabled={updating}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm"
              >
                Set to Draft
              </button>
            )}
            {quote.status !== 'sent' && (
              <button
                onClick={() => handleStatusChange('sent')}
                disabled={updating}
                className="px-4 py-2 border-2 border-blue-300 rounded-lg hover:bg-blue-50 disabled:opacity-50 text-sm"
              >
                Set to Submitted
              </button>
            )}
            {quote.status !== 'approved' && (
              <button
                onClick={() => handleStatusChange('approved')}
                disabled={updating}
                className="px-4 py-2 border-2 border-green-300 rounded-lg hover:bg-green-50 disabled:opacity-50 text-sm"
              >
                Approve
              </button>
            )}
            {quote.status !== 'rejected' && (
              <button
                onClick={() => handleStatusChange('rejected')}
                disabled={updating}
                className="px-4 py-2 border-2 border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 text-sm"
              >
                Reject
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quote Details */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Customer</h3>
            <p className="text-lg font-semibold text-gray-900">{quote.customerName}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Created By</h3>
            <p className="text-lg text-gray-900">{quote.createdByName}</p>
          </div>
        </div>

        {/* Products - Detailed View */}
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Products Details</h3>

        {quote.products.map((product, index) => (
          <ProductDetailedView
            key={product.id || index}
            product={product}
            index={index}
          />
        ))}

        {/* Quote Totals */}
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