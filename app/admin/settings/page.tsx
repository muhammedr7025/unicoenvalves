'use client';

import { useState, useEffect } from 'react';
import { getGlobalMargins, updateGlobalMargins, GlobalMargins, getExchangeRate, updateExchangeRate } from '@/lib/firebase/marginService';

export default function AdminSettingsPage() {
    const [margins, setMargins] = useState<GlobalMargins | null>(null);
    const [exchangeRate, setExchangeRate] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadMargins();
    }, []);

    const loadMargins = async () => {
        setLoading(true);
        const [data, rate] = await Promise.all([getGlobalMargins(), getExchangeRate()]);
        setMargins(data);
        setExchangeRate(rate);
        setLoading(false);
    };

    const handleSave = async () => {
        if (!margins) return;
        setSaving(true);
        try {
            await updateGlobalMargins(margins);
            if (exchangeRate && exchangeRate > 0) {
                await updateExchangeRate(exchangeRate);
            }
            alert('✅ Settings updated successfully!');
        } catch (error: any) {
            alert('❌ Failed to update settings: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading || !margins) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">⚙️ Global Settings</h1>
                <p className="text-gray-600">Manage profit margins and pricing configuration. These margins apply to all new quotes.</p>
            </div>

            {/* Margins Configuration */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <span className="mr-2">💰</span>
                    Profit Margins Configuration
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                    Set different margins for Standard Pricing and Project Pricing. These margins are automatically applied when employees create quotes.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Standard Pricing Column */}
                    <div className="border-2 border-blue-200 rounded-xl p-6 bg-blue-50">
                        <h3 className="text-lg font-bold text-blue-900 mb-1">📦 Standard Pricing</h3>
                        <p className="text-xs text-blue-600 mb-5">Used for regular customer quotes</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-blue-800 mb-2">
                                    Manufacturing Profit (%)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.5"
                                    value={margins.standard.manufacturingProfitPercentage}
                                    onChange={(e) => setMargins({
                                        ...margins,
                                        standard: { ...margins.standard, manufacturingProfitPercentage: parseFloat(e.target.value) || 0 }
                                    })}
                                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-blue-800 mb-2">
                                    Bought-out Profit (%)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.5"
                                    value={margins.standard.boughtoutProfitPercentage}
                                    onChange={(e) => setMargins({
                                        ...margins,
                                        standard: { ...margins.standard, boughtoutProfitPercentage: parseFloat(e.target.value) || 0 }
                                    })}
                                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-blue-800 mb-2">
                                    Negotiation Margin (%)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.5"
                                    value={margins.standard.negotiationMarginPercentage}
                                    onChange={(e) => setMargins({
                                        ...margins,
                                        standard: { ...margins.standard, negotiationMarginPercentage: parseFloat(e.target.value) || 0 }
                                    })}
                                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Project Pricing Column */}
                    <div className="border-2 border-purple-200 rounded-xl p-6 bg-purple-50">
                        <h3 className="text-lg font-bold text-purple-900 mb-1">🏗️ Project Pricing</h3>
                        <p className="text-xs text-purple-600 mb-5">Used for project-based quotes</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-purple-800 mb-2">
                                    Manufacturing Profit (%)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.5"
                                    value={margins.project.manufacturingProfitPercentage}
                                    onChange={(e) => setMargins({
                                        ...margins,
                                        project: { ...margins.project, manufacturingProfitPercentage: parseFloat(e.target.value) || 0 }
                                    })}
                                    className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-lg font-semibold"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-purple-800 mb-2">
                                    Bought-out Profit (%)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.5"
                                    value={margins.project.boughtoutProfitPercentage}
                                    onChange={(e) => setMargins({
                                        ...margins,
                                        project: { ...margins.project, boughtoutProfitPercentage: parseFloat(e.target.value) || 0 }
                                    })}
                                    className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-lg font-semibold"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-purple-800 mb-2">
                                    Negotiation Margin (%)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.5"
                                    value={margins.project.negotiationMarginPercentage}
                                    onChange={(e) => setMargins({
                                        ...margins,
                                        project: { ...margins.project, negotiationMarginPercentage: parseFloat(e.target.value) || 0 }
                                    })}
                                    className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-lg font-semibold"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Currency Exchange Rate */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <span className="mr-2">💱</span>
                    Currency Exchange Rate
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                    Set the exchange rate for international (non-India) customers. All prices will be converted and shown in USD using this rate.
                </p>

                <div className="border-2 border-amber-200 rounded-xl p-6 bg-amber-50 max-w-md">
                    <label className="block text-sm font-medium text-amber-800 mb-2">
                        1 USD = ₹ (INR)
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={exchangeRate || ''}
                        onChange={(e) => setExchangeRate(parseFloat(e.target.value) || null)}
                        className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 text-lg font-semibold"
                        placeholder="e.g., 83.50"
                    />
                    <p className="text-xs text-amber-600 mt-2">
                        This rate is used to convert INR prices to USD for all international customer quotes
                    </p>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end mb-8">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 font-bold disabled:opacity-50 flex items-center text-lg"
                >
                    {saving ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Saving...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Save All Settings
                        </>
                    )}
                </button>
            </div>

            {/* Info Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h3 className="text-sm font-bold text-amber-800 mb-2">ℹ️ How Margins Work</h3>
                <ul className="text-sm text-amber-700 space-y-1">
                    <li>• <strong>Manufacturing Profit</strong> — Applied to Body Sub-Assembly + Tubing + Testing costs</li>
                    <li>• <strong>Bought-out Profit</strong> — Applied to Accessories costs</li>
                    <li>• <strong>Negotiation Margin</strong> — Buffer applied on top of total cost (for price negotiation room)</li>
                    <li>• <strong>Dealer/Agent Margin</strong> — Set per-customer in Customer Management (additional markup for dealers)</li>
                </ul>
            </div>
        </div>
    );
}
