'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { 
  Search, 
  Users, 
  Loader2, 
  AlertCircle, 
  ChevronRight, 
  Mail, 
  Phone,
  ArrowLeft,
  User as UserIcon,
  Filter,
  Copy,
  Check
} from 'lucide-react';
import axios from 'axios';
import Breadcrumbs from '@/app/components/breadcrumbs';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Paket {
  id: number;
  name: string;
}

interface UserHistory {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  paketId: number | null;
  paket: Paket | null;
  readingHistories: any[];
  listeningHistories: any[];
  writingHistories: any[];
  speakingHistories: any[];
}

function UserHistoryList() {
  const searchParams = useSearchParams();
  const paketIdParam = searchParams.get('paketId');
  const [history, setHistory] = useState<UserHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleCopy = (user: UserHistory) => {
    const url = `${window.location.origin}/test/${user.paketId}/score?userId=${user.id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(user.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getScoreSummary = (item: UserHistory) => {
    const reading = item.readingHistories.length > 0 ? 
      item.readingHistories.reduce((acc, rh) => acc + rh.score, 0) : null;
    const listening = item.listeningHistories.length > 0 ? 
      item.listeningHistories.reduce((acc, lh) => acc + lh.score, 0) : null;
    const writing = item.writingHistories.length > 0 ? 
      item.writingHistories.reduce((acc, wh) => acc + wh.score, 0) : null;
    const speaking = item.speakingHistories.length > 0 ? 
      item.speakingHistories.reduce((acc, sh) => acc + sh.score, 0) : null;

    return { reading, listening, writing, speaking };
  };

  const filteredUsers = history.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (paketIdParam !== null) {
      const pId = parseInt(paketIdParam);
      const matchesPaket = pId === 0 ? !u.paketId : u.paketId === pId;
      return matchesSearch && matchesPaket;
    }
    
    return matchesSearch;
  });

  const selectedPaket = paketIdParam !== null && history.length > 0
    ? (parseInt(paketIdParam) === 0 ? { name: 'Uncategorized' } : history.find(h => h.paketId === parseInt(paketIdParam))?.paket)
    : null;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 flex flex-col items-center justify-center text-gray-500 bg-white/50 rounded-3xl min-h-[600px] border border-gray-100 shadow-sm">
        <Loader2 className="animate-spin mb-4 text-blue-600" size={48} />
        <p className="font-bold text-lg">Loading user list...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'History', href: '/dashboard/history' },
          { label: selectedPaket ? selectedPaket.name : 'All Users', active: true },
        ]} 
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 mt-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {selectedPaket ? `${selectedPaket.name} Results` : 'Active User Records'}
          </h1>
          <p className="text-gray-500 mt-1">
            {selectedPaket 
              ? `Showing results for test package: ${selectedPaket.name}` 
              : 'Manage and view all users who have participated in tests.'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-80 pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm active:scale-95">
            <Filter size={18} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-12 text-center text-red-500">
          <AlertCircle size={48} className="mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to load data</h3>
          <p className="mb-6 opacity-70">{error}</p>
          <button onClick={fetchHistory} className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all">Try Again</button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-20 text-center shadow-xl shadow-blue-900/5">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Users size={40} />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-500 max-w-xs mx-auto">Try adjust your search term or check back later for new submissions.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-blue-900/5 overflow-hidden">
          <div className="overflow-x-auto whitespace-nowrap scrollbar-hide">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-gray-100">
                  <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Profile Info</th>
                  <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Assigned Paket</th>
                  <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Test Date</th>
                  <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Score Matrix</th>
                  <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((user) => {
                  const s = getScoreSummary(user);
                  return (
                    <tr key={user.id} className="hover:bg-blue-50/20 transition-all group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                            {user.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{user.name}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                                <Mail size={12} /> {user.email}
                              </span>
                              {user.phone && (
                                <span className="flex items-center gap-1 text-[11px] text-gray-400 font-medium border-l border-gray-200 pl-3">
                                  <Phone size={12} /> {user.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {user.paket ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-[11px] font-bold border border-blue-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                            {user.paket.name}
                          </div>
                        ) : (
                          <span className="text-[11px] font-bold text-gray-300 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-gray-700">{formatDate(user.createdAt)}</p>
                        <p className="text-[10px] text-gray-400 font-medium mt-0.5 tracking-wider">#SUB-{user.id}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-center gap-2">
                           {[
                            { l: 'R', v: s.reading, c: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
                            { l: 'L', v: s.listening, c: 'text-blue-700 bg-blue-50 border-blue-100' },
                            { l: 'W', v: s.writing, c: 'text-amber-700 bg-amber-50 border-amber-100' },
                            { l: 'S', v: s.speaking, c: 'text-purple-700 bg-purple-50 border-purple-100' }
                           ].map((sc, i) => (
                             <div key={i} className={`w-10 h-11 rounded-xl flex flex-col items-center justify-center border transition-all ${sc.v !== null ? sc.c : 'bg-gray-50 text-gray-300 border-gray-100'}`}>
                               <span className="text-[9px] font-black opacity-40 mb-0.5">{sc.l}</span>
                               <span className="text-xs font-black tracking-tighter">{sc.v ?? '-'}</span>
                             </div>
                           ))}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right flex justify-end gap-2">
                         <button 
                           onClick={() => handleCopy(user)}
                           className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm active:scale-95 ${
                             copiedId === user.id 
                               ? 'bg-emerald-600 text-white border-emerald-600' 
                               : 'bg-white text-blue-600 border-blue-100 hover:bg-blue-50'
                           }`}
                           title="Copy Score URL"
                         >
                           {copiedId === user.id ? (
                             <>
                               <Check size={14} />
                               <span>Copied!</span>
                             </>
                           ) : (
                             <>
                               <Copy size={14} />
                               <span className="hidden sm:inline">Copy URL</span>
                             </>
                           )}
                         </button>
                         <Link 
                           href={`/dashboard/history/user/${user.id}`}
                           className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold text-gray-600 transition-all border border-gray-100 hover:border-blue-500 shadow-sm active:scale-95"
                         >
                           <span>View Profile</span>
                           <ChevronRight size={14} />
                         </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>
    </div>
  );
}

export default function UserHistoryListPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto py-12 px-4 flex flex-col items-center justify-center text-gray-500 bg-white/50 rounded-3xl min-h-[600px] border border-gray-100 shadow-sm">
        <Loader2 className="animate-spin mb-4 text-blue-600" size={48} />
        <p className="font-bold text-lg">Loading history...</p>
      </div>
    }>
      <UserHistoryList />
    </Suspense>
  );
}
