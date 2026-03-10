'use client';

import React, { useEffect, useState } from 'react';
import { 
  Loader2, 
  Package, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Zap,
  ArrowRight
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
  description: string | null;
  duration: number;
  pakets: Paket[];
}

interface UserPembelian {
  id: number;
  paketPembelianId: number;
  status: string;
  expiredDuration: string;
  paketPembelian: PaketPembelian;
}

export default function UserPaketSayaPage() {
  const [purchases, setPurchases] = useState<UserPembelian[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserPurchases();
  }, []);

  const fetchUserPurchases = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Silakan login terlebih dahulu.');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/history/pembelian`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        // Filter for successful and non-expired purchases
        const now = new Date();
        const active = response.data.data.filter((p: any) => {
          const isSuccess = p.status === 'SUCCESS';
          const isNotExpired = new Date(p.expiredDuration) > now;
          return isSuccess && isNotExpired;
        });
        setPurchases(active);
      }
    } catch (err: any) {
      console.error('Failed to fetch user purchases', err);
      setError(err.response?.data?.message || 'Gagal mengambil data paket saya.');
    } finally {
      setLoading(false);
    }
  };

  const getRemainingTime = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    if (diffTime <= 0) return null;
    
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
        <p className="text-gray-500 font-medium font-black uppercase tracking-widest text-[10px]">Memuat paket Anda...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Paket Saya', active: true },
        ]} 
      />

      <div className="mb-12 text-center">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 uppercase italic">
          Paket <span className="text-blue-600">Saya</span>
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto font-medium">
          Akses semua paket belajar premium yang telah Anda beli. Tingkatkan kemampuan Anda sekarang!
        </p>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-3xl text-center font-bold">
          {error}
        </div>
      ) : purchases.length === 0 ? (
        <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
           <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
             <Package size={40} className="text-slate-200" />
           </div>
           <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic mb-8">Anda belum memiliki paket aktif.</p>
           <Link 
             href="/dashboard/paket-pembelian-user" 
             className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
           >
             Lihat Katalog Paket
             <ArrowRight size={16} />
           </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {purchases.map((purchase) => {
            const item = purchase.paketPembelian;
            const remainingDays = getRemainingTime(purchase.expiredDuration);

            return (
              <div 
                key={purchase.id} 
                className="group relative bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ring-2 ring-emerald-500 border-emerald-500"
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

                  <div className="mb-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldCheck size={14} className="text-emerald-600" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Masa Aktif Berjalan</span>
                    </div>
                    <div className="text-xs font-bold text-slate-700">
                      Tersisa: <span className="text-emerald-600 font-black">{remainingDays} Hari</span>
                    </div>
                    <div className="text-[9px] text-slate-500 uppercase font-bold mt-0.5">
                      Berakhir pada {formatDate(purchase.expiredDuration)}
                    </div>
                  </div>

                  <div className="space-y-4 mb-8 flex-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-blue-500" />
                      Isi Paket:
                    </div>
                    <ul className="space-y-3">
                      {item.pakets?.map(p => (
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
                    href={`/dashboard/paket-saya/${item.id}`}
                    className="w-full py-5 rounded-2xl flex items-center justify-center gap-3 bg-slate-900 text-white hover:bg-blue-600 transition-all shadow-xl shadow-blue-600/10 font-black uppercase tracking-tighter text-lg active:scale-95"
                  >
                    Mulai Belajar
                    <ArrowRight size={20} />
                  </Link>

                  <div className="mt-6 flex items-center justify-center gap-2 text-slate-400">
                    <Clock size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Akses 24/7 Tanpa Batas</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
