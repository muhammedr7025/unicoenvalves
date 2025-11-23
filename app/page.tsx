'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/authContext';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/employee');
        }
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}