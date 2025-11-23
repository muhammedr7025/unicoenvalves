'use client';

import { useEffect, useState } from 'react';
import {
  getAllMaterials,
  getAllSeries,
  getAllBodyWeights,
  getAllBonnetWeights,
  getAllComponentWeights,
  getAllCagePrices,
  importPricingData,
  clearAllPricingData,
} from '@/lib/firebase/pricingService';
import { generateExcelTemplate, parseExcelFile } from '@/utils/excelTemplate';

export default function PricingPage() {
  const [stats, setStats] = useState({
    materials: 0,
    series: 0,
    bodyWeights: 0,
    bonnetWeights: 0,
    componentWeights: 0,
    cagePrices: 0,
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    const [materials, series, bodyWeights, bonnetWeights, componentWeights, cagePrices] =
      await Promise.all([
        getAllMaterials(),
        getAllSeries(),
        getAllBodyWeights(),
        getAllBonnetWeights(),
        getAllComponentWeights(),
        getAllCagePrices(),
      ]);

    setStats({
      materials: materials.length,
      series: series.length,
      bodyWeights: bodyWeights.length,
      bonnetWeights: bonnetWeights.length,
      componentWeights: componentWeights.length,
      cagePrices: cagePrices.length,
    });
    setLoading(false);
  };

  const handleDownloadTemplate = () => {
    generateExcelTemplate();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress('Reading Excel file...');

    try {
      // Parse Excel file
      const data = await parseExcelFile(file);
      
      setUploadProgress('Validating data...');
      
      // Basic validation
      if (data.materials.length === 0) {
        throw new Error('No materials found in Excel file');
      }
      if (data.series.length === 0) {
        throw new Error('No series found in Excel file');
      }

      setUploadProgress('Importing data to database...');
      
      // Import to Firebase
      await importPricingData(data);
      
      setUploadProgress('Data imported successfully!');
      
      // Refresh stats
      await fetchStats();
      
      // Reset
      setTimeout(() => {
        setUploadProgress('');
        setUploading(false);
      }, 2000);
      
      alert('Pricing data imported successfully!');
    } catch (error: any) {
      console.error('Import error:', error);
      alert(error.message || 'Failed to import pricing data');
      setUploading(false);
      setUploadProgress('');
    }
    
    // Reset file input
    e.target.value = '';
  };

  const handleClearData = async () => {
    if (!window.confirm('Are you sure you want to delete ALL pricing data? This cannot be undone!')) {
      return;
    }

    if (!window.confirm('This will permanently delete all materials, series, and weights. Are you absolutely sure?')) {
      return;
    }

    setLoading(true);
    try {
      await clearAllPricingData();
      await fetchStats();
      alert('All pricing data has been cleared.');
    } catch (error: any) {
      alert(error.message || 'Failed to clear pricing data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Materials', value: stats.materials, icon: '⚙️', color: 'bg-blue-100 text-blue-600' },
    { title: 'Series', value: stats.series, icon: '📋', color: 'bg-green-100 text-green-600' },
    { title: 'Body Weights', value: stats.bodyWeights, icon: '🔩', color: 'bg-purple-100 text-purple-600' },
    { title: 'Bonnet Weights', value: stats.bonnetWeights, icon: '🔧', color: 'bg-orange-100 text-orange-600' },
    { title: 'Component Weights', value: stats.componentWeights, icon: '⚡', color: 'bg-pink-100 text-pink-600' },
    { title: 'Cage Prices', value: stats.cagePrices, icon: '💵', color: 'bg-indigo-100 text-indigo-600' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pricing Data Management</h1>
        <p className="text-gray-600">Manage product pricing, materials, and specifications</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Download Template */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-start">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Download Excel Template</h3>
              <p className="text-gray-600 text-sm mb-4">
                Download the Excel template with sample data. Fill it with your pricing information and upload it back.
              </p>
              <button
                onClick={handleDownloadTemplate}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Download Template
              </button>
            </div>
          </div>
        </div>

        {/* Upload Data */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-start">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Pricing Data</h3>
              <p className="text-gray-600 text-sm mb-4">
                Upload the filled Excel template. This will replace all existing pricing data.
              </p>
              
              {uploading ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600 mr-3"></div>
                    <span className="text-sm text-green-700">{uploadProgress}</span>
                  </div>
                </div>
              ) : (
                <label className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium cursor-pointer inline-block">
                  Choose Excel File
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Warning Section */}
      <div className="mt-8 bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-red-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
            <p className="text-red-700 text-sm mb-4">
              This action will permanently delete all pricing data including materials, series, weights, and prices.
            </p>
            <button
              onClick={handleClearData}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Clear All Pricing Data
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📖 Instructions</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Download the Excel template by clicking "Download Template" button</li>
          <li>Open the Excel file and you'll see 8 sheets with sample data</li>
          <li>Fill in your actual data following the same format as the samples</li>
          <li>Make sure all required columns are filled correctly</li>
          <li>Save the Excel file</li>
          <li>Click "Choose Excel File" and select your filled template</li>
          <li>Wait for the upload to complete (existing data will be replaced)</li>
          <li>Verify the counts in the statistics cards above</li>
        </ol>
      </div>
    </div>
  );
}