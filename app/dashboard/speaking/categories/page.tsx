'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Loader2, Library, ChevronRight, LayoutTemplate } from 'lucide-react';
import axios from 'axios';
import Breadcrumbs from '@/app/components/breadcrumbs';

interface SpeakingCategory {
  id: number;
  name: string;
  description: string | null;
  timer: number;
  createdAt: string;
  _count: {
    speakings: number;
  };
}

export default function SpeakingCategoryListPage() {
  const [categories, setCategories] = useState<SpeakingCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/speaking-categories`);
      if (response.data.success) {
        setCategories(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch categories.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category? Associations with speaking materials will be removed.')) return;

    try {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/speaking-categories/${id}`);
      if (response.data.success) {
        setCategories(categories.filter(item => item.id !== id));
      } else {
        alert(response.data.message || 'Failed to delete.');
      }
    } catch (err) {
      alert('Error deleting category');
    }
  };

  const filteredCategories = categories.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Speaking', href: '/dashboard/speaking' },
          { label: 'Categories', active: true },
        ]} 
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Speaking Categories</h1>
          <p className="text-sm text-gray-500 mt-1">Organize speaking scenarios into timed sections or topics.</p>
        </div>
        <div className="flex items-center gap-3">
           <Link 
            href="/dashboard/speaking"
            className="inline-flex items-center justify-center gap-2 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2.5 rounded-lg font-bold transition-all shadow-sm"
          >
            Back to Speaking
          </Link>
          <Link 
            href="/dashboard/speaking/categories/create"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold transition-all shadow-sm active:scale-95"
          >
            <Plus size={18} />
            <span>Create Category</span>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden pb-4">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search categories..." 
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
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Passages</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Timer Limit</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <Loader2 className="animate-spin mx-auto text-blue-500 mb-2" size={24} />
                    Loading categories...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-red-500 font-medium border border-red-100 bg-red-50 m-4 rounded-lg">
                    ⚠️ Error: {error}
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <LayoutTemplate size={32} />
                    </div>
                    No speaking categories found.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                         <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-110 transition-transform">
                          <Library size={20} />
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{item.name}</span>
                          <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{item.description || 'No description'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 shadow-sm">
                        {item._count?.speakings || 0} Assignments
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{item.timer}</span>
                      <span className="text-gray-500 ml-1 text-sm">minutes</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/dashboard/speaking/categories/${item.id}/edit`}
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
