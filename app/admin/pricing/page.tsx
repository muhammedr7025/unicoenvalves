'use client';

import { useEffect, useState } from 'react';
import {
  getAllMaterials,
  getAllSeries,
  getAllBodyWeights,
  getAllBonnetWeights,
  getAllPlugWeights,
  getAllSeatWeights,
  getAllStemFixedPrices,
  getAllCageWeights,
  getAllSealRingPrices,
  getAllActuatorModels,
  getAllHandwheelPrices,
  importPricingData,
  clearAllPricingData,
  updatePricingDocument,
  deletePricingDocument,
} from '@/lib/firebase/pricingService';
import { generateExcelTemplate, parseExcelFile, exportPricingDataToExcel } from '@/utils/excelTemplate';

type CollectionType =
  | 'materials'
  | 'series'
  | 'bodyWeights'
  | 'bonnetWeights'
  | 'plugWeights'
  | 'seatWeights'
  | 'stemFixedPrices'
  | 'cageWeights'
  | 'sealRingPrices'
  | 'actuatorModels'
  | 'handwheelPrices';

interface CollectionInfo {
  name: string;
  icon: string;
  color: string;
  gradient: string;
}

const COLLECTIONS: Record<CollectionType, CollectionInfo> = {
  materials: { name: 'Materials', icon: '🔩', color: 'blue', gradient: 'from-blue-500 to-blue-600' },
  series: { name: 'Series', icon: '📋', color: 'green', gradient: 'from-green-500 to-green-600' },
  bodyWeights: { name: 'Body Weights', icon: '⚖️', color: 'purple', gradient: 'from-purple-500 to-purple-600' },
  bonnetWeights: { name: 'Bonnet Weights', icon: '🔧', color: 'pink', gradient: 'from-pink-500 to-pink-600' },
  plugWeights: { name: 'Plug Weights', icon: '🔌', color: 'orange', gradient: 'from-orange-500 to-orange-600' },
  seatWeights: { name: 'Seat Weights', icon: '💺', color: 'teal', gradient: 'from-teal-500 to-teal-600' },
  stemFixedPrices: { name: 'Stem Prices', icon: '💰', color: 'yellow', gradient: 'from-yellow-500 to-yellow-600' },
  cageWeights: { name: 'Cage Weights', icon: '🏗️', color: 'red', gradient: 'from-red-500 to-red-600' },
  sealRingPrices: { name: 'Seal Ring Prices', icon: '💍', color: 'indigo', gradient: 'from-indigo-500 to-indigo-600' },
  actuatorModels: { name: 'Actuator Models', icon: '⚙️', color: 'cyan', gradient: 'from-cyan-500 to-cyan-600' },
  handwheelPrices: { name: 'Handwheel Prices', icon: '🎡', color: 'amber', gradient: 'from-amber-500 to-amber-600' },
};

const ITEMS_PER_PAGE = 10;

