'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { DashboardStats } from '@/types';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    totalCustomers: 0,
    totalQuotes: 0,
    quotesThisMonth: 0,
    quotesThisYear: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const usersRef = collection(db, 'users');
      const employeesQuery = query(usersRef, where('role', '==', 'employee'));
      const employeesSnapshot = await getDocs(employeesQuery);
      const totalEmployees = employeesSnapshot.size;

      const customersRef = collection(db, 'customers');
      const customersSnapshot = await getDocs(customersRef);
      const totalCustomers = customersSnapshot.size;

      const quotesRef = collection(db, 'quotes');
      const quotesSnapshot = await getDocs(quotesRef);
      const totalQuotes = quotesSnapshot.size;

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthQuery = query(
        quotesRef,
        where('createdAt', '>=', Timestamp.fromDate(firstDayOfMonth))
      );
      const monthSnapshot = await getDocs(monthQuery);
      const quotesThisMonth = monthSnapshot.size;

      const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
      const yearQuery = query(
        quotesRef,
        where('createdAt', '>=', Timestamp.fromDate(firstDayOfYear))
      );
      const yearSnapshot = await getDocs(yearQuery);
      const quotesThisYear = yearSnapshot.size;

      setStats({
        totalEmployees,
        totalCustomers,
        totalQuotes,
        quotesThisMonth,
        quotesThisYear,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: '👥',
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: '🏢',
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-600',
    },
    {
      title: 'Total Quotes',
      value: stats.totalQuotes,
      icon: '📄',
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600',
    },
    {
      title: 'Quotes This Month',
      value: stats.quotesThisMonth,
      icon: '📊',
      color: 'from-orange-500 to-orange-600',
      textColor: 'text-orange-600',
    },
    {
      title: 'Quotes This Year',
      value: stats.quotesThisYear,
      icon: '📈',
      color: 'from-pink-500 to-pink-600',
      textColor: 'text-pink-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to your admin dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl`}
              >
                {stat.icon}
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
            <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/employees"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
          >
            <span className="text-3xl mr-3 group-hover:scale-110 transition-transform">
              👥
            </span>
            <div>
              <h3 className="font-semibold text-gray-900">Manage Employees</h3>
              <p className="text-sm text-gray-600">Add or edit employees</p>
            </div>
          </Link>

          <Link
            href="/admin/customers"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
          >
            <span className="text-3xl mr-3 group-hover:scale-110 transition-transform">
              🏢
            </span>
            <div>
              <h3 className="font-semibold text-gray-900">Manage Customers</h3>
              <p className="text-sm text-gray-600">Add or edit customers</p>
            </div>
          </Link>

          <Link
            href="/admin/pricing"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group"
          >
            <span className="text-3xl mr-3 group-hover:scale-110 transition-transform">
              💰
            </span>
            <div>
              <h3 className="font-semibold text-gray-900">Update Pricing</h3>
              <p className="text-sm text-gray-600">Import pricing data</p>
            </div>
          </Link>

          <Link
            href="/admin/quotes"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all group"
          >
            <span className="text-3xl mr-3 group-hover:scale-110 transition-transform">
              📄
            </span>
            <div>
              <h3 className="font-semibold text-gray-900">View All Quotes</h3>
              <p className="text-sm text-gray-600">Browse all quotes</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}