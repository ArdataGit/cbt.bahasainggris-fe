'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Loader2, FolderTree, Archive, Tag } from 'lucide-react';
import axios from 'axios';
import Breadcrumbs from '@/app/components/breadcrumbs';

interface SubCategory {
  id: number;
  subCategoryName: string;
  paketCategoryId: number;
  paketCategory: {
    categoryName: string;
  };
  createdAt: string;
  _count: {
    pakets: number;
  };
}

export default function SubCategoryListPage() {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubCategories();
  }, []);

  const fetchSubCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/sub-paket-categories`);
      if (response.data.success) {
        setSubCategories(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch sub-categories.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this sub-category? Pakets will be unlinked.')) return;

    try {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/sub-paket-categories/${id}`);
      if (response.data.success) {
        setSubCategories(subCategories.filter(item => item.id !== id));
      } else {
        alert(response.data.message || 'Failed to delete.');
      }
    } catch (err) {
      alert('Error deleting sub-category');
    }
  };

  const filteredSubCategories = subCategories.filter(item =>
    item.subCategoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.paketCategory.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 text-gray-950">
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Sub Paket Category', active: true },
        ]} 
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sub Paket Categories</h1>
          <p className="text-sm text-gray-500 mt-1">Manage sub-categories under your parent paket categories.</p>
        </div>
        <Link 
          href="/dashboard/sub-paket-category/create"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold transition-all shadow-sm active:scale-95"
        >
          <Plus size={18} />
          <span>Create Sub Category</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-gray-950">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search sub-category or category..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Sub Category</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Parent Category</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Pakets</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin mx-auto text-blue-500 mb-2" size={24} />
                    <span className="text-gray-500 text-sm">Loading sub-categories...</span>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-red-500 text-sm font-medium">
                    ⚠️ Error: {error}
                  </td>
                </tr>
              ) : filteredSubCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 text-sm">
                    No sub-categories found.
                  </td>
                </tr>
              ) : (
                filteredSubCategories.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm">
                          <FolderTree size={20} />
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{item.subCategoryName}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 text-[11px] font-bold">
                        <Tag size={12} className="mr-1" />
                        {item.paketCategory?.categoryName || 'No Parent'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[11px] font-bold">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">
                        <Archive size={12} className="mr-1" />
                        {item._count.pakets} Pakets
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/dashboard/sub-paket-category/${item.id}/edit`}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
