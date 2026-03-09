'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Trash2, 
  Loader2, 
  Package, 
  LayoutTemplate,
  Check,
  X,
  PlusCircle,
  ArrowRight
} from 'lucide-react';
import axios from 'axios';
import Breadcrumbs from '@/app/components/breadcrumbs';

interface Paket {
  id: number;
  name: string;
  isFree: boolean;
  paketCategory: { categoryName: string } | null;
  subPaketCategory: { subCategoryName: string } | null;
}

interface LandingPaket {
  id: number;
  paketId: number;
  paket: Paket;
  order: number;
}

export default function LandingPaketListPage() {
  const [landingPakets, setLandingPakets] = useState<LandingPaket[]>([]);
  const [availablePakets, setAvailablePakets] = useState<Paket[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingAvailable, setFetchingAvailable] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLandingPakets();
  }, []);

  const fetchLandingPakets = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/landing-pakets`);
      if (response.data.success) {
        setLandingPakets(response.data.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch Landing Pakets.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePakets = async () => {
    try {
      setFetchingAvailable(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/pakets`);
      if (response.data.success) {
        // Filter out pakets already in landingPakets and only show free ones
        const currentIds = landingPakets.map(lp => lp.paketId);
        const freePakets = response.data.data.filter((p: Paket) => p.isFree && !currentIds.includes(p.id));
        setAvailablePakets(freePakets);
      }
    } catch (err: any) {
      console.error('Failed to fetch available pakets:', err);
    } finally {
      setFetchingAvailable(false);
    }
  };

  useEffect(() => {
    if (showAddModal) {
      fetchAvailablePakets();
    }
  }, [showAddModal, landingPakets]);

  const handleAddLandingPaket = async (paketId: number) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/landing-pakets`, { paketId });
      if (response.data.success) {
        setLandingPakets([...landingPakets, response.data.data]);
        setShowAddModal(false);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add paket.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this package from landing page?')) return;

    try {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/landing-pakets/${id}`);
      if (response.data.success) {
        setLandingPakets(landingPakets.filter(lp => lp.id !== id));
      }
    } catch (err: any) {
      alert('Error removing landing paket.');
    }
  };

  const filteredAvailable = availablePakets.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Landing Page Pakets', active: true },
        ]} 
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Landing Page Curated Pakets</h1>
          <p className="text-sm text-gray-500 mt-1">Manage which free packages are featured on the main landing page.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold transition-all shadow-sm active:scale-95"
        >
          <Plus size={18} />
          <span>Add Custom Paket</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden pb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Package Details</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role/Category</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <Loader2 className="animate-spin mx-auto text-blue-500 mb-2" size={24} />
                    Loading Landing Pakets...
                  </td>
                </tr>
              ) : landingPakets.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <LayoutTemplate size={32} />
                    </div>
                    No packages curated for landing page yet.
                  </td>
                </tr>
              ) : (
                landingPakets.map((lp, index) => (
                  <tr key={lp.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-gray-400">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                          <Package size={20} />
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 uppercase">{lp.paket?.name}</span>
                          <p className="text-xs text-gray-500 mt-0.5">ID: {lp.paketId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {lp.paket?.paketCategory && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                            {lp.paket.paketCategory.categoryName}
                          </span>
                        )}
                        {lp.paket?.isFree && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100 uppercase">
                            Free
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleDelete(lp.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                          title="Remove from Landing"
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

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Select Free Package</h2>
                <p className="text-sm text-gray-500 mt-0.5">Add a free package to be featured on landing page</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                aria-label="Close"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search available free pakets..." 
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {fetchingAvailable ? (
                  <div className="py-12 text-center text-gray-500">
                    <Loader2 className="animate-spin mx-auto text-blue-500 mb-2" size={24} />
                    Fetching pakets...
                  </div>
                ) : filteredAvailable.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    <Package className="mx-auto text-gray-200 mb-4" size={48} />
                    <p className="font-medium text-gray-600">No available free packages found</p>
                    <p className="text-sm text-gray-400 mt-1">Try marking some packages as "Free" in the Paket Master.</p>
                  </div>
                ) : (
                  filteredAvailable.map(paket => (
                    <div 
                      key={paket.id}
                      className="group flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-pointer"
                      onClick={() => handleAddLandingPaket(paket.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                          <Package size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{paket.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                             {paket.paketCategory && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 uppercase border border-gray-200 group-hover:bg-white transition-colors">
                                  {paket.paketCategory.categoryName}
                                </span>
                             )}
                          </div>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                        <Plus size={20} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500 italic">Only packages marked as "Free" are shown here.</span>
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