export default function PricingPage() {
  const [stats, setStats] = useState<Record<string, { total: number; active: number; inactive: number }>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Data Viewing State
  const [selectedCollection, setSelectedCollection] = useState<CollectionType>('materials');
  const [collectionData, setCollectionData] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Series mapping for display (seriesId -> seriesNumber)
  const [seriesMap, setSeriesMap] = useState<Map<string, string>>(new Map());

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [savingEdit, setSavingEdit] = useState(false);


  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchCollectionData(selectedCollection);
    setShowAll(false);
    setSearchTerm('');
  }, [selectedCollection]);

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
        stemFixedPrices,
        cageWeights,
        sealRingPrices,
        actuatorModels,
        handwheelPrices,
      ] = await Promise.all([
        getAllMaterials(),
        getAllSeries(),
        getAllBodyWeights(),
        getAllBonnetWeights(),
        getAllPlugWeights(),
        getAllSeatWeights(),
        getAllStemFixedPrices(),
        getAllCageWeights(),
        getAllSealRingPrices(),
        getAllActuatorModels(),
        getAllHandwheelPrices(),
      ]);

      // Build series map: seriesId -> seriesNumber
      const newSeriesMap = new Map<string, string>();
      series.forEach((s: any) => {
        newSeriesMap.set(s.id, s.seriesNumber);
      });
      setSeriesMap(newSeriesMap);

      const calculateStats = (items: any[]) => ({
        total: items.length,
        active: items.filter(i => i.isActive !== false).length,
        inactive: items.filter(i => i.isActive === false).length,
      });

      setStats({
        materials: calculateStats(materials),
        series: calculateStats(series),
        bodyWeights: calculateStats(bodyWeights),
        bonnetWeights: calculateStats(bonnetWeights),
        plugWeights: calculateStats(plugWeights),
        seatWeights: calculateStats(seatWeights),
        stemFixedPrices: calculateStats(stemFixedPrices),
        cageWeights: calculateStats(cageWeights),
        sealRingPrices: calculateStats(sealRingPrices),
        actuatorModels: calculateStats(actuatorModels),
        handwheelPrices: calculateStats(handwheelPrices),
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollectionData = async (type: CollectionType) => {
    setLoadingData(true);
    try {
      let data: any[] = [];
      switch (type) {
        case 'materials': data = await getAllMaterials(); break;
        case 'series': data = await getAllSeries(); break;
        case 'bodyWeights': data = await getAllBodyWeights(); break;
        case 'bonnetWeights': data = await getAllBonnetWeights(); break;
        case 'plugWeights': data = await getAllPlugWeights(); break;
        case 'seatWeights': data = await getAllSeatWeights(); break;
        case 'stemFixedPrices': data = await getAllStemFixedPrices(); break;
        case 'cageWeights': data = await getAllCageWeights(); break;
        case 'sealRingPrices': data = await getAllSealRingPrices(); break;
        case 'actuatorModels': data = await getAllActuatorModels(); break;
        case 'handwheelPrices': data = await getAllHandwheelPrices(); break;
      }
      setCollectionData(data);
    } catch (error) {
      console.error('Error fetching collection data:', error);
      setCollectionData([]);
    } finally {
      setLoadingData(false);
    }
  };

  const handleDownloadTemplate = () => {
    generateExcelTemplate();
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      const [
        materials,
        series,
        bodyWeights,
        bonnetWeights,
        plugWeights,
        seatWeights,
        stemFixedPrices,
        cageWeights,
        sealRingPrices,
        actuatorModels,
        handwheelPrices,
      ] = await Promise.all([
        getAllMaterials(),
        getAllSeries(),
        getAllBodyWeights(),
        getAllBonnetWeights(),
        getAllPlugWeights(),
        getAllSeatWeights(),
        getAllStemFixedPrices(),
        getAllCageWeights(),
        getAllSealRingPrices(),
        getAllActuatorModels(),
        getAllHandwheelPrices(),
      ]);

      exportPricingDataToExcel({
        materials,
        series,
        bodyWeights,
        bonnetWeights,
        plugWeights,
        seatWeights,
        stemFixedPrices,
        cageWeights,
        sealRingPrices,
        actuatorModels,
        handwheelPrices,
      });

      alert('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data');
    } finally {
      setLoading(false);
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

      if (data.materials.length === 0) throw new Error('No materials found in the Excel file');
      if (data.series.length === 0) throw new Error('No series found in the Excel file');

      setUploadProgress('Merging data into database...');
      await importPricingData(data);

      setUploadProgress('✅ Data merged successfully!');
      await fetchStats();
      await fetchCollectionData(selectedCollection);

      setTimeout(() => {
        setUploadProgress('');
        setUploading(false);
      }, 2000);

      alert('Pricing data merged successfully! No duplicates were created.');
    } catch (error: any) {
      console.error('Import error:', error);
      alert(`Import failed: ${error.message || 'Unknown error'}`);
      setUploading(false);
      setUploadProgress('');
    }

    e.target.value = '';
  };

  const handleClearData = async () => {
    if (!window.confirm('⚠️ Are you sure you want to delete ALL pricing data? This cannot be undone!')) return;
    if (!window.confirm('⚠️⚠️ Really delete EVERYTHING? This is your last chance!')) return;

    setLoading(true);
    try {
      await clearAllPricingData();
      await fetchStats();
      setCollectionData([]);
      alert('✅ All pricing data has been cleared.');
    } catch (error: any) {
      alert(`Failed to clear pricing data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    // Remove id and isActive from form data for editing
    const { id, ...formData } = item;
    setEditFormData(formData);
  };

  const handleCloseEditModal = () => {
    setEditingItem(null);
    setEditFormData({});
  };

  const handleFormFieldChange = (field: string, value: any) => {
    setEditFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    setSavingEdit(true);
    try {
      await updatePricingDocument(selectedCollection, editingItem.id, editFormData);
      await fetchStats();
      await fetchCollectionData(selectedCollection);
      handleCloseEditModal();
      alert('✅ Item updated successfully!');
    } catch (error: any) {
      alert(`Failed to update item: ${error.message}`);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteItem = async (item: any) => {
    if (!window.confirm(`⚠️ Are you sure you want to delete this item? This cannot be undone!`)) return;

    setLoadingData(true);
    try {
      await deletePricingDocument(selectedCollection, item.id);
      await fetchStats();
      await fetchCollectionData(selectedCollection);
      alert('✅ Item deleted successfully!');
    } catch (error: any) {
      alert(`Failed to delete item: ${error.message}`);
    } finally {
      setLoadingData(false);
    }
  };


  const getFilteredData = () => {
    if (!searchTerm) return collectionData;

    return collectionData.filter(item => {
      return Object.values(item).some(val =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  };

  const getDisplayData = () => {
    const filtered = getFilteredData();
    return showAll ? filtered : filtered.slice(0, ITEMS_PER_PAGE);
  };

  const renderTable = () => {
    if (loadingData) {
      return (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading data...</p>
        </div>
      );
    }

    const filteredData = getFilteredData();
    const displayData = getDisplayData();

    if (filteredData.length === 0) {
      return (
        <div className="p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'No items match your search criteria.' : 'This collection is empty. Import data to get started.'}
          </p>
        </div>
      );
    }

    // Get headers from first item, excluding internal fields
    const firstItem = displayData[0];
    const headers = Object.keys(firstItem).filter(k => k !== 'id' && k !== 'isActive');

    return (
      <div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                {headers.map(header => {
                  // Display "Series Number" instead of "Series Id"
                  let headerLabel = header.replace(/([A-Z])/g, ' $1').trim();
                  if (header === 'seriesId') {
                    headerLabel = 'Series Number';
                  }

                  return (
                    <th key={header} className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      {headerLabel}
                    </th>
                  );
                })}
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayData.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-gray-50 transition-colors">
                  {headers.map(header => {
                    let displayValue = item[header];

                    // If this is a seriesId field, show the series number instead
                    if (header === 'seriesId' && displayValue) {
                      displayValue = seriesMap.get(displayValue) || displayValue;
                    }

                    return (
                      <td key={`${item.id}-${header}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {typeof item[header] === 'boolean' ? (item[header] ? '✓ Yes' : '✗ No') : (displayValue || '-')}
                      </td>
                    );
                  })}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.isActive !== false
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}>
                      {item.isActive !== false ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-medium"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item)}
                        className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-xs font-medium"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* View More Button */}
        {filteredData.length > ITEMS_PER_PAGE && (
          <div className="mt-6 text-center pb-6">
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all"
            >
              {showAll ? (
                <>
                  <span>Show Less</span>
                  <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </>
              ) : (
                <>
                  <span>View More ({filteredData.length - ITEMS_PER_PAGE} more items)</span>
                  <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
        <p className="text-gray-600">Loading pricing data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">💰 Pricing Data Management</h1>
        <p className="text-purple-100">Manage product pricing, materials, and specifications with ease</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {Object.entries(stats).map(([key, value]) => {
          const collectionKey = key as CollectionType;
          const info = COLLECTIONS[collectionKey];
          return (
            <div
              key={key}
              className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-5 cursor-pointer border-2 ${selectedCollection === key ? `border-${info.color}-500` : 'border-transparent'
                }`}
              onClick={() => setSelectedCollection(collectionKey)}
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${info.gradient} flex items-center justify-center text-2xl mb-3 shadow-md`}>
                {info.icon}
              </div>
              <p className="text-xs text-gray-500 uppercase mb-1 font-medium">{info.name}</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">{value.total}</p>
              <div className="flex items-center text-xs space-x-3">
                <span className="text-green-600">✓ {value.active}</span>
                {value.inactive > 0 && <span className="text-red-600">✗ {value.inactive}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Download & Export */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-6 border border-blue-200">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center text-2xl mr-4">
              📥
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Download & Export</h3>
              <p className="text-sm text-gray-600">Get templates and export current data</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleDownloadTemplate} className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-medium shadow-md hover:shadow-lg transition-all">
              📄 Download Template
            </button>
            <button onClick={handleExportData} className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 font-medium shadow-md hover:shadow-lg transition-all">
              📤 Export Data
            </button>
          </div>
        </div>

        {/* Upload */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-6 border border-green-200">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center text-2xl mr-4">
              📤
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Upload Data (Smart Merge)</h3>
              <p className="text-sm text-gray-600">Updates existing records, adds new ones</p>
            </div>
          </div>
          {uploading ? (
            <div className="bg-white rounded-lg p-4 border border-green-300">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-200 border-t-green-600 mr-3"></div>
                <span className="text-green-700 font-medium">{uploadProgress}</span>
              </div>
            </div>
          ) : (
            <label className="block bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 cursor-pointer text-center font-medium shadow-md hover:shadow-lg transition-all">
              ⬆️ Upload Excel File
              <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" />
            </label>
          )}
        </div>
      </div>

      {/* Data Viewer */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${COLLECTIONS[selectedCollection].gradient} flex items-center justify-center text-xl mr-3`}>
                {COLLECTIONS[selectedCollection].icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{COLLECTIONS[selectedCollection].name}</h3>
                <p className="text-sm text-gray-600">{getFilteredData().length} records</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 md:w-64">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {/* Collection Selector */}
              <select
                value={selectedCollection}
                onChange={(e) => setSelectedCollection(e.target.value as CollectionType)}
                className="border-gray-300 rounded-lg shadow-sm focus:border-purple-500 focus:ring-purple-500 font-medium"
              >
                {Object.entries(COLLECTIONS).map(([key, info]) => (
                  <option key={key} value={key}>{info.icon} {info.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {renderTable()}
      </div>

      {/* Danger Zone */}
      <div className="bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-500 p-6 rounded-lg shadow-sm">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-lg bg-red-500 flex items-center justify-center text-2xl">
              ⚠️
            </div>
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-bold text-red-900 mb-2">Danger Zone</h3>
            <p className="text-red-700 text-sm mb-4">Permanently delete ALL pricing data. This action cannot be undone!</p>
            <button onClick={handleClearData} className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium shadow-md hover:shadow-lg transition-all">
              🗑️ Clear All Data
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white">✏️ Edit {COLLECTIONS[selectedCollection].name}</h2>
              <p className="text-blue-100 text-sm mt-1">Update the values below</p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {Object.keys(editFormData).map((field) => {
                const value = editFormData[field];
                const isBoolean = typeof value === 'boolean';
                const isNumber = typeof value === 'number' && !isBoolean;
                const isSeriesId = field === 'seriesId';

                // Display label
                let fieldLabel = field.replace(/([A-Z])/g, ' $1').trim();
                if (isSeriesId) {
                  fieldLabel = 'Series Number';
                }

                return (
                  <div key={field}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {fieldLabel}
                    </label>
                    {isBoolean ? (
                      <select
                        value={String(value)}
                        onChange={(e) => handleFormFieldChange(field, e.target.value === 'true')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="true">✓ Yes / Active</option>
                        <option value="false">✗ No / Inactive</option>
                      </select>
                    ) : isSeriesId ? (
                      <select
                        value={value}
                        onChange={(e) => handleFormFieldChange(field, e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {Array.from(seriesMap.entries()).map(([id, number]) => (
                          <option key={id} value={id}>
                            {number}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={isNumber ? 'number' : 'text'}
                        value={value}
                        onChange={(e) => handleFormFieldChange(field, isNumber ? parseFloat(e.target.value) || 0 : e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        step={isNumber ? 'any' : undefined}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={handleCloseEditModal}
                disabled={savingEdit}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {savingEdit ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  '💾 Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}