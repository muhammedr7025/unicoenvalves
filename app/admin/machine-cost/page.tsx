'use client';

import { useEffect, useState } from 'react';
import {
    getAllMachineRates,
    getAllMachiningHours,
    importPricingData,
} from '@/lib/firebase/pricingService';
import { generateMachineCostTemplate, parseMachineCostExcel } from '@/utils/excelTemplate';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import * as XLSX from 'xlsx';

export default function MachineCostPage() {
    const [stats, setStats] = useState({
        machineRates: 0,
        machiningHours: 0,
    });
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');

    // Viewer States
    const [activeTab, setActiveTab] = useState<string>('machineRates');

    // Data States
    const [machineRatesData, setMachineRatesData] = useState<any[]>([]);
    const [machiningHoursData, setMachiningHoursData] = useState<any[]>([]);

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
            const [machineRates, machiningHours] = await Promise.all([
                getAllMachineRates(),
                getAllMachiningHours(),
            ]);

            setMachineRatesData(machineRates);
            setMachiningHoursData(machiningHours);

            setStats({
                machineRates: machineRates.length,
                machiningHours: machiningHours.length,
            });

        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadTemplate = () => {
        generateMachineCostTemplate();
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setUploadProgress('Parsing file...');

        try {
            const data = await parseMachineCostExcel(file);

            setUploadProgress('Importing data...');
            // We reuse importPricingData because it merges data based on keys
            // We just pass an object with only the relevant keys
            const importPayload = {
                materials: [],
                series: [],
                bodyWeights: [],
                bonnetWeights: [],
                plugWeights: [],
                seatWeights: [],
                stemFixedPrices: [],
                cageWeights: [],
                sealRingPrices: [],
                actuatorModels: [],
                handwheelPrices: [],
                machineRates: data.machineRates,
                machiningHours: data.machiningHours,
            };

            const result = await importPricingData(importPayload);

            alert(`Import successful!\nAdded: ${result.added}\nUpdated: ${result.updated}\nErrors: ${result.errors}`);
            fetchStats(); // Refresh data
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload data. Please check the file format.');
        } finally {
            setUploading(false);
            setUploadProgress('');
            if (event.target) event.target.value = ''; // Reset input
        }
    };

    const handleExportData = () => {
        const wb = XLSX.utils.book_new();

        // Machine Rates
        const machineRatesSheet = machineRatesData.map(m => ({
            'Machine Name': m.name,
            'Rate Per Hour': m.ratePerHour,
            'Active': m.isActive ? 'TRUE' : 'FALSE'
        }));
        const ws1 = XLSX.utils.json_to_sheet(machineRatesSheet);
        XLSX.utils.book_append_sheet(wb, ws1, 'Machine Rates');

        // Machining Hours
        const machiningHoursSheet = machiningHoursData.map(m => ({
            'Series Number': m.seriesId, // Note: seriesId in DB stores seriesNumber usually, verify this
            'Size': m.size,
            'Rating': m.rating,
            'Part Type': m.partType,
            'Trim Type': m.trimType || '',
            'Hours': m.hours,
            'Active': m.isActive ? 'TRUE' : 'FALSE'
        }));
        const ws2 = XLSX.utils.json_to_sheet(machiningHoursSheet);
        XLSX.utils.book_append_sheet(wb, ws2, 'Machining Hours');

        XLSX.writeFile(wb, 'Unicorn_Machine_Cost_Data.xlsx');
    };

    const getFilteredData = () => {
        const term = searchTerm.toLowerCase();
        switch (activeTab) {
            case 'machineRates': return machineRatesData.filter(m => m.name?.toLowerCase().includes(term));
            case 'machiningHours': return machiningHoursData.filter(m => m.seriesId?.includes(term) || m.partType?.toLowerCase().includes(term));
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
        { id: 'machineRates', label: 'Machine Rates', count: machineRatesData.length },
        { id: 'machiningHours', label: 'Machining Hours', count: machiningHoursData.length },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Machine Cost Management</h1>
                <p className="text-gray-600">Manage machine rates and machining hours separately</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Machine Rates</p>
                        <span className="text-2xl">⚙️</span>
                    </div>
                    <p className="text-3xl font-bold text-indigo-600">{stats.machineRates}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Machining Hours</p>
                        <span className="text-2xl">⏱️</span>
                    </div>
                    <p className="text-3xl font-bold text-indigo-600">{stats.machiningHours}</p>
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Download Template */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-start">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Download Template</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Get blank Excel template for Machine Cost data.
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

                {/* Export Data */}
                <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-purple-200">
                    <div className="flex items-start">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Export Data
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Download current machine cost data to Excel.
                            </p>
                            <button
                                onClick={handleExportData}
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
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Data</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Upload filled Excel template.
                            </p>

                            {uploading ? (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                                        <span className="text-green-700 font-medium">{uploadProgress}</span>
                                    </div>
                                </div>
                            ) : (
                                <label className="cursor-pointer bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium inline-block">
                                    <span>Select Excel File</span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".xlsx, .xls"
                                        onChange={handleFileUpload}
                                    />
                                </label>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Viewer */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${activeTab === tab.id
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab.label}
                                <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-900'
                                    }`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder={`Search ${activeTab === 'machineRates' ? 'machines' : 'machining hours'}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {activeTab === 'machineRates' && (
                                    <>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Machine Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate (₹/hr)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </>
                                )}
                                {activeTab === 'machiningHours' && (
                                    <>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Series</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trim Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {visibleData.map((item: any) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    {activeTab === 'machineRates' && (
                                        <>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{item.ratePerHour?.toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {item.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                        </>
                                    )}
                                    {activeTab === 'machiningHours' && (
                                        <>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.seriesId}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.size}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.rating}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.partType}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.trimType || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.hours}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {item.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* View More Button */}
                {filteredData.length > visibleCount && (
                    <div className="mt-6 text-center mb-6">
                        <button
                            onClick={() => setVisibleCount(prev => prev + 20)}
                            className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold py-2 px-6 rounded-lg transition-colors border border-purple-200"
                        >
                            View More ({filteredData.length - visibleCount} remaining)
                        </button>
                    </div>
                )}

                {/* No Results */}
                {filteredData.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No results found for "{searchTerm}"</p>
                    </div>
                )}
            </div>
        </div>
    );
}
