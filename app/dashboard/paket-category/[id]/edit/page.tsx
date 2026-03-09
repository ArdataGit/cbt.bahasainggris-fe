'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Tag } from 'lucide-react';
import axios from 'axios';
import Breadcrumbs from '@/app/components/breadcrumbs';

export default function EditPaketCategoryPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    categoryName: ''
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const fetchCategory = async () => {
    try {
      setFetching(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/paket-categories/${id}`);
      if (response.data.success) {
        setFormData({
          categoryName: response.data.data.categoryName
        });
      }
    } catch (err: any) {
      setError('Failed to fetch category details.');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/paket-categories/${id}`, formData);

      if (response.data.success) {
        router.push('/dashboard/paket-category');
        router.refresh();
      } else {
        throw new Error(response.data.message || 'Failed to update category.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Paket Category', href: '/dashboard/paket-category' },
          { label: 'Edit', active: true },
        ]} 
      />

      <div className="flex items-center gap-4 mb-8 text-gray-950">
        <Link 
          href="/dashboard/paket-category"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Paket Category</h1>
          <p className="text-sm text-gray-500 mt-1">Update category name and settings.</p>
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
            <div>
              <label htmlFor="categoryName" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Tag size={16} className="text-gray-400" />
                Category Name
              </label>
              <input
                type="text"
                id="categoryName"
                name="categoryName"
                value={formData.categoryName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
                placeholder="e.g. TOEFL, IELTS, General English"
              />
            </div>
          </div>

          <div className="p-6 bg-gray-50 flex items-center justify-end gap-3">
            <Link 
              href="/dashboard/paket-category"
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
                  Updating...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Update Category
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
