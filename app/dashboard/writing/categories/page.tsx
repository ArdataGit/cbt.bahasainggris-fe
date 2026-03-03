'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit, Trash2, Loader2, AlertCircle, Library, Tag, Clock } from 'lucide-react';
import axios from 'axios';
import Breadcrumbs from '@/app/components/breadcrumbs';

interface Category {
  id: number;
  name: string;
  description: string | null;
  timer: number;
  _count?: {
    writings: number;
    questions: number;
  };
  createdAt: string;
}

export default function WritingCategoryPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/writing-categories`);
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
    if (!confirm('Are you sure you want to delete this category? Associations will be removed, but writings will not be deleted.')) return;
    
    try {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/writing-categories/${id}`);
      if (response.data.success) {
        setCategories(categories.filter(item => item.id !== id));
      } else {
        alert(response.data.message || 'Failed to delete category');
      }
    } catch (err) {
      alert('Error deleting category');
    }
  };

  const filteredCategories = categories.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Writing', href: '/dashboard/writing' },
          { label: 'Categories', active: true },
        ]} 
      />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <Library size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Writing Categories</h1>
            <p className="text-sm text-gray-500 mt-1">Manage categories and default timers for writing materials.</p>
          </div>
        </div>
        <Link 
          href="/dashboard/writing/categories/create"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold transition-all shadow-sm hover:shadow-md active:shadow-none"
        >
          <Plus size={18} />
          <span>Create Category</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search categories..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-gray-950"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-500 font-medium">
          Total: <span className="text-blue-600 font-bold">{filteredCategories.length}</span> categories
        </div>
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden box-border max-w-full">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-500">
            <Loader2 className="animate-spin mb-4 text-blue-600" size={40} />
            <p className="font-medium">Loading categories...</p>
          </div>
        ) : error ? (
          <div className="py-20 flex flex-col items-center justify-center text-red-500 px-4 text-center">
            <AlertCircle size={40} className="mb-4" />
            <p className="font-bold text-lg">Error loading data</p>
            <p className="text-sm opacity-80 max-w-sm mx-auto">{error}</p>
            <button 
              onClick={fetchCategories}
              className="mt-6 px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-bold transition-all"
            >
              Try Again
            </button>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-500 px-4 text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <Tag size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No categories found</h3>
            <p className="text-sm max-w-xs mx-auto mb-6">Create your first testing category to group writing materials.</p>
            <Link 
              href="/dashboard/writing/categories/create"
              className="bg-white border border-gray-300 hover:border-blue-500 hover:text-blue-600 px-6 py-2 rounded-lg font-bold transition-all shadow-sm"
            >
              Create Category
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/3">Name & Description</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Timer</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Materials</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Questions</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCategories.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{item.name}</p>
                        {item.description ? (
                          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{item.description}</p>
                        ) : (
                          <p className="text-xs text-gray-400 italic mt-0.5">No description</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                        <Clock size={14} className="text-orange-500" />
                        <span>{item.timer} <span className="text-xs text-gray-500 font-normal">min</span></span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        {item._count?.writings || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100">
                        {item._count?.questions || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link 
                          href={`/dashboard/writing/categories/${item.id}/edit`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
