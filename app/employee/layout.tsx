'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/authContext';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { useState } from 'react';
import Link from 'next/link';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const navigation = [
    { name: 'My Quotes', href: '/employee', icon: '📄' },
    { name: 'New Quote', href: '/employee/new-quote', icon: '➕' },
    { name: 'Customers', href: '/employee/customers', icon: '🏢' },
  ];

  return (
    <ProtectedRoute allowedRoles={['employee']}>
      <div className="min-h-screen bg-gray-50">
        <aside
          className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } bg-gradient-to-b from-green-600 to-teal-700 w-64`}
        >
          <div className="h-full px-3 py-4 overflow-y-auto">
            <div className="flex items-center mb-8 px-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3">
                <span className="text-2xl">🦄</span>
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Unicorn Valves</h2>
                <p className="text-green-200 text-xs">Employee Panel</p>
              </div>
            </div>

            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="flex items-center p-3 text-white rounded-lg hover:bg-white/10 transition-colors group"
                  >
                    <span className="text-2xl mr-3">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="absolute bottom-4 left-0 right-0 px-3">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
                    <span className="text-lg">👤</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-green-200 truncate">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </aside>

        <div className={`${sidebarOpen ? 'ml-64' : 'ml-0'} transition-all`}>
          <header className="bg-white shadow-sm sticky top-0 z-30">
            <div className="flex items-center justify-between px-6 py-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, <span className="font-semibold">{user?.name}</span>
                </span>
              </div>
            </div>
          </header>

          <main className="p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}