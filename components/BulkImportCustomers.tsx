'use client';

import { useState } from 'react';
import { generateCustomerTemplate, parseCustomerExcel, ParsedCustomer } from '@/utils/customerExcelTemplate';
import { bulkImportCustomers } from '@/lib/firebase/customerService';
import { useAuth } from '@/lib/firebase/authContext';

export default function BulkImportCustomers({ onImportComplete }: { onImportComplete: () => void }) {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [parsedCustomers, setParsedCustomers] = useState<ParsedCustomer[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importResult, setImportResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const handleDownloadTemplate = () => {
    generateCustomerTemplate();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setParsedCustomers([]);
      setParseErrors([]);
      setImportResult(null);
    }
  };

  const handleParseFile = async () => {
    if (!selectedFile) return;

    setParsing(true);
    setParseErrors([]);
    setParsedCustomers([]);
    setImportResult(null);

    try {
      const result = await parseCustomerExcel(selectedFile);

      if (result.success) {
        setParsedCustomers(result.data);
        setParseErrors([]);
      } else {
        setParseErrors(result.errors);
        setParsedCustomers([]);
      }
    } catch (error: any) {
      setParseErrors([`Failed to parse file: ${error.message}`]);
    } finally {
      setParsing(false);
    }
  };

  const handleImport = async () => {
    // Check if user exists
    if (!user) {
      alert('You are not logged in. Please refresh the page and sign in again.');
      return;
    }

    // Check if there are customers to import
    if (parsedCustomers.length === 0) {
      alert('No customers to import. Please upload and validate a file first.');
      return;
    }

    setImporting(true);

    try {
      // YOUR USER STRUCTURE: { id, email, name, role, createdAt, isActive }
      // Get user credentials using YOUR field names
      const userId = (user as any).id; // YOUR USER HAS 'id' NOT 'uid'
      const userEmail = (user as any).email;
      const userName = (user as any).name || userEmail?.split('@')[0] || 'Admin';

      console.log('Import starting with user:', { userId, userName, userEmail }); // Debug

      // Validate user ID
      if (!userId || userId === '') {
        alert('User ID is missing. Please sign out and sign in again.');
        setImporting(false);
        return;
      }

      const result = await bulkImportCustomers(
        parsedCustomers,
        userId,
        userName
      );

      console.log('Import complete:', result); // Debug

      setImportResult(result);

      // If successful, clear and redirect after 3 seconds
      if (result.success > 0) {
        setTimeout(() => {
          setSelectedFile(null);
          setParsedCustomers([]);
          setParseErrors([]);
          setImportResult(null);
          onImportComplete();
        }, 3000);
      }
    } catch (error: any) {
      console.error('Import error:', error);
      alert(`Import failed: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setParsedCustomers([]);
    setParseErrors([]);
    setImportResult(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-bold mb-6">Bulk Import Customers</h2>

      {/* Step 1: Download Template */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Step 1: Download Template</h3>
        <p className="text-sm text-blue-800 mb-3">
          Download the Excel template, fill in customer details, and save the file.
        </p>
        <button
          onClick={handleDownloadTemplate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Download Template</span>
        </button>
      </div>

      {/* Step 2: Upload File */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg border-2 border-green-200">
        <h3 className="font-semibold text-green-900 mb-2">Step 2: Upload File</h3>
        <p className="text-sm text-green-800 mb-3">
          Upload your completed Excel file to validate the data.
        </p>
        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-green-600 file:text-white
              hover:file:bg-green-700 cursor-pointer"
          />
          {selectedFile && (
            <button
              onClick={handleParseFile}
              disabled={parsing}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 whitespace-nowrap"
            >
              {parsing ? 'Validating...' : 'Validate'}
            </button>
          )}
        </div>
        {selectedFile && (
          <p className="text-sm text-gray-600 mt-2">
            Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
          </p>
        )}
      </div>

      {/* Parse Errors */}
      {parseErrors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 rounded-lg border-2 border-red-200">
          <h3 className="font-semibold text-red-900 mb-2">❌ Validation Errors</h3>
          <p className="text-sm text-red-800 mb-2">
            Please fix the following errors in your Excel file:
          </p>
          <div className="max-h-60 overflow-y-auto">
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {parseErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
          <button
            onClick={handleReset}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Parsed Customers Preview */}
      {parsedCustomers.length > 0 && !importResult && (
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
          <h3 className="font-semibold text-yellow-900 mb-2">
            ✅ Validation Successful - {parsedCustomers.length} Customers Ready to Import
          </h3>
          <p className="text-sm text-yellow-800 mb-3">
            Review the customers below and click "Import All" to proceed.
          </p>

          {/* Preview Table */}
          <div className="bg-white rounded-lg p-4 mb-4 max-h-96 overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Company</th>
                  <th className="px-4 py-2 text-left">Country</th>
                  <th className="px-4 py-2 text-left">GST</th>
                </tr>
              </thead>
              <tbody>
                {parsedCustomers.map((customer, index) => (
                  <tr key={index} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2 font-medium">{customer.name}</td>
                    <td className="px-4 py-2">{customer.email}</td>
                    <td className="px-4 py-2">{customer.company || '-'}</td>
                    <td className="px-4 py-2">{customer.country}</td>
                    <td className="px-4 py-2 text-xs">{customer.gstNumber || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Import Button */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleImport}
              disabled={importing || !user}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {importing ? 'Importing...' : `Import All ${parsedCustomers.length} Customers`}
            </button>
            {!user && (
              <p className="text-red-600 text-sm">⚠️ Please sign in to import</p>
            )}
            <button
              onClick={handleReset}
              disabled={importing}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Import Result */}
      {importResult && (
        <div className={`mb-6 p-4 rounded-lg border-2 ${
          importResult.failed === 0 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <h3 className={`font-semibold mb-2 ${
            importResult.failed === 0 ? 'text-green-900' : 'text-yellow-900'
          }`}>
            Import Complete
          </h3>
          <div className="text-sm mb-3">
            <p className="text-green-700">✅ Successfully imported: {importResult.success}</p>
            {importResult.failed > 0 && (
              <p className="text-red-700">❌ Failed: {importResult.failed}</p>
            )}
          </div>

          {importResult.errors.length > 0 && (
            <div className="bg-white rounded-lg p-3 mb-3 max-h-40 overflow-y-auto">
              <p className="text-sm font-semibold text-red-900 mb-2">Errors:</p>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {importResult.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {importResult.failed === 0 && (
            <p className="text-sm text-green-800">
              Redirecting to customer list in 3 seconds...
            </p>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2">📋 Instructions</h3>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>Download the Excel template using the button above</li>
          <li>Fill in customer details (Name, Email, and Country are required)</li>
          <li>Email addresses must be unique</li>
          <li>For Indian customers, GST and PAN numbers will be validated if provided</li>
          <li>Save the file and upload it</li>
          <li>Click "Validate" to check for errors</li>
          <li>Review the preview and click "Import All" to complete</li>
        </ul>
      </div>
    </div>
  );
}