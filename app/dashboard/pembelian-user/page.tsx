'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  Package, 
  User, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle,
  MoreVertical,
  Filter,
  ArrowRight,
  ExternalLink,
  Loader2
} from 'lucide-react';

interface PembelianUser {
  id: number;
  userId: number;
  user: {
    name: string;
    email: string;
  };
  paketPembelian: {
    name: string;
    price: number;
  };
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED' | 'OVERDUE';
  merchantRef: string | null;
  createdAt: string;
  expiredDuration: string;
}

export default function PembelianUserAdminPage() {
  const [pembelians, setPembelians] = useState<PembelianUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    fetchPembelians();
  }, []);

  const fetchPembelians = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/paket-pembelians/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setPembelians(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat data pembelian.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      setUpdatingId(id);
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/paket-pembelians/user/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setPembelians(prev => prev.map(p => p.id === id ? { ...p, status: newStatus as any } : p));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memperbarui status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredData = pembelians.filter(p => {
    const matchesSearch = 
      p.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.paketPembelian.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.merchantRef?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'PENDING':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'FAILED':
      case 'EXPIRED':
      case 'OVERDUE':
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
      case 'FAILED':
      case 'EXPIRED':
      case 'OVERDUE':
        return <XCircle size={14} />;
      default:
        return <AlertCircle size={14} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Memuat data pembelian...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manajemen Pembelian User</h1>
            <p className="text-slate-500 font-medium">Pantau dan kelola status transaksi paket pembelian seluruh user.</p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Transaksi', value: pembelians.length, icon: Package, color: 'blue' },
            { label: 'Selesai', value: pembelians.filter(p => p.status === 'SUCCESS').length, icon: CheckCircle2, color: 'emerald' },
            { label: 'Pending', value: pembelians.filter(p => p.status === 'PENDING').length, icon: Clock, color: 'amber' },
            { label: 'Gagal/Expired', value: pembelians.filter(p => ['FAILED', 'EXPIRED', 'OVERDUE'].includes(p.status)).length, icon: XCircle, color: 'red' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Cari User, Email, atau Paket..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent rounded-2xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Filter size={18} className="text-slate-400" />
            <select 
              className="bg-slate-50 border-transparent rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Semua Status</option>
              <option value="SUCCESS">Success</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="EXPIRED">Expired</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>
        </div>

        {/* Table/Card List */}
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">User & Paket</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nominal</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredData.length > 0 ? filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm">{item.user.name}</p>
                          <p className="text-xs font-bold text-slate-400 flex items-center gap-1">
                            <Package size={12} /> {item.paketPembelian.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{item.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="space-y-1">
                        <p className="text-sm font-black text-slate-900">Rp {item.amount.toLocaleString('id-ID')}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">REF: {item.merchantRef || '-'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-tighter ${getStatusStyle(item.status)}`}>
                        {getStatusIcon(item.status)}
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-900">{new Date(item.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        <p className="text-[10px] font-bold text-slate-400">{new Date(item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex justify-center">
                        {item.status === 'SUCCESS' ? (
                          <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <CheckCircle2 size={20} />
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleStatusChange(item.id, 'SUCCESS')}
                            disabled={updatingId === item.id}
                            className={`p-2.5 rounded-2xl transition-all flex items-center justify-center ${
                              updatingId === item.id 
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-110 active:scale-95 shadow-lg shadow-emerald-200'
                            }`}
                            title="Konfirmasi Pembayaran (Set Success)"
                          >
                            {updatingId === item.id ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={18} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 rounded-full bg-slate-100 text-slate-400">
                          <Search size={40} />
                        </div>
                        <p className="text-slate-500 font-bold">Tidak ada data pembelian yang ditemukan.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
