'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Loader2, 
  Search, 
  ArrowRight, 
  LayoutTemplate, 
  Clock, 
  BookOpen, 
  Headphones, 
  PenTool, 
  Mic,
  Plus
} from 'lucide-react';
import axios from 'axios';
import Breadcrumbs from '@/app/components/breadcrumbs';

interface Paket {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  isFree: boolean;
  _count: {
    readingCategories: number;
    listeningCategories: number;
    writingCategories: number;
    speakingCategories: number;
  };
}

export default function UserPracticeListPage() {
  const [pakets, setPakets] = useState<Paket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPakets();
  }, []);

  const fetchPakets = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/pakets`);
      if (response.data.success) {
        setPakets(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch Pakets.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPakets = pakets.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Paket Latihan', active: true },
        ]} 
      />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 mt-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Paket <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 uppercase italic italic">Latihan</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl leading-relaxed font-medium">
             Sempurnakan kemampuan bahasa Inggrismu dengan berbagai simulasi ujian interaktif.
          </p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search test bundles..." 
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-white font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 animate-in fade-in duration-500">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Menyiapkan paket latihan terbaik untukmu...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-[2rem] p-12 text-center max-w-xl mx-auto shadow-xl shadow-red-100/20">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={32} />
          </div>
          <h3 className="text-xl font-bold text-red-900 mb-2">Gagal Memuat Data</h3>
          <p className="text-red-700 font-medium mb-6">{error}</p>
          <button 
            onClick={fetchPakets}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-red-200"
          >
            Coba Lagi
          </button>
        </div>
      ) : filteredPakets.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-20 text-center max-w-xl mx-auto shadow-xl shadow-slate-200/50">
          <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
            <LayoutTemplate size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Paket Tidak Ditemukan</h3>
          <p className="text-slate-500 font-medium">Maaf, kami tidak dapat menemukan paket yang kamu cari.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          {filteredPakets.map((item, index) => {
            const totalItems = 
              (item._count?.readingCategories || 0) + 
              (item._count?.listeningCategories || 0) + 
              (item._count?.writingCategories || 0) + 
              (item._count?.speakingCategories || 0);

            return (
              <div 
                key={item.id} 
                className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 flex flex-col hover:-translate-y-2 shadow-xl shadow-slate-200/50"
              >
                <div className="p-8 flex-grow">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 border border-blue-100">
                      <Package size={28} />
                    </div>
                    <div className="flex gap-2">
                       {item.isFree && (
                         <span className="text-[10px] font-black text-emerald-600 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100 uppercase tracking-widest">
                           Free
                         </span>
                       )}
                       <span className="text-[10px] font-black text-blue-600 px-3 py-1 bg-blue-50 rounded-full border border-blue-100 uppercase tracking-widest">
                         EN-CBT
                       </span>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors mb-3 uppercase tracking-tighter italic">
                    {item.name}
                  </h3>
                  
                  <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-2 font-medium italic opacity-80">
                    {item.description || 'Uji kemampuan bahasa Inggris Anda dengan paket ujian komprehensif ini.'}
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 group-hover:bg-blue-50/50 transition-colors border border-transparent group-hover:border-blue-100/50">
                      <BookOpen size={18} className="text-emerald-500" />
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Reading</span>
                        <span className="text-sm font-black text-slate-800">{item._count.readingCategories} Modul</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 group-hover:bg-blue-50/50 transition-colors border border-transparent group-hover:border-blue-100/50">
                      <Headphones size={18} className="text-purple-500" />
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Listening</span>
                        <span className="text-sm font-black text-slate-800">{item._count.listeningCategories} Modul</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 group-hover:bg-blue-50/50 transition-colors border border-transparent group-hover:border-blue-100/50">
                      <PenTool size={18} className="text-cyan-500" />
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Writing</span>
                        <span className="text-sm font-black text-slate-800">{item._count.writingCategories} Modul</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 group-hover:bg-blue-50/50 transition-colors border border-transparent group-hover:border-blue-100/50">
                      <Mic size={18} className="text-amber-500" />
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Speaking</span>
                        <span className="text-sm font-black text-slate-800">{item._count.speakingCategories} Modul</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest shrink-0">
                    <Clock size={16} className="text-slate-300" />
                    UPDATED: {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                  <Link 
                    href={`/test/${item.id}`}
                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 font-black px-8 py-4 rounded-full transition-all shadow-xl active:scale-95 uppercase tracking-tighter text-sm ${
                      totalItems > 0 
                        ? 'bg-slate-900 hover:bg-blue-600 text-white shadow-slate-900/20 hover:shadow-blue-600/20' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                    onClick={(e) => totalItems === 0 && e.preventDefault()}
                  >
                    Mulai Tes
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
