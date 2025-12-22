'use client';

import { useEffect, useState } from 'react';
import {
  getAllMaterials,
  getAllSeries,
  getAllSeries,
  importPricingData,
  clearAllPricingData,
} from '@/lib/firebase/pricingService';
import { generateExcelTemplate, parseExcelFile } from '@/utils/excelTemplate';
import { exportCurrentPricing } from '@/utils/pricingExport';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function PricingPage() {
  const [stats, setStats] = useState({
    materials: 0,
    series: 0,
    bodyWeights: 0,
    bonnetWeights: 0,
    componentWeights: 0,
    stemWeights: 0,
    cagePrices: 0,
    actuatorModels: 0,
    handwheelPrices: 0,
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Pricing Viewer States
  const [activeTab, setActiveTab] = useState<string>('materials');

  // Data States
  const [materialsData, setMaterialsData] = useState<any[]>([]);
  const [seriesData, setSeriesData] = useState<any[]>([]);
  const [bodyWeightsData, setBodyWeightsData] = useState<any[]>([]);
  const [bonnetWeightsData, setBonnetWeightsData] = useState<any[]>([]);
  const [plugWeightsData, setPlugWeightsData] = useState<any[]>([]);
  const [seatWeightsData, setSeatWeightsData] = useState<any[]>([]);
  const [cageWeightsData, setCageWeightsData] = useState<any[]>([]);
  const [sealRingPricesData, setSealRingPricesData] = useState<any[]>([]);
  const [stemsData, setStemsData] = useState<any[]>([]);
  const [actuatorsData, setActuatorsData] = useState<any[]>([]);
  const [handwheelsData, setHandwheelsData] = useState<any[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    setVisibleCount(10);
  }, [activeTab, searchTerm]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [
        materials,
        series,
        bodyWeights,
        bonnetWeights,
        plugWeights,
        seatWeights,
        cageWeights,
        sealRingPrices,
        stems,
        actuators,
        handwheels,
      ] = await Promise.all([
        getAllMaterials(),
        getAllSeries(),
        getDocs(collection(db, 'bodyWeights')),
        getDocs(collection(db, 'bonnetWeights')),
        getDocs(collection(db, 'plugWeights')),
        getDocs(collection(db, 'seatWeights')),
        getDocs(collection(db, 'cageWeights')),
        getDocs(collection(db, 'sealRingPrices')),
        getDocs(collection(db, 'stemFixedPrices')),
        getDocs(collection(db, 'actuatorModels')),
        getDocs(collection(db, 'handwheelPrices')),
      ]);

      // Set Data
      setMaterialsData(materials);
      setSeriesData(series);
      setBodyWeightsData(bodyWeights.docs.map(d => ({ id: d.id, ...d.data() })));
      setBonnetWeightsData(bonnetWeights.docs.map(d => ({ id: d.id, ...d.data() })));
      setPlugWeightsData(plugWeights.docs.map(d => ({ id: d.id, ...d.data() })));
      setSeatWeightsData(seatWeights.docs.map(d => ({ id: d.id, ...d.data() })));
      setCageWeightsData(cageWeights.docs.map(d => ({ id: d.id, ...d.data() })));
      setSealRingPricesData(sealRingPrices.docs.map(d => ({ id: d.id, ...d.data() })));
      setStemsData(stems.docs.map(d => ({ id: d.id, ...d.data() })));
      setActuatorsData(actuators.docs.map(d => ({ id: d.id, ...d.data() })));
      setHandwheelsData(handwheels.docs.map(d => ({ id: d.id, ...d.data() })));
      setHandwheelsData(handwheels.docs.map(d => ({ id: d.id, ...d.data() })));

      // Set Stats
      setStats({
        materials: materials.length,
        series: series.length,
        bodyWeights: bodyWeights.size,
        bonnetWeights: bonnetWeights.size,
        componentWeights: plugWeights.size + seatWeights.size,
        stemWeights: stems.size,
        cagePrices: cageWeights.size,
        actuatorModels: actuators.size,
        handwheelPrices: handwheels.size,
        handwheelPrices: handwheels.size,
      });

    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    generateExcelTemplate();
  };

  const handleExportPricing = async () => {
    try {
      await exportCurrentPricing();
      alert('Current pricing exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export pricing data');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress('Reading Excel file...');

    try {
      const data = await parseExcelFile(file);
      setUploadProgress('Validating data...');

      if (data.materials.length === 0) throw new Error('No materials found');
      if (data.series.length === 0) throw new Error('No series found');

      setUploadProgress('Importing data to database...');
      await importPricingData(data);
      setUploadProgress('Data imported successfully!');

      await fetchStats();

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
    e.target.value = '';
  };

  const handleClearData = async () => {
    if (!window.confirm('Are you sure you want to delete ALL pricing data? This cannot be undone!')) return;
    if (!window.confirm('This will permanently delete all materials, series, and weights. Are you absolutely sure?')) return;

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

  // Helper to filter data
  const getFilteredData = () => {
    const term = searchTerm.toLowerCase();
    switch (activeTab) {
      case 'materials': return materialsData.filter(m => m.name.toLowerCase().includes(term));
      case 'series': return seriesData.filter(s => s.seriesNumber.toLowerCase().includes(term) || s.name.toLowerCase().includes(term));
      case 'bodyWeights': return bodyWeightsData.filter(i => i.seriesId?.includes(term) || i.size?.includes(term));
      case 'bonnetWeights': return bonnetWeightsData.filter(i => i.seriesId?.includes(term) || i.bonnetType?.toLowerCase().includes(term));
      case 'plugWeights': return plugWeightsData.filter(i => i.seriesId?.includes(term));
      case 'seatWeights': return seatWeightsData.filter(i => i.seriesId?.includes(term));
      case 'cageWeights': return cageWeightsData.filter(i => i.seriesId?.includes(term));
      case 'sealRingPrices': return sealRingPricesData.filter(i => i.seriesId?.includes(term) || i.sealType?.toLowerCase().includes(term));
      case 'stems': return stemsData.filter(s => s.seriesId?.includes(term) || s.materialName?.toLowerCase().includes(term));
      case 'actuators': return actuatorsData.filter(a => a.type?.toLowerCase().includes(term) || a.model?.toLowerCase().includes(term));
      case 'handwheels': return handwheelsData.filter(h => h.type?.toLowerCase().includes(term) || h.model?.toLowerCase().includes(term));
      case 'handwheels': return handwheelsData.filter(h => h.type?.toLowerCase().includes(term) || h.model?.toLowerCase().includes(term));
      default: return [];
    }
  };

  const filteredData = getFilteredData();
  const visibleData = filteredData.slice(0, visibleCount);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'materials', label: 'Materials', count: materialsData.length },
    { id: 'series', label: 'Series', count: seriesData.length },
    { id: 'bodyWeights', label: 'Body Weights', count: bodyWeightsData.length },
    { id: 'bonnetWeights', label: 'Bonnet Weights', count: bonnetWeightsData.length },
    { id: 'plugWeights', label: 'Plug Weights', count: plugWeightsData.length },
    { id: 'seatWeights', label: 'Seat Weights', count: seatWeightsData.length },
    { id: 'cageWeights', label: 'Cage Weights', count: cageWeightsData.length },
    { id: 'sealRingPrices', label: 'Seal Ring Prices', count: sealRingPricesData.length },
    { id: 'stems', label: 'Stems', count: stemsData.length },
    { id: 'actuators', label: 'Actuators', count: actuatorsData.length },
    { id: 'handwheels', label: 'Handwheels', count: handwheelsData.length },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pricing Data Management</h1>
        <p className="text-gray-600">Manage product pricing, materials, and specifications</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Materials</p>
            <span className="text-2xl">⚙️</span>
          </div>
          <p className="text-3xl font-bold text-indigo-600">{stats.materials}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Series</p>
            <span className="text-2xl">📋</span>
          </div>
          <p className="text-3xl font-bold text-indigo-600">{stats.series}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Body Weights</p>
            <span className="text-2xl">🔩</span>
          </div>
          <p className="text-3xl font-bold text-indigo-600">{stats.bodyWeights}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Bonnet Weights</p>
            <span className="text-2xl">🔧</span>
          </div>
          <p className="text-3xl font-bold text-indigo-600">{stats.bonnetWeights}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Plug/Seat Weights</p>
            <span className="text-2xl">⚡</span>
          </div>
          <p className="text-3xl font-bold text-indigo-600">{stats.componentWeights}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Stem Prices</p>
            <span className="text-2xl">📏</span>
          </div>
          <p className="text-3xl font-bold text-indigo-600">{stats.stemWeights}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Cage Weights</p>
            <span className="text-2xl">🔒</span>
          </div>
          <p className="text-3xl font-bold text-indigo-600">{stats.cagePrices}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Actuator Models</p>
            <span className="text-2xl">⚙️</span>
          </div>
          <p className="text-3xl font-bold text-purple-600">{stats.actuatorModels}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Handwheel Prices</p>
            <span className="text-2xl">🎡</span>
          </div>
          <p className="text-3xl font-bold text-purple-600">{stats.handwheelPrices}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Download Template */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-start">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Download Empty Template</h3>
              <p className="text-gray-600 text-sm mb-4">
                Get blank Excel template with sample data for adding new pricing.
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

        {/* Export Current Pricing */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-purple-200">
          <div className="flex items-start">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                📊 Export Current Pricing
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Download YOUR current pricing data to modify and re-upload. ✨ RECOMMENDED
              </p>
              <button
                onClick={handleExportPricing}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Export to Excel
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
                Upload filled Excel. System MERGES data: updates existing prices, adds new items.
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

      {/* Pricing Viewer */}
      <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-gray-900">📊 View Current Pricing</h3>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 border-b border-gray-200 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {activeTab === 'materials' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Kg (₹)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </>
                )}
                {activeTab === 'series' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Series #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Has Cage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Has Seal Ring</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </>
                )}
                {(activeTab === 'bodyWeights' || activeTab === 'bonnetWeights' || activeTab === 'plugWeights' || activeTab === 'seatWeights' || activeTab === 'cageWeights') && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Series</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    {activeTab === 'bodyWeights' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Connect</th>}
                    {activeTab === 'bonnetWeights' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bonnet Type</th>}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight (kg)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </>
                )}
                {activeTab === 'sealRingPrices' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Series</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seal Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (₹)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </>
                )}
                {activeTab === 'stems' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Series</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (₹)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </>
                )}
                {(activeTab === 'actuators' || activeTab === 'handwheels') && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Series</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Standard</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (₹)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visibleData.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {activeTab === 'materials' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{item.pricePerKg.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.materialGroup}</td>
                    </>
                  )}
                  {activeTab === 'series' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.seriesNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.productType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.hasCage ? '✅' : '❌'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.hasSealRing ? '✅' : '❌'}</td>
                    </>
                  )}
                  {(activeTab === 'bodyWeights' || activeTab === 'bonnetWeights' || activeTab === 'plugWeights' || activeTab === 'seatWeights' || activeTab === 'cageWeights') && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.seriesId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.size}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.rating}</td>
                      {activeTab === 'bodyWeights' && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.endConnectType}</td>}
                      {activeTab === 'bonnetWeights' && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.bonnetType}</td>}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.weight} kg</td>
                    </>
                  )}
                  {activeTab === 'sealRingPrices' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.seriesId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.sealType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.size}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.rating}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{item.fixedPrice?.toLocaleString()}</td>
                    </>
                  )}
                  {activeTab === 'stems' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.seriesId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.size}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.rating}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.materialName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{item.fixedPrice?.toLocaleString()}</td>
                    </>
                  )}
                  {(activeTab === 'actuators' || activeTab === 'handwheels') && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.series}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.model}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">{item.standard}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{item.fixedPrice?.toLocaleString()}</td>
                    </>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* View More Button */}
        {
          filteredData.length > visibleCount && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setVisibleCount(prev => prev + 20)}
                className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold py-2 px-6 rounded-lg transition-colors border border-purple-200"
              >
                View More ({filteredData.length - visibleCount} remaining)
              </button>
            </div>
          )
        }

        {/* No Results */}
        {
          filteredData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No results found for "{searchTerm}"</p>
            </div>
          )
        }
      </div >

      {/* Warning Section */}
      < div className="mt-8 bg-red-50 border-l-4 border-red-500 p-6 rounded-lg" >
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
      </div >

      {/* Instructions */}
      < div className="mt-8 bg-white rounded-xl shadow-sm p-6" >
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
      </div >
    </div >
  );
}