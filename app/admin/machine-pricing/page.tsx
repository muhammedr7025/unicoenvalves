'use client';

import { useState, useEffect, useRef } from 'react';
import {
    getAllMachiningPrices,
    addMachiningPrice,
    updateMachiningPrice,
    deleteMachiningPrice,
    bulkImportMachiningPrices,
} from '@/lib/firebase/machiningPriceService';
import { MachiningPrice, MachiningComponentType } from '@/types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import * as XLSX from 'xlsx';

export default function MachinePricingPage() {
    const [activeTab, setActiveTab] = useState<MachiningComponentType | 'All'>('All');

    // Machining Prices State
    const [machiningPrices, setMachiningPrices] = useState<MachiningPrice[]>([]);
    const [filteredPrices, setFilteredPrices] = useState<MachiningPrice[]>([]);
    const [editingPrice, setEditingPrice] = useState<MachiningPrice | null>(null);
    const [series, setSeries] = useState<any[]>([]);
    const [materials, setMaterials] = useState<any[]>([]);

    // New Price Form State
    const [newPrice, setNewPrice] = useState({
        component: 'Body' as MachiningComponentType,
        seriesId: '',
        size: '',
        rating: '',
        typeKey: '', // endConnectType/bonnetType/trimType
        materialName: '',
        fixedPrice: 0,
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // File upload ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Component options (Seal Ring excluded - no machining)
    const componentOptions: MachiningComponentType[] = ['Body', 'Bonnet', 'Plug', 'Seat', 'Stem', 'Cage'];

    // Type key labels
    const getTypeKeyLabel = (component: MachiningComponentType) => {
        if (component === 'Body') return 'End Connect Type';
        if (component === 'Bonnet') return 'Bonnet Type';
        return 'Trim Type';
    };

    // Type options based on component
    const getTypeOptions = (component: MachiningComponentType) => {
        if (component === 'Body') {
            return ['Flanged', 'Butt Weld', 'Socket Weld', 'Threaded'];
        }
        if (component === 'Bonnet') {
            return ['Type1', 'Type2', 'Type3'];
        }
        // For Plug, Seat, Stem, Cage - trimType
        return ['Metal Seated', 'Soft Seated', 'Hard Faced', 'PTFE Seated', 'Ceramic Seated'];
    };

    // Load data
    useEffect(() => {
        loadMachiningPrices();
        loadSeries();
        loadMaterials();
    }, []);

    // Filter by component
    useEffect(() => {
        if (activeTab === 'All') {
            setFilteredPrices(machiningPrices);
        } else {
            setFilteredPrices(machiningPrices.filter(p => p.component === activeTab));
        }
    }, [activeTab, machiningPrices]);

    const loadMachiningPrices = async () => {
        const data = await getAllMachiningPrices();
        setMachiningPrices(data);
    };

    const loadSeries = async () => {
        const snapshot = await getDocs(collection(db, 'series'));
        const seriesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSeries(seriesData);
    };

    const loadMaterials = async () => {
        const snapshot = await getDocs(collection(db, 'materials'));
        const materialsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMaterials(materialsData.filter((m: any) => m.isActive));
    };

    // Add new machining price
    const handleAddPrice = async () => {
        if (!newPrice.seriesId || !newPrice.size || !newPrice.rating ||
            !newPrice.typeKey || !newPrice.materialName || newPrice.fixedPrice <= 0) {
            setMessage('Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            await addMachiningPrice({
                ...newPrice,
                isActive: true,
            });
            setMessage('Machining price added successfully!');
            setNewPrice({
                component: 'Body',
                seriesId: '',
                size: '',
                rating: '',
                typeKey: '',
                materialName: '',
                fixedPrice: 0,
            });
            loadMachiningPrices();
        } catch (error) {
            setMessage('Error adding machining price');
        }
        setLoading(false);
    };

    // Update machining price
    const handleUpdatePrice = async () => {
        if (!editingPrice) return;

        setLoading(true);
        try {
            await updateMachiningPrice(editingPrice.id, {
                fixedPrice: editingPrice.fixedPrice,
            });
            setMessage('Machining price updated successfully!');
            setEditingPrice(null);
            loadMachiningPrices();
        } catch (error) {
            setMessage('Error updating machining price');
        }
        setLoading(false);
    };

    // Delete machining price
    const handleDeletePrice = async (id: string) => {
        if (!confirm('Are you sure you want to delete this machining price?')) return;

        setLoading(true);
        try {
            await deleteMachiningPrice(id);
            setMessage('Machining price deleted successfully!');
            loadMachiningPrices();
        } catch (error) {
            setMessage('Error deleting machining price');
        }
        setLoading(false);
    };

    // Download template
    const handleDownloadTemplate = () => {
        const templateData = [
            {
                Component: 'Body',
                SeriesNumber: '100',
                Size: '2"',
                Rating: '150#',
                TypeKey: 'Flanged',
                MaterialName: 'SS316',
                FixedPrice: 5000,
            },
            {
                Component: 'Bonnet',
                SeriesNumber: '100',
                Size: '2"',
                Rating: '150#',
                TypeKey: 'Type1',
                MaterialName: 'SS316',
                FixedPrice: 3000,
            },
            {
                Component: 'Plug',
                SeriesNumber: '100',
                Size: '2"',
                Rating: '150#',
                TypeKey: 'Metal Seated',
                MaterialName: 'SS316',
                FixedPrice: 2000,
            },
        ];

        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Machining Prices');
        XLSX.writeFile(wb, 'machining_prices_template.xlsx');
        setMessage('Template downloaded!');
    };

    // Export current data
    const handleExportData = () => {
        const exportData = machiningPrices.map(p => {
            const seriesData = series.find(s => s.id === p.seriesId);
            return {
                Component: p.component,
                SeriesNumber: seriesData?.seriesNumber || p.seriesId,
                Size: p.size,
                Rating: p.rating,
                TypeKey: p.typeKey,
                MaterialName: p.materialName,
                FixedPrice: p.fixedPrice,
            };
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Machining Prices');
        XLSX.writeFile(wb, 'machining_prices_export.xlsx');
        setMessage('Data exported!');
    };

    // Import from file
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setMessage('Importing data...');

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet) as any[];

            // Map series numbers to IDs
            const seriesMap = new Map(series.map(s => [s.seriesNumber, s.id]));

            const pricesToImport = rows.map(row => ({
                component: row.Component as MachiningComponentType,
                seriesId: seriesMap.get(row.SeriesNumber) || row.SeriesNumber,
                size: row.Size,
                rating: row.Rating,
                typeKey: row.TypeKey,
                materialName: row.MaterialName,
                fixedPrice: parseFloat(row.FixedPrice),
                isActive: true,
            }));

            const result = await bulkImportMachiningPrices(pricesToImport);
            setMessage(`Imported ${result.success} prices. ${result.failed} failed.`);

            if (result.errors.length > 0) {
                console.error('Import errors:', result.errors);
            }

            loadMachiningPrices();
        } catch (error: any) {
            setMessage(`Import error: ${error.message}`);
        }

        setLoading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Clear all data
    const handleClearAllData = async () => {
        if (!confirm('Delete ALL machining prices? This cannot be undone.')) return;
        if (!confirm('Are you absolutely sure?')) return;

        setLoading(true);
        try {
            for (const price of machiningPrices) {
                await deleteMachiningPrice(price.id);
            }
            setMessage(`Deleted ${machiningPrices.length} prices`);
            loadMachiningPrices();
        } catch (error) {
            setMessage('Error clearing data');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-gray-800">💰 Fixed Machining Prices</h1>

                {message && (
                    <div className="mb-6 p-4 bg-blue-100 border border-blue-300 rounded-lg">
                        {message}
                        <button onClick={() => setMessage('')} className="ml-4 text-blue-800 hover:underline">
                            ✕
                        </button>
                    </div>
                )}

                {/* Component Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('All')}
                        className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === 'All'
                            ? 'bg-purple-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        All ({machiningPrices.length})
                    </button>
                    {componentOptions.map(comp => (
                        <button
                            key={comp}
                            onClick={() => setActiveTab(comp)}
                            className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === comp
                                ? 'bg-purple-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {comp} ({machiningPrices.filter(p => p.component === comp).length})
                        </button>
                    ))}
                </div>

                {/* Import/Export Actions */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">📊 Import / Export</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <button
                            onClick={handleDownloadTemplate}
                            className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700"
                        >
                            📥 Download Template
                        </button>
                        <button
                            onClick={handleExportData}
                            className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700"
                            disabled={machiningPrices.length === 0}
                        >
                            📤 Export Data
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={loading}
                            className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
                        >
                            📁 {loading ? 'Importing...' : 'Bulk Import'}
                        </button>
                        <button
                            onClick={handleClearAllData}
                            disabled={loading || machiningPrices.length === 0}
                            className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                        >
                            🗑️ Clear All
                        </button>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                </div>

                {/* Add New Price */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-2xl font-bold mb-4">➕ Add New Machining Price</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Component *</label>
                            <select
                                value={newPrice.component}
                                onChange={(e) => setNewPrice({
                                    ...newPrice,
                                    component: e.target.value as MachiningComponentType,
                                    typeKey: '' // Reset type when component changes
                                })}
                                className="w-full px-4 py-2 border rounded-lg"
                            >
                                {componentOptions.map((comp) => (
                                    <option key={comp} value={comp}>{comp}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Series *</label>
                            <select
                                value={newPrice.seriesId}
                                onChange={(e) => setNewPrice({ ...newPrice, seriesId: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg"
                            >
                                <option value="">Select Series</option>
                                {series.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.seriesNumber} - {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Size *</label>
                            <input
                                type="text"
                                value={newPrice.size}
                                onChange={(e) => setNewPrice({ ...newPrice, size: e.target.value })}
                                placeholder='e.g., 2"'
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Rating *</label>
                            <input
                                type="text"
                                value={newPrice.rating}
                                onChange={(e) => setNewPrice({ ...newPrice, rating: e.target.value })}
                                placeholder="e.g., 150#"
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                {getTypeKeyLabel(newPrice.component)} *
                            </label>
                            <select
                                value={newPrice.typeKey}
                                onChange={(e) => setNewPrice({ ...newPrice, typeKey: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg"
                            >
                                <option value="">Select Type</option>
                                {getTypeOptions(newPrice.component).map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Material Name *</label>
                            <select
                                value={newPrice.materialName}
                                onChange={(e) => setNewPrice({ ...newPrice, materialName: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg"
                            >
                                <option value="">Select Material</option>
                                {materials.map((m: any) => (
                                    <option key={m.id} value={m.name}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Fixed Price (₹) *</label>
                            <input
                                type="number"
                                value={newPrice.fixedPrice}
                                onChange={(e) => setNewPrice({ ...newPrice, fixedPrice: parseFloat(e.target.value) || 0 })}
                                placeholder="e.g., 5000"
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleAddPrice}
                        disabled={loading}
                        className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                    >
                        {loading ? 'Adding...' : 'Add Machining Price'}
                    </button>
                </div>

                {/* Prices Table */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">
                        Machining Prices ({filteredPrices.length})
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-3 py-2 text-left">Component</th>
                                    <th className="px-3 py-2 text-left">Series</th>
                                    <th className="px-3 py-2 text-left">Size</th>
                                    <th className="px-3 py-2 text-left">Rating</th>
                                    <th className="px-3 py-2 text-left">Type</th>
                                    <th className="px-3 py-2 text-left">Material</th>
                                    <th className="px-3 py-2 text-left">Price</th>
                                    <th className="px-3 py-2 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPrices.map((price) => {
                                    const seriesData = series.find((s) => s.id === price.seriesId);
                                    return (
                                        <tr key={price.id} className="border-b hover:bg-gray-50">
                                            <td className="px-3 py-2">
                                                <span className={`px-2 py-1 rounded text-xs ${price.component === 'Body' ? 'bg-blue-100 text-blue-800' :
                                                        price.component === 'Bonnet' ? 'bg-blue-100 text-blue-800' :
                                                            price.component === 'Plug' ? 'bg-purple-100 text-purple-800' :
                                                                price.component === 'Seat' ? 'bg-pink-100 text-pink-800' :
                                                                    price.component === 'Stem' ? 'bg-orange-100 text-orange-800' :
                                                                        'bg-green-100 text-green-800'
                                                    }`}>
                                                    {price.component}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2">{seriesData?.seriesNumber || price.seriesId}</td>
                                            <td className="px-3 py-2">{price.size}</td>
                                            <td className="px-3 py-2">{price.rating}</td>
                                            <td className="px-3 py-2">{price.typeKey}</td>
                                            <td className="px-3 py-2">{price.materialName}</td>
                                            <td className="px-3 py-2 font-semibold">
                                                {editingPrice?.id === price.id ? (
                                                    <input
                                                        type="number"
                                                        value={editingPrice.fixedPrice}
                                                        onChange={(e) => setEditingPrice({
                                                            ...editingPrice,
                                                            fixedPrice: parseFloat(e.target.value) || 0
                                                        })}
                                                        className="w-24 px-2 py-1 border rounded"
                                                    />
                                                ) : (
                                                    `₹${price.fixedPrice.toLocaleString()}`
                                                )}
                                            </td>
                                            <td className="px-3 py-2">
                                                {editingPrice?.id === price.id ? (
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={handleUpdatePrice}
                                                            className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingPrice(null)}
                                                            className="bg-gray-600 text-white px-2 py-1 rounded text-xs"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => setEditingPrice(price)}
                                                            className="bg-yellow-600 text-white px-2 py-1 rounded text-xs"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeletePrice(price.id)}
                                                            className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {filteredPrices.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No machining prices found. Add some using the form above or import from Excel.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
