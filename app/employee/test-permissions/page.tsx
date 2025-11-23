'use client';

import { useAuth } from '@/lib/firebase/authContext';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function TestPermissions() {
  const { user } = useAuth();

  const testWrite = async () => {
    try {
      console.log('Testing write with user:', user);
      
      const testDoc = {
        test: 'data',
        createdBy: user?.id,
        createdAt: new Date(),
      };
      
      await setDoc(doc(collection(db, 'quotes'), 'test-quote'), testDoc);
      alert('Write successful!');
    } catch (error: any) {
      console.error('Write failed:', error);
      alert('Write failed: ' + error.message);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Permissions</h1>
      <div className="bg-gray-100 p-4 rounded mb-4">
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </div>
      <button
        onClick={testWrite}
        className="bg-blue-600 text-white px-6 py-2 rounded"
      >
        Test Write to Quotes Collection
      </button>
    </div>
  );
}