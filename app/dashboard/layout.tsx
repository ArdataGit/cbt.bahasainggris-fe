'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/sidebar';
import Navbar from '@/app/components/navbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      router.push('/login');
    } else {
      try {
        const userData = JSON.parse(user);
        if (userData.role !== 'admin' && userData.role !== 'user') {
          router.push('/login');
        } else {
          setIsAuthenticated(true);
        }
      } catch (e) {
        router.push('/login');
      }
    }
  }, [router]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-500">Checking authentication...</div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
