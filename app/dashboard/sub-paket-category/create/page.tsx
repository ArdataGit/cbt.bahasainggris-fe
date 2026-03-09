'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Tag, FolderTree } from 'lucide-react';
import axios from 'axios';
import Breadcrumbs from '@/app/components/breadcrumbs';

interface Category {
  id: number;
  categoryName: string;
}

export default function CreateSubPaketCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    subCategoryName: '',
    paketCategoryId: ''
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setFetchingCategories(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/paket-categories`);
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setFetchingCategories(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.paketCategoryId) {
      setError('Please select a parent category.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/sub-paket-categories`, formData);

      if (response.data.success) {
        router.push('/dashboard/sub-paket-category');
        router.refresh();
      } else {
        throw new Error(response.data.message || 'Failed to create sub category.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 text-gray-950">
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Sub Paket Category', href: '/dashboard/sub-paket-category' },
          { label: 'Create', active: true },
        ]} 
      />

      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard/sub-paket-category"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Sub Paket Category</h1>
          <p className="text-sm text-gray-500 mt-1">Define a new sub-category under a parent category.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-gray-950">
        {error && (
          <div className="m-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <span>⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="p-6 lg:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="paketCategoryId" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Tag size={16} className="text-gray-400" />
                  Parent Category
                </label>
                <select
                  id="paketCategoryId"
                  name="paketCategoryId"
                  value={formData.paketCategoryId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium bg-white"
                >
                  <option value="">Select Parent Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                  ))}
                </select>
                {fetchingCategories && <p className="text-[10px] text-gray-500 mt-1 italic">Loading parent categories...</p>}
              </div>

              <div>
                <label htmlFor="subCategoryName" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FolderTree size={16} className="text-gray-400" />
                  Sub Category Name
                </label>
                <input
                  type="text"
                  id="subCategoryName"
                  name="subCategoryName"
                  value={formData.subCategoryName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
                  placeholder="e.g. Reading Part 1, Academic Writing"
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 flex items-center justify-end gap-3">
            <Link 
              href="/dashboard/sub-paket-category"
              className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 rounded-lg transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-md active:shadow-sm transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Sub Category
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
