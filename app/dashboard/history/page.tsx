'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, 
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
  name: string;
  email: string;
  paketId: number | null;
  paket: Paket | null;
}

export default function HistoryPage() {
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
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/history`);
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

  const pakets = Array.from(new Set(history.map(item => item.paketId).filter(Boolean)))
    .map(id => {
      const item = history.find(h => h.paketId === id);
      return item?.paket;
    }) as Paket[];

  const uncategorizedCount = history.filter(h => !h.paketId).length;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 flex flex-col items-center justify-center text-gray-500 bg-white/50 rounded-3xl min-h-[600px] border border-gray-100 shadow-sm">
        <Loader2 className="animate-spin mb-4 text-blue-600" size={48} />
        <p className="font-bold text-lg">Loading history records...</p>
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
          { label: 'History', active: true },
        ]} 
      />

      <div className="mb-10 mt-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Test Packages History</h1>
        <p className="text-gray-500 mt-1">Select a package to view user performance and results.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {pakets.map((paket) => {
          const count = history.filter(h => h.paketId === paket.id).length;
          return (
            <div 
              key={paket.id}
              onClick={() => router.push(`/dashboard/history/user?paketId=${paket.id}`)}
              className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-blue-900/5 hover:shadow-blue-900/10 hover:scale-[1.02] cursor-pointer transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                <Package size={120} />
              </div>

              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Package size={28} />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2 truncate group-hover:text-blue-600 transition-colors uppercase tracking-tight">{paket.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px] mb-6">{paket.description || 'No description available for this test package.'}</p>
              
              <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[...Array(Math.min(3, count))].map((_, i) => (
                      <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                        {history.filter(h => h.paketId === paket.id)[i]?.name?.[0] || 'U'}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-gray-400">
                    {count} {count === 1 ? 'Submission' : 'Submissions'}
                  </span>
                </div>
                <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <ChevronRight size={18} />
                </div>
              </div>
            </div>
          );
        })}

        {uncategorizedCount > 0 && (
          <div 
            onClick={() => router.push('/dashboard/history/user?paketId=0')}
            className="bg-slate-50 rounded-[2rem] p-8 border border-dashed border-gray-300 hover:border-gray-400 cursor-pointer transition-all group flex flex-col justify-center items-center text-center opacity-60 hover:opacity-100"
          >
            <div className="w-14 h-14 bg-white text-gray-400 rounded-2xl flex items-center justify-center mb-4 border border-gray-200 shadow-sm transition-all group-hover:text-gray-600">
              <Users size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-700">Uncategorized Data</h3>
            <p className="text-xs text-gray-500 mt-1">{uncategorizedCount} records from legacy tests or broken links.</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>
    </div>
  );
}
