'use client';

import React, { useEffect, useState } from 'react';
import { 
  Loader2, 
  AlertCircle, 
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Package,
  Calendar
} from 'lucide-react';
import axios from 'axios';
import Breadcrumbs from '@/app/components/breadcrumbs';

interface HistoryPembelian {
  id: number;
  paketPembelian: {
    name: string;
    price: number;
  };
  amount: number;
  status: 'SUCCESS' | 'PENDING' | 'EXPIRED' | 'CANCELLED' | 'FAILED';
  merchantRef: string;
  createdAt: string;
}

export default function HistoryPembelianPage() {
  const [history, setHistory] = useState<HistoryPembelian[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // Note: We need to create this endpoint in the backend history module
      // or filter the existing one. For now, let's assume /api/history/pembelian
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/history/pembelian`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setHistory(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat riwayat pembelian.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'PENDING':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'CANCELLED':
      case 'EXPIRED':
      case 'FAILED':
        return 'bg-red-50 text-red-600 border-red-100';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle2 size={14} />;
      case 'PENDING':
        return <Clock size={14} />;
      default:
        return <XCircle size={14} />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
        <p className="text-gray-500 font-medium uppercase tracking-widest text-[10px]">Memuat riwayat transaksi...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Riwayat Pembelian', active: true },
        ]} 
      />

      <div className="mb-12 mt-4">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 uppercase italic">
          Riwayat <span className="text-blue-600">Pembelian</span>
        </h1>
        <p className="text-slate-500 max-w-2xl font-medium">
          Pantau status pembayaran dan akses paket materi yang telah Anda beli.
        </p>
      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-20 text-center shadow-xl shadow-slate-200/50">
          <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
            <CreditCard size={40} />
          </div>
          <h3 className="text-xl font-black text-slate-900 uppercase italic mb-2 tracking-tight">Belum Ada Transaksi</h3>
          <p className="text-slate-500 font-medium mb-8">Anda belum pernah melakukan pembelian paket materi.</p>
          <button 
            onClick={() => window.location.href = '/dashboard/paket-pembelian-user'}
            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs"
          >
            Beli Paket Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {history.map((item) => (
            <div 
              key={item.id}
              className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-blue-500 transition-all group"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Package size={28} />
                </div>
                <div>
                   <div className="flex items-center gap-3 mb-1">
                     <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight">{item.paketPembelian?.name || 'Paket Materi'}</h3>
                     <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${getStatusStyle(item.status)}`}>
                        {getStatusIcon(item.status)}
                        {item.status}
                     </span>
                   </div>
                   <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CreditCard size={14} />
                        {item.merchantRef}
                      </div>
                   </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-6 md:pt-0">
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Total Pembayaran</span>
                  <span className="text-xl font-black text-slate-900 tracking-tighter">Rp {item.amount.toLocaleString('id-ID')}</span>
                </div>
                
                {item.status === 'PENDING' && (
                   <button 
                    onClick={() => window.location.href = `/checkout/${item.id}`} // Should ideally link back to instructions
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
                   >
                     Bayar Sekarang
                     <ExternalLink size={14} />
                   </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
