'use client';

import { useEffect, useState } from 'react';
import { getAllCustomers, createCustomer, updateCustomer, deleteCustomer } from '@/lib/firebase/customerService';
import { Customer } from '@/types';
import { formatDate } from '@/utils/dateFormat';
import { useAuth } from '@/lib/firebase/authContext';

export default function CustomersPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    country: 'India',
    gst: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    // Filter customers based on search
    if (searchTerm.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone.includes(searchTerm) ||
          customer.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    }
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    setLoading(true);
    const data = await getAllCustomers();
    setCustomers(data);
    setFilteredCustomers(data);
    setLoading(false);
  };

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        country: customer.country,
        gst: customer.gst || '',
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        country: 'India',
        gst: '',
      });
    }
    setFormError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCustomer(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      country: 'India',
      gst: '',
    });
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      // Validate GST for Indian customers
      if (formData.country === 'India' && formData.gst.trim() === '') {
        setFormError('GST number is required for Indian customers');
        setFormLoading(false);
        return;
      }

      if (editingCustomer) {
        // Update existing customer
        await updateCustomer(editingCustomer.id, formData);
      } else {
        // Create new customer
        if (!user) {
          setFormError('User not authenticated');
          setFormLoading(false);
          return;
        }
        await createCustomer(formData, user.id);
      }
      
      await fetchCustomers();
      handleCloseModal();
    } catch (error: any) {
      setFormError(error.message || 'Failed to save customer');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (customer: Customer) => {
    if (window.confirm(`Are you sure you want to delete ${customer.name}?`)) {
      try {
        await deleteCustomer(customer.id);
        await fetchCustomers();
      } catch (error: any) {
        alert(error.message || 'Failed to delete customer');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Management</h1>
          <p className="text-gray-600">Manage your customer database</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Customer
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search customers by name, email, phone, or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <svg
            className="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">🏢</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">🇮🇳</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Indian Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {customers.filter((c) => c.country === 'India').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">🌍</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">International</p>
              <p className="text-2xl font-bold text-gray-900">
                {customers.filter((c) => c.country !== 'India').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GST
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Added
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm
                      ? 'No customers found matching your search.'
                      : 'No customers found. Add your first customer to get started.'}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-green-600 font-semibold">
                            {customer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="font-medium text-gray-900">{customer.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{customer.email}</div>
                      <div className="text-sm text-gray-500">{customer.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{customer.country}</div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {customer.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {customer.gst ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {customer.gst}
                        </span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(customer.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(customer)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(customer)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-sm text-red-700">{formError}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company/Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="ABC Industries"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="contact@abcindustries.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="+91 9876543210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <select
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="India">India</option>
                    <option value="USA">USA</option>
                    <option value="UK">UK</option>
                    <option value="UAE">UAE</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Full address with city, state, and postal code"
                />
              </div>

              {formData.country === 'India' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GST Number *
                  </label>
                  <input
                    type="text"
                    required={formData.country === 'India'}
                    value={formData.gst}
                    onChange={(e) =>
                      setFormData({ ...formData, gst: e.target.value.toUpperCase() })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="22AAAAA0000A1Z5"
                    maxLength={15}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    GST number is mandatory for Indian customers
                  </p>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {formLoading ? 'Saving...' : editingCustomer ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}