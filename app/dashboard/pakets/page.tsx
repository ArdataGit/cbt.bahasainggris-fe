'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Loader2, Package, LayoutTemplate, Copy, Check } from 'lucide-react';
import axios from 'axios';
import Breadcrumbs from '@/app/components/breadcrumbs';

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

export default function PaketListPage() {
  const [pakets, setPakets] = useState<Paket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

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

  const handleCopyLink = (id: number) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const url = `${baseUrl}/test/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this Paket? Unlinked passages are NOT deleted, only their association to this Paket.')) return;

    try {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/pakets/${id}`);
      if (response.data.success) {
        setPakets(pakets.filter(item => item.id !== id));
      } else {
        alert(response.data.message || 'Failed to delete.');
      }
    } catch (err) {
      alert('Error deleting Paket.');
    }
  };

  const filteredPakets = pakets.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Pakets', active: true },
        ]} 
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bundled Pakets</h1>
          <p className="text-sm text-gray-500 mt-1">Combine Reading, Listening, Writing, and Speaking passages into complete exam packages.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/pakets/create"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold transition-all shadow-sm active:scale-95"
          >
            <Plus size={18} />
            <span>Create Paket</span>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden pb-4">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search pakets..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Package Details</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Passage Counts</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <Loader2 className="animate-spin mx-auto text-blue-500 mb-2" size={24} />
                    Loading pakets...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-red-500 font-medium border border-red-100 bg-red-50 m-4 rounded-lg">
                    ⚠️ Error: {error}
                  </td>
                </tr>
              ) : filteredPakets.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <LayoutTemplate size={32} />
                    </div>
                    No exam packages found.
                  </td>
                </tr>
              ) : (
                filteredPakets.map((item) => {
                  const totalCounts = 
                    (item._count?.readingCategories || 0) + 
                    (item._count?.listeningCategories || 0) + 
                    (item._count?.writingCategories || 0) + 
                    (item._count?.speakingCategories || 0);

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-110 transition-transform">
                            <Package size={20} />
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{item.name}</span>
                            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{item.description || 'No description'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                            {item._count.readingCategories > 0 && <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">{item._count.readingCategories} Reading Category</span>}
                            {item._count.listeningCategories > 0 && <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100">{item._count.listeningCategories} Listening Category</span>}
                            {item._count.writingCategories > 0 && <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-100">{item._count.writingCategories} Writing Category</span>}
                            {item._count.speakingCategories > 0 && <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">{item._count.speakingCategories} Speaking Category</span>}
                            {totalCounts === 0 && <span className="text-xs text-gray-400 italic">Empty Package</span>}
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleCopyLink(item.id)}
                            className={`p-2 rounded-lg transition-colors border border-transparent ${copiedId === item.id ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-100'}`}
                            title="Copy Test Link"
                          >
                            {copiedId === item.id ? <Check size={18} /> : <Copy size={18} />}
                          </button>
                          <Link 
                            href={`/dashboard/pakets/${item.id}/edit`}
                            className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-100"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </Link>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
