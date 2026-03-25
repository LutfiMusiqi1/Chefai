// app/dashboard/page.tsx
'use client';

import { useAuth } from '../providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <button
              onClick={() => signOut()}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Mirë se vini, {user.user_metadata?.full_name || user.email}!</h2>
            <p className="text-gray-600">Kjo është një faqe e mbrojtur. Vetëm përdoruesit e loguar mund ta shohin këtë.</p>
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <p className="text-blue-800"><strong>Email:</strong> {user.email}</p>
              <p className="text-blue-800 mt-1"><strong>User ID:</strong> {user.id}</p>
              <p className="text-blue-800 mt-1"><strong>I regjistruar më:</strong> {new Date(user.created_at).toLocaleDateString('sq-AL')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
