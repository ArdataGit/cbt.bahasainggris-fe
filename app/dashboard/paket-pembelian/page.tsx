'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2, 
  Package,
  BadgeCheck,
  CreditCard,
  ShoppingCart
} from 'lucide-react';
import axios from 'axios';
import Breadcrumbs from '@/app/components/breadcrumbs';

interface Paket {
  id: number;
  name: string;
}

interface PaketPembelian {
  id: number;
  name: string;
  price: number;
  label: string;
  description: string | null;
  duration: number;
  pakets: Paket[];
  createdAt: string;
}

export default function PaketPembelianListPage() {
  const [pakets, setPakets] = useState<PaketPembelian[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this purchase package?')) return;

    try {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/paket-pembelians/${id}`);
      if (response.data.success) {
        setPakets(pakets.filter(p => p.id !== id));
      }
    } catch (err: any) {
      alert('Error deleting package.');
    }
  };

  const filteredPakets = pakets.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Paket Pembelian', active: true },
        ]} 
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Paket Pembelian</h1>
          <p className="text-sm text-gray-500 mt-1">Manage purchase packages and their test bundle configurations.</p>
        </div>
        <Link 
          href="/dashboard/paket-pembelian/create"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold transition-all shadow-sm active:scale-95"
        >
          <Plus size={18} />
          <span>Tambah Paket Pembelian</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-4 border-b border-gray-100 flex items-center gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search packages or labels..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Info Paket</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Label</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Harga</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Masa Aktif</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Isi Paket</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <Loader2 className="animate-spin mx-auto text-blue-500 mb-2" size={24} />
                    Loading data...
                  </td>
                </tr>
              ) : filteredPakets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingCart className="text-gray-300" size={32} />
                    </div>
                    No purchase packages found.
                  </td>
                </tr>
              ) : (
                filteredPakets.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold shrink-0 shadow-sm border border-blue-100">
                          <ShoppingCart size={20} />
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 block">{item.name}</span>
                          <span className="text-[10px] text-gray-400 block uppercase font-medium">ID: #{item.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                        item.label === 'VIP' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                        item.label === 'PREMIUM' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {item.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">{formatPrice(item.price)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-600 italic">{item.duration} Hari</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-md">
                        {item.pakets?.length > 0 ? (
                          item.pakets.slice(0, 3).map(p => (
                            <span key={p.id} className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                              {p.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-gray-400 italic">No tests assigned</span>
                        )}
                        {item.pakets?.length > 3 && (
                          <span className="text-[10px] font-bold text-blue-600">+{item.pakets.length - 3} More</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/dashboard/paket-pembelian/${item.id}/edit`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                        >
                          <Edit size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
