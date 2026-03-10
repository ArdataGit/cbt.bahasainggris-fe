'use client';

import React, { useEffect, useState, use } from 'react';
import { 
  Loader2, 
  Package, 
  ArrowRight, 
  BookOpen, 
  Headphones, 
  PenTool, 
  Mic,
  Clock,
  ArrowLeft
} from 'lucide-react';
import axios from 'axios';
import Breadcrumbs from '@/app/components/breadcrumbs';
import Link from 'next/link';

interface Paket {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  isFree: boolean;
  paketPembelians: { id: number; name: string }[];
  _count: {
    readingCategories: number;
    listeningCategories: number;
    writingCategories: number;
    speakingCategories: number;
  };
}

interface PaketPembelian {
  id: number;
  name: string;
  label: string;
}

export default function UserPaketSayaDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const bundleId = parseInt(params.id);
  
  const [pakets, setPakets] = useState<Paket[]>([]);
  const [bundleInfo, setBundleInfo] = useState<PaketPembelian | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bundleId) {
      fetchData();
    }
  }, [bundleId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // 1. Fetch all pakets (with category counts)
      const paketsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/pakets`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      // 2. Fetch bundle info to get the name
      const bundleRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/paket-pembelians/${bundleId}`);

      if (paketsRes.data.success && bundleRes.data.success) {
        const allPakets = paketsRes.data.data;
        const bundleData = bundleRes.data.data;
        
        setBundleInfo(bundleData);

        // Filter pakets that belong to this bundle
        const filtered = allPakets.filter((p: Paket) => 
          p.paketPembelians.some(b => b.id === bundleId)
        );
        
        setPakets(filtered);
      }
    } catch (err: any) {
      console.error('Failed to fetch data', err);
      setError(err.response?.data?.message || 'Gagal memuat detail paket.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
        <p className="text-gray-500 font-medium font-black uppercase tracking-widest text-[10px]">Menyiapkan materi belajarmu...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Paket Saya', href: '/dashboard/paket-saya' },
          { label: bundleInfo?.name || 'Detail Paket', active: true },
        ]} 
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 mt-4">
        <div>
          <Link 
            href="/dashboard/paket-saya" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold uppercase tracking-widest text-[10px] mb-4 transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Kembali ke Paket Saya
          </Link>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
            Mulai <span className="text-blue-600">Belajar</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Paket: <span className="text-slate-900 font-black">{bundleInfo?.name}</span>
          </p>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-3xl text-center font-bold">
          {error}
        </div>
      ) : pakets.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
           <Package size={40} className="text-slate-200 mx-auto mb-4" />
           <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">Maaf, belum ada materi di dalam paket ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          {pakets.map((item) => {
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
                    ACCESS GRANTED
                  </div>
                  <Link 
                    href={`/test/${item.id}`}
                    className={`w-full sm:w-auto min-w-[120px] inline-flex items-center justify-center gap-2 font-black px-6 py-3 rounded-full transition-all shadow-lg active:scale-95 uppercase tracking-tighter text-xs ${
                      totalItems > 0 
                        ? 'bg-slate-900 hover:bg-blue-600 text-white shadow-slate-900/20 hover:shadow-blue-600/20' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>Mulai Tes</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
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
