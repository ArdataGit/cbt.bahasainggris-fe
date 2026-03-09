'use client';

import React, { useEffect, useState } from 'react';
import { 
  Loader2, 
  Package,
  ShoppingCart,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import axios from 'axios';
import Breadcrumbs from '@/app/components/breadcrumbs';
import Link from 'next/link';

interface Paket {
  id: number;
  name: string;
  isFree: boolean;
}

interface PaketPembelian {
  id: number;
  name: string;
  price: number;
  label: string;
  pakets: Paket[];
  createdAt: string;
}

export default function UserPaketPembelianPage() {
  const [pakets, setPakets] = useState<PaketPembelian[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPakets();
  }, []);

  const fetchPakets = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/paket-pembelians`);
      if (response.data.success) {
        setPakets(response.data.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch Paket Pembelians.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
        <p className="text-gray-500 font-medium font-black uppercase tracking-widest text-[10px]">Menyiapkan paket terbaik untukmu...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Beli Paket', active: true },
        ]} 
      />

      <div className="mb-12 text-center">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 uppercase italic">
          Pilih <span className="text-blue-600">Paket</span> Belajarmu
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto font-medium">
          Dapatkan akses penuh ke ribuan soal latihan dan simulasi ujian premium untuk meningkatkan skor Bahasa Inggrismu secara signifikan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {pakets.length === 0 ? (
          <div className="col-span-full py-20 text-center">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
               <Package size={40} className="text-slate-200" />
             </div>
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">Belum ada paket yang tersedia saat ini.</p>
          </div>
        ) : (
          pakets.map((item) => (
            <div 
              key={item.id} 
              className="group relative bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-2"
            >
              {/* Header Visual */}
              <div className={`h-24 px-10 pt-10 flex justify-between items-start ${
                item.label === 'VIP' ? 'bg-gradient-to-br from-purple-50 to-indigo-50' :
                item.label === 'PREMIUM' ? 'bg-gradient-to-br from-amber-50 to-orange-50' :
                'bg-gradient-to-br from-blue-50 to-cyan-50'
              }`}>
                <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  item.label === 'VIP' ? 'bg-purple-600 text-white border-purple-400' :
                  item.label === 'PREMIUM' ? 'bg-amber-600 text-white border-amber-400' :
                  'bg-blue-600 text-white border-blue-400'
                }`}>
                  {item.label}
                </div>
                {item.label === 'VIP' && <Zap size={24} className="text-indigo-400 animate-pulse" />}
              </div>

              {/* Content */}
              <div className="px-10 pb-10 flex-1 flex flex-col">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic mb-2 mt-2 group-hover:text-blue-600 transition-colors">
                  {item.name}
                </h3>
                
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-3xl font-black text-slate-900 tracking-tighter">
                    {formatPrice(item.price)}
                  </span>
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">/ Selamanya</span>
                </div>

                <div className="space-y-4 mb-8 flex-1">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-blue-500" />
                    Terdiri dari {item.pakets.length} Paket Test:
                  </div>
                  <ul className="space-y-3">
                    {item.pakets.map(p => (
                      <li key={p.id} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                        <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                          <CheckCircle2 size={12} className="text-emerald-500" />
                        </div>
                        <span className="uppercase truncate">{p.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={`/checkout/${item.id}`}
                  className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-tighter text-lg transition-all shadow-xl active:scale-95 ${
                    item.label === 'VIP' 
                      ? 'bg-slate-900 text-white hover:bg-indigo-600 shadow-indigo-600/20' 
                      : item.label === 'PREMIUM'
                      ? 'bg-slate-900 text-white hover:bg-amber-600 shadow-amber-600/20'
                      : 'bg-slate-900 text-white hover:bg-blue-600 shadow-blue-600/20'
                  }`}
                >
                  Beli Sekarang
                  <ArrowRight size={20} />
                </Link>

                <div className="mt-6 flex items-center justify-center gap-2 text-slate-400">
                  <ShieldCheck size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Pembayaran Aman & Instan</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
