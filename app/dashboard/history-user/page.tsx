'use client';

import React, { useEffect, useState } from 'react';
import { 
  Loader2, 
  AlertCircle, 
  ChevronRight,
  Package
} from 'lucide-react';
import axios from 'axios';
import Breadcrumbs from '@/app/components/breadcrumbs';
import { useRouter } from 'next/navigation';

interface Paket {
  id: number;
  name: string;
  description: string | null;
}

interface UserHistory {
  id: number;
  paketId: number | null;
  paket: Paket | null;
  createdAt: string;
}

export default function HistoryUserPage() {
  const router = useRouter();
  const [history, setHistory] = useState<UserHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/history/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setHistory(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch history');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique packages from history
  const uniquePaketsMap = new Map<number, Paket>();
  history.forEach(item => {
    if (item.paketId && item.paket) {
      uniquePaketsMap.set(item.paketId, item.paket);
    }
  });
  
  const pakets = Array.from(uniquePaketsMap.values());

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 flex flex-col items-center justify-center text-gray-500 bg-white/50 rounded-3xl min-h-[600px] border border-gray-100 shadow-sm">
        <Loader2 className="animate-spin mb-4 text-blue-600" size={48} />
        <p className="font-bold text-lg">Loading your history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 flex flex-col items-center justify-center text-red-500 text-center">
        <AlertCircle size={48} className="mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading History</h3>
        <p className="mb-6">{error}</p>
        <button onClick={fetchHistory} className="bg-blue-600 text-white px-8 py-2 rounded-xl font-bold">Try Again</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'My History', active: true },
        ]} 
      />

      <div className="mb-10 mt-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Your Test History</h1>
        <p className="text-gray-500 mt-1">Review your performance across different test packages.</p>
      </div>

      {pakets.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-20 text-center shadow-xl shadow-blue-900/5">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Package size={40} />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">No History Found</h3>
          <p className="text-gray-500 max-w-xs mx-auto">You haven't completed any tests yet. Start a test to see your results here.</p>
          <button 
            onClick={() => router.push('/dashboard/paket-latihan-user')}
            className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95"
          >
            Browse Tests
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pakets.map((paket) => {
            const attemptsCount = history.filter(h => h.paketId === paket.id).length;
            return (
              <div 
                key={paket.id}
                onClick={() => router.push(`/dashboard/history-user/detail?paketId=${paket.id}`)}
                className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-blue-900/5 hover:shadow-blue-900/10 hover:scale-[1.02] cursor-pointer transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                  <Package size={120} />
                </div>

                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Package size={28} />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2 truncate group-hover:text-blue-600 transition-colors uppercase tracking-tight">{paket.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px] mb-6">{paket.description || 'Review your scores and performance for this package.'}</p>
                
                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                      {attemptsCount} {attemptsCount === 1 ? 'Attempt' : 'Attempts'}
                    </span>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>
    </div>
  );
}
