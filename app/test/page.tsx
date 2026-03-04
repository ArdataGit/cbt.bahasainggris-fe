'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Loader2, Search, ArrowRight, LayoutTemplate, Clock, BookOpen, Headphones, PenTool, Mic } from 'lucide-react';
import axios from 'axios';

interface Paket {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  _count: {
    readingCategories: number;
    listeningCategories: number;
    writingCategories: number;
    speakingCategories: number;
  };
}

export default function TestListPage() {
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
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header Section */}
      {/* <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm shadow-blue-200">
              <Package className="text-white" size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">EduTest <span className="text-blue-600">Portal</span></span>
          </div>
          
          <div className="relative hidden md:block w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari paket ujian..." 
              className="w-full pl-10 pr-4 py-1.5 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header> */}

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Daftar Paket <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Ujian</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
              Pilih paket ujian bahasa Inggris yang sesuai untuk menguji kemampuan Anda.
            </p>
          </div>
          <div className="md:hidden">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari paket..." 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
            <p className="text-slate-500 font-medium">Menyiapkan paket ujian terbaik untuk Anda...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center max-w-xl mx-auto shadow-sm shadow-red-100">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={32} />
            </div>
            <h3 className="text-xl font-bold text-red-900 mb-2">Gagal Memuat Data</h3>
            <p className="text-red-700 font-medium mb-6">{error}</p>
            <button 
              onClick={fetchPakets}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-red-200"
            >
              Coba Lagi
            </button>
          </div>
        ) : filteredPakets.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-sm">
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <LayoutTemplate size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Paket Tidak Ditemukan</h3>
            <p className="text-slate-500">Maaf, kami tidak dapat menemukan paket yang Anda cari.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPakets.map((item, index) => {
              const totalItems = 
                (item._count?.readingCategories || 0) + 
                (item._count?.listeningCategories || 0) + 
                (item._count?.writingCategories || 0) + 
                (item._count?.speakingCategories || 0);

              return (
                <div 
                  key={item.id} 
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="p-6 flex-grow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300 border border-blue-100/50">
                        <Package size={24} />
                      </div>
                      <span className="text-xs font-bold text-blue-600 px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
                        EN-CBT
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2 uppercase tracking-tight">
                      {item.name}
                    </h3>
                    
                    <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2 italic">
                      {item.description || 'Uji kemampuan bahasa Inggris Anda dengan paket ujian komprehensif ini.'}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 group-hover:bg-blue-50/50 transition-colors">
                        <BookOpen size={16} className="text-emerald-500" />
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Reading</span>
                          <span className="text-sm font-bold text-slate-700">{item._count.readingCategories} Modul</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 group-hover:bg-blue-50/50 transition-colors">
                        <Headphones size={16} className="text-purple-500" />
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Listening</span>
                          <span className="text-sm font-bold text-slate-700">{item._count.listeningCategories} Modul</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 group-hover:bg-blue-50/50 transition-colors">
                        <PenTool size={16} className="text-cyan-500" />
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Writing</span>
                          <span className="text-sm font-bold text-slate-700">{item._count.writingCategories} Modul</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 group-hover:bg-blue-50/50 transition-colors">
                        <Mic size={16} className="text-amber-500" />
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Speaking</span>
                          <span className="text-sm font-bold text-slate-700">{item._count.speakingCategories} Modul</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                      <Clock size={14} className="text-slate-400" />
                      Terakhir Diperbarui: {new Date(item.createdAt).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                    </div>
                    <Link 
                      href={`/test/${item.id}`}
                      className={`inline-flex items-center justify-center gap-2 font-bold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 ${
                        totalItems > 0 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200' 
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                      onClick={(e) => totalItems === 0 && e.preventDefault()}
                    >
                      <span className="text-sm">Mulai</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      
      {/* <footer className="bg-white border-t border-slate-200 py-12 px-4 sm:px-6 lg:px-8 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-60 grayscale">
            <div className="bg-slate-600 p-1 rounded-sm">
              <Package className="text-white" size={16} />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">EduTest Portal</span>
          </div>
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} EduTest Portal. Semua hak dilindungi.
          </p>
        </div>
      </footer> */}
    </div>
  );
}
