'use client';

import { useEffect, useState } from 'react';
import {
    getAllMaterials,
    getAllSeries,
    getMaterialsByGroup,
    getAllBodyWeights,
    getAllBonnetWeights,
    getAllPlugWeights,
    getAllSeatWeights,
    getAllStemFixedPrices,
    getAllCageWeights,
    getAllSealRingPrices,
    getAllActuatorModels,
    getAllHandwheelPrices,
} from '@/lib/firebase/pricingService';
import { useAuth } from '@/lib/firebase/authContext';

export default function DiagnosticPage() {
    const { user } = useAuth();
    const [diagnostics, setDiagnostics] = useState<any>({
        loading: true,
        user: null,
        materials: [],
        series: [],
        bodyBonnetMats: [],
        plugMats: [],
        seatMats: [],
        stemMats: [],
        cageMats: [],
        errors: [],
    });

    useEffect(() => {
        runDiagnostics();
    }, []);

    const runDiagnostics = async () => {
        const errors: string[] = [];
        const results: any = { loading: false };

        try {
            // Check authentication
            if (!user) {
                errors.push('❌ User not authenticated');
            } else {
                results.user = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                };
            }

            // Check materials
            try {
                const materials = await getAllMaterials();
                results.materials = materials;
                if (materials.length === 0) {
                    errors.push('⚠️ No materials found in database');
                }
            } catch (e: any) {
                errors.push(`❌ Error fetching materials: ${e.message}`);
            }

            // Check series
            try {
                const series = await getAllSeries();
                results.series = series;
                if (series.length === 0) {
                    errors.push('⚠️ No series found in database');
                }
            } catch (e: any) {
                errors.push(`❌ Error fetching series: ${e.message}`);
            }

            // Check materials by group
            try {
                const bodyBonnetMats = await getMaterialsByGroup('BodyBonnet');
                const plugMats = await getMaterialsByGroup('Plug');
                const seatMats = await getMaterialsByGroup('Seat');
                const stemMats = await getMaterialsByGroup('Stem');
                const cageMats = await getMaterialsByGroup('Cage');

                results.bodyBonnetMats = bodyBonnetMats;
                results.plugMats = plugMats;
                results.seatMats = seatMats;
                results.stemMats = stemMats;
                results.cageMats = cageMats;

                if (bodyBonnetMats.length === 0) errors.push('⚠️ No BodyBonnet materials found');
                if (plugMats.length === 0) errors.push('⚠️ No Plug materials found');
                if (seatMats.length === 0) errors.push('⚠️ No Seat materials found');
                if (stemMats.length === 0) errors.push('⚠️ No Stem materials found');
                if (cageMats.length === 0) errors.push('⚠️ No Cage materials found');
            } catch (e: any) {
                errors.push(`❌ Error fetching materials by group: ${e.message}`);
            }

            // NEW: Check weight/price collections
            try {
                const bodyWeights = await getAllBodyWeights();
                const bonnetWeights = await getAllBonnetWeights();
                const plugWeights = await getAllPlugWeights();
                const seatWeights = await getAllSeatWeights();
                const stemPrices = await getAllStemFixedPrices();
                const cageWeights = await getAllCageWeights();
                const sealPrices = await getAllSealRingPrices();
                const actuators = await getAllActuatorModels();
                const handwheels = await getAllHandwheelPrices();

                results.bodyWeights = bodyWeights;
                results.bonnetWeights = bonnetWeights;
                results.plugWeights = plugWeights;
                results.seatWeights = seatWeights;
                results.stemPrices = stemPrices;
                results.cageWeights = cageWeights;
                results.sealPrices = sealPrices;
                results.actuators = actuators;
                results.handwheels = handwheels;

                // CRITICAL: These are required for dropdowns to work
                if (bodyWeights.length === 0) errors.push('🚨 CRITICAL: No Body Weights found - Size dropdown will be empty!');
                if (bonnetWeights.length === 0) errors.push('🚨 CRITICAL: No Bonnet Weights found - Bonnet Type dropdown will be empty!');
                if (plugWeights.length === 0) errors.push('⚠️ No Plug Weights found');
                if (seatWeights.length === 0) errors.push('⚠️ No Seat Weights found');
                if (stemPrices.length === 0) errors.push('⚠️ No Stem Prices found');
                if (cageWeights.length === 0) errors.push('⚠️ No Cage Weights found');
                if (sealPrices.length === 0) errors.push('⚠️ No Seal Ring Prices found');
                if (actuators.length === 0) errors.push('⚠️ No Actuator Models found');
                if (handwheels.length === 0) errors.push('⚠️ No Handwheel Prices found');
            } catch (e: any) {
                errors.push(`❌ Error fetching weight/price data: ${e.message}`);
            }

            results.errors = errors;
            setDiagnostics(results);
        } catch (e: any) {
            setDiagnostics({
                loading: false,
                errors: [`❌ Critical error: ${e.message}`],
            });
        }
    };

    if (diagnostics.loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">🔍 Quote System Diagnostics</h1>

            {/* Errors Summary */}
            {diagnostics.errors.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <h2 className="text-xl font-bold text-red-900 mb-2">Issues Found</h2>
                    <ul className="list-disc list-inside space-y-1">
                        {diagnostics.errors.map((error: string, idx: number) => (
                            <li key={idx} className="text-red-700">{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            {diagnostics.errors.length === 0 && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                    <h2 className="text-xl font-bold text-green-900">✅ All Systems Operational</h2>
                </div>
            )}

            {/* User Info */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">User Authentication</h2>
                {diagnostics.user ? (
                    <div className="space-y-2">
                        <p><strong>Name:</strong> {diagnostics.user.name}</p>
                        <p><strong>Email:</strong> {diagnostics.user.email}</p>
                        <p><strong>Role:</strong> {diagnostics.user.role}</p>
                        <p><strong>ID:</strong> {diagnostics.user.id}</p>
                    </div>
                ) : (
                    <p className="text-red-600">Not authenticated</p>
                )}
            </div>

            {/* Materials */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Materials</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded">
                        <p className="text-sm text-gray-600">Total Materials</p>
                        <p className="text-2xl font-bold">{diagnostics.materials?.length || 0}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded">
                        <p className="text-sm text-gray-600">Body/Bonnet</p>
                        <p className="text-2xl font-bold">{diagnostics.bodyBonnetMats?.length || 0}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded">
                        <p className="text-sm text-gray-600">Plug</p>
                        <p className="text-2xl font-bold">{diagnostics.plugMats?.length || 0}</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded">
                        <p className="text-sm text-gray-600">Seat</p>
                        <p className="text-2xl font-bold">{diagnostics.seatMats?.length || 0}</p>
                    </div>
                    <div className="p-4 bg-pink-50 rounded">
                        <p className="text-sm text-gray-600">Stem</p>
                        <p className="text-2xl font-bold">{diagnostics.stemMats?.length || 0}</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded">
                        <p className="text-sm text-gray-600">Cage</p>
                        <p className="text-2xl font-bold">{diagnostics.cageMats?.length || 0}</p>
                    </div>
                </div>
            </div>

            {/* Series */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Series</h2>
                <div className="p-4 bg-indigo-50 rounded">
                    <p className="text-sm text-gray-600">Total Series</p>
                    <p className="text-2xl font-bold">{diagnostics.series?.length || 0}</p>
                </div>
                {diagnostics.series?.length > 0 && (
                    <div className="mt-4">
                        <h3 className="font-semibold mb-2">Available Series:</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {diagnostics.series.map((s: any) => (
                                <div key={s.id} className="p-2 bg-gray-50 rounded text-sm">
                                    {s.seriesNumber} - {s.name}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Weight & Price Collections */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">📊 Weight & Price Data (Required for Dropdowns)</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded ${(diagnostics.bodyWeights?.length || 0) > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                        <p className="text-sm text-gray-600">Body Weights</p>
                        <p className="text-2xl font-bold">{diagnostics.bodyWeights?.length || 0}</p>
                        <p className="text-xs mt-1 text-gray-500">Size dropdown</p>
                    </div>
                    <div className={`p-4 rounded ${(diagnostics.bonnetWeights?.length || 0) > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                        <p className="text-sm text-gray-600">Bonnet Weights</p>
                        <p className="text-2xl font-bold">{diagnostics.bonnetWeights?.length || 0}</p>
                        <p className="text-xs mt-1 text-gray-500">Bonnet Type dropdown</p>
                    </div>
                    <div className={`p-4 rounded ${(diagnostics.plugWeights?.length || 0) > 0 ? 'bg-green-50' : 'bg-yellow-50'}`}>
                        <p className="text-sm text-gray-600">Plug Weights</p>
                        <p className="text-2xl font-bold">{diagnostics.plugWeights?.length || 0}</p>
                    </div>
                    <div className={`p-4 rounded ${(diagnostics.seatWeights?.length || 0) > 0 ? 'bg-green-50' : 'bg-yellow-50'}`}>
                        <p className="text-sm text-gray-600">Seat Weights</p>
                        <p className="text-2xl font-bold">{diagnostics.seatWeights?.length || 0}</p>
                    </div>
                    <div className={`p-4 rounded ${(diagnostics.stemPrices?.length || 0) > 0 ? 'bg-green-50' : 'bg-yellow-50'}`}>
                        <p className="text-sm text-gray-600">Stem Prices</p>
                        <p className="text-2xl font-bold">{diagnostics.stemPrices?.length || 0}</p>
                    </div>
                    <div className={`p-4 rounded ${(diagnostics.cageWeights?.length || 0) > 0 ? 'bg-green-50' : 'bg-yellow-50'}`}>
                        <p className="text-sm text-gray-600">Cage Weights</p>
                        <p className="text-2xl font-bold">{diagnostics.cageWeights?.length || 0}</p>
                    </div>
                    <div className={`p-4 rounded ${(diagnostics.sealPrices?.length || 0) > 0 ? 'bg-green-50' : 'bg-yellow-50'}`}>
                        <p className="text-sm text-gray-600">Seal Ring Prices</p>
                        <p className="text-2xl font-bold">{diagnostics.sealPrices?.length || 0}</p>
                    </div>
                    <div className={`p-4 rounded ${(diagnostics.actuators?.length || 0) > 0 ? 'bg-green-50' : 'bg-yellow-50'}`}>
                        <p className="text-sm text-gray-600">Actuator Models</p>
                        <p className="text-2xl font-bold">{diagnostics.actuators?.length || 0}</p>
                    </div>
                    <div className={`p-4 rounded ${(diagnostics.handwheels?.length || 0) > 0 ? 'bg-green-50' : 'bg-yellow-50'}`}>
                        <p className="text-sm text-gray-600">Handwheel Prices</p>
                        <p className="text-2xl font-bold">{diagnostics.handwheels?.length || 0}</p>
                    </div>
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded">
                    <p className="text-sm text-blue-900">
                        <strong>🚨 Critical:</strong> Body Weights and Bonnet Weights must have data for Size/Rating dropdowns to work!
                    </p>
                </div>
            </div>

            {/* Solutions */}
            {diagnostics.errors.length > 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6">
                    <h2 className="text-xl font-bold text-yellow-900 mb-4">🔧 Recommended Solutions</h2>
                    <div className="space-y-4 text-yellow-900">
                        {diagnostics.materials?.length === 0 && (
                            <div>
                                <h3 className="font-bold">No Materials Found:</h3>
                                <ol className="list-decimal list-inside ml-4 mt-2 space-y-1">
                                    <li>Go to <code className="bg-yellow-100 px-2 py-1 rounded">/admin/pricing</code></li>
                                    <li>Click "Download Template"</li>
                                    <li>Fill in the Materials sheet</li>
                                    <li>Click "Upload Excel File" and select your filled template</li>
                                </ol>
                            </div>
                        )}
                        {diagnostics.series?.length === 0 && (
                            <div>
                                <h3 className="font-bold">No Series Found:</h3>
                                <ol className="list-decimal list-inside ml-4 mt-2 space-y-1">
                                    <li>Go to <code className="bg-yellow-100 px-2 py-1 rounded">/admin/pricing</code></li>
                                    <li>Download and fill the template with Series data</li>
                                    <li>Upload the template</li>
                                </ol>
                            </div>
                        )}
                        {!diagnostics.user && (
                            <div>
                                <h3 className="font-bold">Not Authenticated:</h3>
                                <p className="ml-4 mt-2">Please log in to access the quote system.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Test Link */}
            <div className="mt-6 text-center">
                <a
                    href="/employee/new-quote"
                    className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-bold"
                >
                    Try Creating a Quote →
                </a>
            </div>
        </div>
    );
}
