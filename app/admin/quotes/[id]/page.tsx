'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Quote } from '@/types';
import { formatDate } from '@/utils/dateFormat';
import Link from 'next/link';

export default function AdminViewQuotePage() {
  const params = useParams();
  const router = useRouter();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

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
    
    if (!confirm(`Are you sure you want to change status to "${newStatus}"?`)) return;

    setUpdatingStatus(true);
    try {
      const quoteRef = doc(db, 'quotes', quote.id);
      await updateDoc(quoteRef, {
        status: newStatus,
        updatedAt: Timestamp.now(),
      });

      setQuote({ ...quote, status: newStatus });
      alert('Status updated successfully!');
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert('Failed to update status: ' + error.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Quote not found</p>
        <Link href="/admin/quotes" className="text-indigo-600 hover:underline mt-4 inline-block">
          Back to All Quotes
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/quotes" className="text-indigo-600 hover:underline text-sm mb-4 inline-block">
          ← Back to All Quotes
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{quote.quoteNumber}</h1>
            <p className="text-gray-600">Created on {formatDate(quote.createdAt)} by {quote.createdByName}</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`px-4 py-2 rounded-lg font-semibold capitalize ${getStatusColor(quote.status)}`}>
              {quote.status}
            </span>
            <button
              onClick={() => window.print()}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Status Change Buttons */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Change Status</h3>
        <div className="flex flex-wrap gap-3">
          {(['draft', 'sent', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={updatingStatus || quote.status === status}
              className={`px-6 py-2 rounded-lg font-medium capitalize transition-colors ${
                quote.status === status
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : status === 'approved'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : status === 'rejected'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : status === 'sent'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              {updatingStatus ? 'Updating...' : `Mark as ${status}`}
            </button>
          ))}
        </div>
      </div>

      {/* Quote Details - Same as employee view */}
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

        {/* Products Table */}
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Products</h3>
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specs</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {quote.products.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-4">
                    <div className="font-semibold text-gray-900">
                      {product.productType} - Series {product.seriesNumber}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    Size: {product.size} | Rating: {product.rating}
                  </td>
                  <td className="px-4 py-4 text-right text-sm text-gray-900">
                    {product.quantity}
                  </td>
                  <td className="px-4 py-4 text-right text-sm text-gray-900">
                    ₹{product.productTotalCost.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-4 text-right font-semibold text-gray-900">
                    ₹{product.lineTotal.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t pt-6">
          <div className="flex justify-end">
            <div className="w-80 space-y-3">
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
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t-2">
                <span>Total:</span>
                <span>₹{quote.total.toLocaleString('en-IN')}</span>
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