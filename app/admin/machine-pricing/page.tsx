'use client';

import { useState, useEffect, useRef } from 'react';
import {
    getMachineTypes,
    getWorkHours,
    addMachineType,
    updateMachineType,
    deleteMachineType,
    addWorkHourData,
    updateWorkHourData,
    deleteWorkHourData,
    bulkImportMachineTypes,
    bulkImportWorkHours,
} from '@/lib/firebase/machinePricingService';
import { MachineType, WorkHourData, ComponentType } from '@/types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
    generateMachinePricingTemplate,
    exportMachinePricingData,
    parseMachinePricingExcel,
} from '@/utils/machinePricingExcel';

export default function MachinePricingPage() {
    const [activeTab, setActiveTab] = useState<'machines' | 'workhours'>('machines');

    // Machine Types State
    const [machineTypes, setMachineTypes] = useState<MachineType[]>([]);
    const [editingMachine, setEditingMachine] = useState<MachineType | null>(null);
    const [newMachineName, setNewMachineName] = useState('');
    const [newMachineRate, setNewMachineRate] = useState(0);

    // Work Hours State
    const [workHours, setWorkHours] = useState<WorkHourData[]>([]);
    const [filteredWorkHours, setFilteredWorkHours] = useState<WorkHourData[]>([]);
    const [filterComponent, setFilterComponent] = useState<ComponentType | 'All'>('All');
    const [editingWorkHour, setEditingWorkHour] = useState<WorkHourData | null>(null);
    const [series, setSeries] = useState<any[]>([]);

    // New Work Hour Form State
    const [newWorkHour, setNewWorkHour] = useState({
        seriesId: '',
        size: '',
        rating: '',
        trimType: '',
        component: 'Body' as ComponentType,
        workHours: 0,
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // File upload ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Import/Export handlers
    const handleDownloadTemplate = () => {
        generateMachinePricingTemplate();
        setMessage('Template downloaded successfully!');
    };

    const handleExportData = () => {
        const seriesMap = new Map(series.map((s) => [s.id, { seriesNumber: s.seriesNumber, name: s.name }]));
        exportMachinePricingData(machineTypes, workHours, seriesMap);
        setMessage('Data exported successfully!');
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setMessage('Importing data...');

        try {
            const seriesMap = new Map(series.map((s) => [s.seriesNumber, { id: s.id, seriesNumber: s.seriesNumber }]));
            const { machineTypes: importedMachines, workHours: importedWorkHours, errors } =
                await parseMachinePricingExcel(file, seriesMap);

            console.log('📊 Import Summary:');
            console.log(`- Machine Types to import: ${importedMachines.length}`);
            console.log(`- Work Hours to import: ${importedWorkHours.length}`);
            console.log(`- Parsing errors: ${errors.length}`);

            if (errors.length > 0) {
                console.error('❌ Parsing errors:', errors);
            }

            // Import machine types first
            let machineResult = { success: 0, failed: 0, errors: [] as string[] };
            if (importedMachines.length > 0) {
                machineResult = await bulkImportMachineTypes(importedMachines);
                console.log(`✅ Machine Types: ${machineResult.success} imported, ${machineResult.failed} failed`);
                await loadMachineTypes(); // Reload to get IDs
            }

            // Import work hours directly (no machine type mapping needed)
            let workHourResult = { success: 0, failed: 0, errors: [] as string[] };
            if (importedWorkHours.length > 0) {
                workHourResult = await bulkImportWorkHours(importedWorkHours);
                console.log(`✅ Work Hours: ${workHourResult.success} imported, ${workHourResult.failed} failed`);
                await loadWorkHours();
            }

            // Combine all errors
            const allErrors = [...errors, ...machineResult.errors, ...workHourResult.errors];

            // Show detailed message
            if (allErrors.length > 0) {
                const errorMessage = allErrors.join('\n');
                setMessage(`Import completed with errors. See details below.`);
                alert(`❌ Import Errors:\n\n${errorMessage}`);
                console.error('All import errors:', allErrors);
            } else {
                setMessage(
                    `✅ Import successful! Added ${machineResult.success} machine types and ${workHourResult.success} work hour entries.`
                );
            }
        } catch (error: any) {
            const errorMsg = `Error importing data: ${error.message || 'Unknown error'}`;
            setMessage(errorMsg);
            console.error('Import error:', error);
            alert(errorMsg);
        }

        setLoading(false);
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Load data
    useEffect(() => {
        loadMachineTypes();
        loadWorkHours();
        loadSeries();
    }, []);

    useEffect(() => {
        if (filterComponent === 'All') {
            setFilteredWorkHours(workHours);
        } else {
            setFilteredWorkHours(workHours.filter(wh => wh.component === filterComponent));
        }
    }, [filterComponent, workHours]);

    const loadMachineTypes = async () => {
        const data = await getMachineTypes();
        setMachineTypes(data);
    };

    const loadWorkHours = async () => {
        const data = await getWorkHours();
        setWorkHours(data);
    };

    const loadSeries = async () => {
        const snapshot = await getDocs(collection(db, 'series'));
        const seriesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSeries(seriesData);
    };

    const handleAddMachine = async () => {
        if (!newMachineName || newMachineRate <= 0) {
            setMessage('Please enter valid machine name and rate');
            return;
        }

        setLoading(true);
        try {
            await addMachineType({
                name: newMachineName,
                hourlyRate: newMachineRate,
                isActive: true,
            });
            setMessage('Machine type added successfully!');
            setNewMachineName('');
            setNewMachineRate(0);
            loadMachineTypes();
        } catch (error) {
            setMessage('Error adding machine type');
        }
        setLoading(false);
    };

    const handleUpdateMachine = async () => {
        if (!editingMachine) return;

        setLoading(true);
        try {
            await updateMachineType(editingMachine.id, {
                name: editingMachine.name,
                hourlyRate: editingMachine.hourlyRate,
            });
            setMessage('Machine type updated successfully!');
            setEditingMachine(null);
            loadMachineTypes();
        } catch (error) {
            setMessage('Error updating machine type');
        }
        setLoading(false);
    };

    const handleDeleteMachine = async (id: string) => {
        if (!confirm('Are you sure you want to delete this machine type?')) return;

        setLoading(true);
        try {
            await deleteMachineType(id);
            setMessage('Machine type deleted successfully!');
            loadMachineTypes();
        } catch (error) {
            setMessage('Error deleting machine type');
        }
        setLoading(false);
    };

    const handleAddWorkHour = async () => {
        if (!newWorkHour.seriesId || !newWorkHour.size || !newWorkHour.rating ||
            newWorkHour.workHours <= 0) {
            setMessage('Please fill all required fields');
            return;
        }


        // Validate trimType for components that need it
        const needsTrimType = ['Plug', 'Seat', 'Stem', 'Cage', 'SealRing'].includes(newWorkHour.component);
        if (needsTrimType && !newWorkHour.trimType) {
            setMessage('Trim type is required for this component');
            return;
        }

        setLoading(true);
        try {
            await addWorkHourData({
                ...newWorkHour,
                isActive: true,
            });
            setNewWorkHour({
                seriesId: '',
                size: '',
                rating: '',
                trimType: '',
                component: 'Body',
                workHours: 0,
            });
            loadWorkHours();
        } catch (error) {
            setMessage('Error adding work hour data');
        }
        setLoading(false);
    };

    const handleUpdateWorkHour = async () => {
        if (!editingWorkHour) return;

        setLoading(true);
        try {
            await updateWorkHourData(editingWorkHour.id, {
                seriesId: editingWorkHour.seriesId,
                size: editingWorkHour.size,
                rating: editingWorkHour.rating,
                trimType: editingWorkHour.trimType,
                component: editingWorkHour.component,
                workHours: editingWorkHour.workHours,
                isActive: editingWorkHour.isActive,
            });
            setMessage('Work hour data updated successfully!');
            setEditingWorkHour(null);
            loadWorkHours();
        } catch (error) {
            setMessage('Error updating work hour data');
        }
        setLoading(false);
    };

    const handleDeleteWorkHour = async (id: string) => {
        if (!confirm('Are you sure you want to delete this work hour entry?')) return;

        setLoading(true);
        try {
            await deleteWorkHourData(id);
            setMessage('Work hour data deleted successfully!');
            loadWorkHours();
        } catch (error) {
            setMessage('Error deleting work hour data');
        }
        setLoading(false);
    };

    const componentOptions: ComponentType[] = ['Body', 'Bonnet', 'Plug', 'Seat', 'Stem', 'Cage', 'SealRing'];
    const trimTypeOptions = ['Metal Seated', 'Soft Seated', 'Hard Faced', 'PTFE Seated', 'Ceramic Seated'];

    // Clear all data (both machine types and work hours)
    const handleClearAllData = async () => {
        const confirmed = confirm(
            '⚠️ WARNING: This will delete ALL machine types and work hours data!\n\nAre you absolutely sure you want to continue?'
        );
        if (!confirmed) return;

        const doubleConfirm = confirm(
            'This action cannot be undone easily. Click OK to proceed with deletion.'
        );
        if (!doubleConfirm) return;

        setLoading(true);
        setMessage('Deleting all data...');

        try {
            let deletedMachines = 0;
            let deletedWorkHours = 0;

            // Delete all machine types
            for (const machine of machineTypes) {
                await deleteMachineType(machine.id);
                deletedMachines++;
            }

            // Delete all work hours
            for (const wh of workHours) {
                await deleteWorkHourData(wh.id);
                deletedWorkHours++;
            }

            setMessage(
                `✅ All data cleared! Deleted ${deletedMachines} machine types and ${deletedWorkHours} work hour entries.`
            );

            // Reload to show empty lists
            await loadMachineTypes();
            await loadWorkHours();
        } catch (error) {
            setMessage('❌ Error clearing data. Some items may not have been deleted.');
            console.error('Clear all error:', error);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-gray-800">⚙️ Machine Pricing Management</h1>

                {message && (
                    <div className="mb-6 p-4 bg-blue-100 border border-blue-300 rounded-lg">
                        {message}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex space-x-4 mb-6">
                    <button
                        onClick={() => setActiveTab('machines')}
                        className={`px-6 py-3 rounded-lg font-semibold transition ${activeTab === 'machines'
                            ? 'bg-purple-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        🔧 Machine Types
                    </button>
                    <button
                        onClick={() => setActiveTab('workhours')}
                        className={`px-6 py-3 rounded-lg font-semibold transition ${activeTab === 'workhours'
                            ? 'bg-purple-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        ⏱️ Work Hours Data
                    </button>
                </div>

                {/* Import/Export Actions */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">📊 Import / Export Data</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={handleDownloadTemplate}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center space-x-2"
                        >
                            <span>📥</span>
                            <span>Download Template</span>
                        </button>
                        <button
                            onClick={handleExportData}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center space-x-2"
                            disabled={machineTypes.length === 0 && workHours.length === 0}
                        >
                            <span>📤</span>
                            <span>Export Current Data</span>
                        </button>
                        <button
                            onClick={handleImportClick}
                            disabled={loading}
                            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition flex items-center justify-center space-x-2 disabled:bg-gray-400"
                        >
                            <span>📁</span>
                            <span>{loading ? 'Importing...' : 'Bulk Import'}</span>
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-4">
                        💡 <strong>Tip:</strong> Download the template, fill it with your data, then use Bulk Import to add all entries at once. Data will be merged with existing entries.
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                </div>

                {/* Danger Zone - Clear All Data */}
                <div className="bg-red-50 border-2 border-red-300 rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold mb-2 text-red-800">⚠️ Danger Zone</h2>
                    <p className="text-sm text-red-700 mb-4">
                        Permanently delete all machine pricing data. This action marks all records as inactive.
                    </p>
                    <button
                        onClick={handleClearAllData}
                        disabled={loading || (machineTypes.length === 0 && workHours.length === 0)}
                        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                    >
                        🗑️ Clear All Data ({machineTypes.length} machines, {workHours.length} work hours)
                    </button>
                </div>

                {/* Machine Types Tab */}
                {activeTab === 'machines' && (
                    <div className="space-y-6">
                        {/* Add New Machine */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-2xl font-bold mb-4">Add New Machine Type</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Machine Name</label>
                                    <input
                                        type="text"
                                        value={newMachineName}
                                        onChange={(e) => setNewMachineName(e.target.value)}
                                        placeholder="e.g., CNC Lathe"
                                        className="w-full px-4 py-2 border rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Hourly Rate (₹/hr)</label>
                                    <input
                                        type="number"
                                        value={newMachineRate}
                                        onChange={(e) => setNewMachineRate(parseFloat(e.target.value))}
                                        placeholder="e.g., 500"
                                        className="w-full px-4 py-2 border rounded-lg"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={handleAddMachine}
                                        disabled={loading}
                                        className="w-full bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                                    >
                                        {loading ? 'Adding...' : 'Add Machine'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Machine Types List */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-2xl font-bold mb-4">Machine Types ({machineTypes.length})</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Machine Name</th>
                                            <th className="px-4 py-2 text-left">Hourly Rate</th>
                                            <th className="px-4 py-2 text-left">Status</th>
                                            <th className="px-4 py-2 text-left">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {machineTypes.map((machine) => (
                                            <tr key={machine.id} className="border-b">
                                                <td className="px-4 py-2">
                                                    {editingMachine?.id === machine.id ? (
                                                        <input
                                                            type="text"
                                                            value={editingMachine.name}
                                                            onChange={(e) =>
                                                                setEditingMachine({ ...editingMachine, name: e.target.value })
                                                            }
                                                            className="w-full px-2 py-1 border rounded"
                                                        />
                                                    ) : (
                                                        machine.name
                                                    )}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {editingMachine?.id === machine.id ? (
                                                        <input
                                                            type="number"
                                                            value={editingMachine.hourlyRate}
                                                            onChange={(e) =>
                                                                setEditingMachine({
                                                                    ...editingMachine,
                                                                    hourlyRate: parseFloat(e.target.value),
                                                                })
                                                            }
                                                            className="w-full px-2 py-1 border rounded"
                                                        />
                                                    ) : (
                                                        `₹${machine.hourlyRate}/hr`
                                                    )}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs ${machine.isActive
                                                            ? 'bg-green-200 text-green-800'
                                                            : 'bg-red-200 text-red-800'
                                                            }`}
                                                    >
                                                        {machine.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2">
                                                    {editingMachine?.id === machine.id ? (
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={handleUpdateMachine}
                                                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingMachine(null)}
                                                                className="bg-gray-600 text-white px-3 py-1 rounded text-sm"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => setEditingMachine(machine)}
                                                                className="bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteMachine(machine.id)}
                                                                className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Work Hours Tab */}
                {activeTab === 'workhours' && (
                    <div className="space-y-6">
                        {/* Add New Work Hour */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-2xl font-bold mb-4">Add New Work Hour Data</h2>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Component *</label>
                                    <select
                                        value={newWorkHour.component}
                                        onChange={(e) =>
                                            setNewWorkHour({ ...newWorkHour, component: e.target.value as ComponentType })
                                        }
                                        className="w-full px-4 py-2 border rounded-lg"
                                    >
                                        {componentOptions.map((comp) => (
                                            <option key={comp} value={comp}>
                                                {comp}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Series *</label>
                                    <select
                                        value={newWorkHour.seriesId}
                                        onChange={(e) => setNewWorkHour({ ...newWorkHour, seriesId: e.target.value })}
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
                                        value={newWorkHour.size}
                                        onChange={(e) => setNewWorkHour({ ...newWorkHour, size: e.target.value })}
                                        placeholder='e.g., 1"'
                                        className="w-full px-4 py-2 border rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Rating *</label>
                                    <input
                                        type="text"
                                        value={newWorkHour.rating}
                                        onChange={(e) => setNewWorkHour({ ...newWorkHour, rating: e.target.value })}
                                        placeholder="e.g., 150#"
                                        className="w-full px-4 py-2 border rounded-lg"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {['Plug', 'Seat', 'Stem', 'Cage', 'SealRing'].includes(newWorkHour.component) && (
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Trim Type *</label>
                                        <select
                                            value={newWorkHour.trimType}
                                            onChange={(e) => setNewWorkHour({ ...newWorkHour, trimType: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg"
                                        >
                                            <option value="">Select Trim Type</option>
                                            {trimTypeOptions.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Work Hours *</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={newWorkHour.workHours}
                                        onChange={(e) =>
                                            setNewWorkHour({ ...newWorkHour, workHours: parseFloat(e.target.value) })
                                        }
                                        placeholder="e.g., 2.5"
                                        className="w-full px-4 py-2 border rounded-lg"
                                    />
                                </div>

                                <div className="flex items-end">
                                    <button
                                        onClick={handleAddWorkHour}
                                        disabled={loading}
                                        className="w-full bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                                    >
                                        {loading ? 'Adding...' : 'Add Work Hour'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Filter */}
                        <div className="bg-white rounded-lg shadow-lg p-4">
                            <label className="block text-sm font-medium mb-2">Filter by Component:</label>
                            <select
                                value={filterComponent}
                                onChange={(e) => setFilterComponent(e.target.value as ComponentType | 'All')}
                                className="px-4 py-2 border rounded-lg"
                            >
                                <option value="All">All Components</option>
                                {componentOptions.map((comp) => (
                                    <option key={comp} value={comp}>
                                        {comp}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Work Hours List */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-2xl font-bold mb-4">
                                Work Hours Data ({filteredWorkHours.length})
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-2 py-2 text-left">Component</th>
                                            <th className="px-2 py-2 text-left">Series</th>
                                            <th className="px-2 py-2 text-left">Size</th>
                                            <th className="px-2 py-2 text-left">Rating</th>
                                            <th className="px-2 py-2 text-left">Trim Type</th>
                                            <th className="px-2 py-2 text-left">Hours</th>
                                            <th className="px-2 py-2 text-left">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredWorkHours.map((wh) => {
                                            const seriesData = series.find((s) => s.id === wh.seriesId);
                                            return (
                                                <tr key={wh.id} className="border-b">
                                                    <td className="px-2 py-2">{wh.component}</td>
                                                    <td className="px-2 py-2">{seriesData?.seriesNumber || wh.seriesId}</td>
                                                    <td className="px-2 py-2">{wh.size}</td>
                                                    <td className="px-2 py-2">{wh.rating}</td>
                                                    <td className="px-2 py-2">{wh.trimType || '-'}</td>
                                                    <td className="px-2 py-2">{wh.workHours}hr</td>

                                                    <td className="px-2 py-2">
                                                        <button
                                                            onClick={() => handleDeleteWorkHour(wh.id)}
                                                            className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
