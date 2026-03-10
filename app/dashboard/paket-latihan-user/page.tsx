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
  Plus,
  CheckCircle2,
  X,
  AlertTriangle,
  ShoppingCart,
  CreditCard,
  Lock
} from 'lucide-react';
import axios from 'axios';
import Breadcrumbs from '@/app/components/breadcrumbs';

interface PaketPembelian {
  id: number;
  name: string;
  price: number;
  label: string;
  description: string | null;
  duration: number;
  pakets: { id: number; name: string }[];
}

interface Paket {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  isFree: boolean;
  isPurchased?: boolean;
  paketPembelians: PaketPembelian[];
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

  const [selectedBundle, setSelectedBundle] = useState<PaketPembelian | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPakets();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleMulaiClick = (e: React.MouseEvent, item: Paket & { isPurchased?: boolean }) => {
    if (!item.isFree && !item.isPurchased) {
      e.preventDefault();
      if (item.paketPembelians && item.paketPembelians.length > 0) {
        setSelectedBundle(item.paketPembelians[0]);
        setIsModalOpen(true);
      } else {
        alert('Paket ini memerlukan pembelian, namun belum tersedia di paket pembelian manapun.');
      }
    }
  };

  const fetchPakets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/pakets`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
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
                        {item.isFree ? (
                          <span className="text-[10px] font-black text-emerald-600 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100 uppercase tracking-widest">
                            Free
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-amber-600 px-3 py-1 bg-amber-50 rounded-full border border-amber-100 uppercase tracking-widest">
                            Berbayar
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
                  
                  <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2 font-medium italic opacity-80">
                    {item.description || 'Uji kemampuan bahasa Inggris Anda dengan paket ujian komprehensif ini.'}
                  </p>

                  {!item.isFree && item.paketPembelians && item.paketPembelians.length > 0 && (
                    <div className="mb-6">
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Tersedia di Paket:</div>
                      <div className="flex flex-wrap gap-2">
                        {item.paketPembelians.map(bundle => (
                          <span key={bundle.id} className="text-[10px] font-bold text-blue-700 px-2 py-0.5 bg-blue-50 rounded-md border border-blue-100 uppercase">
                            {bundle.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

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
                    onClick={(e) => {
                      if (totalItems === 0) e.preventDefault();
                      else handleMulaiClick(e, item);
                    }}
                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 font-black px-5 py-2.5 rounded-full transition-all shadow-lg active:scale-95 uppercase tracking-tighter text-[10px] whitespace-nowrap ${
                      totalItems > 0 
                        ? 'bg-slate-900 hover:bg-blue-600 text-white shadow-slate-900/20 hover:shadow-blue-600/20' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {!item.isFree && !item.isPurchased ? (
                      <Lock size={14} className="text-amber-400" />
                    ) : null}
                    <span>Mulai Tes</span>
                    {(item.isFree || item.isPurchased) && (
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    )}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal (Bundled Purchase) */}
      {isModalOpen && selectedBundle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-all">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
            onClick={() => setIsModalOpen(false)}
          />
          
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl shadow-slate-900/20 overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className={`p-8 ${
              selectedBundle.label === 'VIP' ? 'bg-gradient-to-r from-purple-600 to-indigo-600' :
              selectedBundle.label === 'PREMIUM' ? 'bg-gradient-to-r from-amber-600 to-orange-600' :
              'bg-gradient-to-r from-blue-600 to-cyan-600'
            } text-white relative`}>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute right-6 top-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <ShoppingCart size={24} />
                <h2 className="text-xl font-black uppercase tracking-widest italic">Opsi Paket Berbayar</h2>
              </div>
              <p className="text-white/80 text-sm font-medium">Beli paket materi ini untuk melanjutkan tes.</p>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="flex justify-between items-start mb-4">
                   <div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tersedia di Paket</span>
                     <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight">{selectedBundle.name}</h3>
                   </div>
                   <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    selectedBundle.label === 'VIP' ? 'bg-purple-600 text-white border-purple-400' :
                    selectedBundle.label === 'PREMIUM' ? 'bg-amber-600 text-white border-amber-400' :
                    'bg-blue-600 text-white border-blue-400'
                  }`}>
                    {selectedBundle.label}
                  </div>
                </div>
                <div className="flex justify-between items-center py-4 border-t border-slate-200/50">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Harga Paket</span>
                  <span className="text-2xl font-black text-slate-900 tracking-tighter">{formatPrice(selectedBundle.price)}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-200/50">
                   <div className="flex items-center gap-2">
                     <Clock size={16} className="text-slate-400" />
                     <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Masa Aktif</span>
                   </div>
                   <span className="text-sm font-black text-slate-900 uppercase italic">{selectedBundle.duration} Hari</span>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200/50 space-y-4">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-blue-500" />
                    Terdiri dari {selectedBundle.pakets.length} Paket Test:
                  </div>
                  <ul className="grid grid-cols-1 gap-2">
                    {selectedBundle.pakets.map(p => (
                      <li key={p.id} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <div className="w-4 h-4 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                          <CheckCircle2 size={10} className="text-emerald-500" />
                        </div>
                        <span className="uppercase truncate">{p.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-800">
                <div className="mt-0.5"><ShoppingCart size={20} /></div>
                <div className="text-xs font-medium leading-relaxed">
                  Lanjutkan ke pembayaran untuk mendapatkan akses ke paket ini dan semua materi di dalamnya.
                </div>
              </div>
            </div>

            <div className="px-8 pb-8 pt-2 flex gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-xs text-slate-500 hover:bg-slate-50 transition-colors"
              >
                Nanti Saja
              </button>
              <Link
                href={`/checkout/${selectedBundle.id}`}
                className={`flex-[2] py-4 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs text-white transition-all shadow-lg active:scale-95 ${
                  selectedBundle.label === 'VIP' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20' :
                  selectedBundle.label === 'PREMIUM' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20' :
                  'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                }`}
              >
                Beli Sekarang
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
