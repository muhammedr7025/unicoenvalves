'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function DebugPage() {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        checkData();
    }, []);

    const checkData = async () => {
        try {
            // Get one bodyWeight document to see its structure
            const bodyWeightsRef = collection(db, 'bodyWeights');
            const q = query(bodyWeightsRef, limit(1));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                const docData = doc.data();

                setData({
                    documentId: doc.id,
                    fields: Object.keys(docData),
                    fullData: docData,
                });
            } else {
                setData({ error: 'No bodyWeights documents found' });
            }
        } catch (error: any) {
            setData({ error: error.message });
        }
    };

    if (!data) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">🔍 Database Field Inspector</h1>

            {data.error ? (
                <div className="bg-red-50 border border-red-200 rounded p-4">
                    <p className="text-red-900">Error: {data.error}</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">Sample Body Weight Document</h2>
                        <div className="space-y-2">
                            <p><strong>Document ID:</strong> {data.documentId}</p>
                            <p><strong>Fields Found:</strong></p>
                            <ul className="list-disc list-inside ml-4 space-y-1">
                                {data.fields.map((field: string) => (
                                    <li key={field} className="font-mono text-sm">
                                        {field}
                                        {field.toLowerCase().includes('series') && ' ⬅️ THIS IS THE SERIES FIELD'}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="font-bold mb-2">Full Document Data:</h3>
                        <pre className="bg-white p-4 rounded border overflow-x-auto">
                            {JSON.stringify(data.fullData, null, 2)}
                        </pre>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                        <p className="text-blue-900">
                            <strong>What to look for:</strong> Find the field that contains the series number (like "91000").
                            The query should use this EXACT field name.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
