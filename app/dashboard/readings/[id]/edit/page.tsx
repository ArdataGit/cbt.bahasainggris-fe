'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, AlertCircle, Search, Check, X, Library } from 'lucide-react';
import axios from 'axios';
import Breadcrumbs from '@/app/components/breadcrumbs';
import Editor from '@/app/components/editor';

interface Category {
  id: number;
  name: string;
}

export default function EditReadingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    categoryIds: number[];
  }>({
    title: '',
    content: '',
    categoryIds: []
  });
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    Promise.all([fetchReading(), fetchCategories()]);
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reading-categories`);
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchReading = async () => {
    try {
      setFetching(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/readings/${id}`);
      if (response.data.success) {
        setFormData({
          title: response.data.data.title,
          content: response.data.data.content,
          categoryIds: response.data.data.categories?.map((c: any) => c.id) || []
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch reading.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCategoryToggle = (categoryId: number) => {
    setFormData(prev => {
      const isSelected = prev.categoryIds.includes(categoryId);
      if (isSelected) {
        return { ...prev, categoryIds: prev.categoryIds.filter(id => id !== categoryId) };
      } else {
        return { ...prev, categoryIds: [...prev.categoryIds, categoryId] };
      }
    });
  };

  const handleContentChange = (content: string) => {
    setFormData({
      ...formData,
      content: content
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/readings/${id}`, formData);

      if (response.data.success) {
        router.push('/dashboard/readings');
        router.refresh();
      } else {
        throw new Error(response.data.message || 'Failed to update reading.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-6xl mx-auto py-20 flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="animate-spin mb-4 text-blue-600" size={48} />
        <p className="text-lg font-medium">Fetching reading data...</p>
      </div>
    );
  }

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCategories = categories.filter(c => formData.categoryIds.includes(c.id));

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Readings', href: '/dashboard/readings' },
          { label: 'Edit', active: true },
        ]} 
      />

      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard/readings"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          aria-label="Back to readings"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Reading</h1>
          <p className="text-sm text-gray-500 mt-1">Update the title and content of your reading material.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {error && (
          <div className="m-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-3">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="divide-y divide-gray-100">
          <div className="p-6 lg:p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-2">
                    Reading Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-gray-950 font-medium"
                    placeholder="Enter a descriptive title..."
                  />
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-bold text-gray-700 mb-2">
                    Reading Content
                  </label>
                  <Editor 
                    value={formData.content}
                    onChange={handleContentChange}
                    placeholder="Paste or write the reading passage here..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700">
                  Reading Categories
                </label>
                
                <div className="relative">
                  <div 
                    className="min-h-[50px] p-2 bg-white border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 transition-all cursor-text flex flex-wrap gap-2"
                    onClick={() => setIsOpen(true)}
                  >
                    {selectedCategories.length === 0 && !isOpen && (
                      <span className="text-gray-400 text-sm py-1.5 px-2">Select categories...</span>
                    )}
                    {selectedCategories.map(cat => (
                      <span 
                        key={cat.id}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold border border-blue-100 uppercase transition-all"
                      >
                        {cat.name}
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCategoryToggle(cat.id);
                          }}
                          className="hover:text-blue-900 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                    <input 
                      type="text"
                      className="flex-1 bg-transparent border-none outline-none text-sm min-w-[120px] py-1 px-2 text-gray-900"
                      placeholder={selectedCategories.length > 0 ? "" : "Search categories..."}
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                      }}
                      onFocus={() => setIsOpen(true)}
                    />
                  </div>

                  {isOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                      <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto overflow-x-hidden p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                        {filteredCategories.length === 0 ? (
                          <div className="p-4 text-center text-sm text-gray-500 flex flex-col items-center gap-2">
                            <Search size={20} className="text-gray-300" />
                            <p>No categories found</p>
                          </div>
                        ) : (
                          filteredCategories.map(cat => {
                            const isSelected = formData.categoryIds.includes(cat.id);
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => handleCategoryToggle(cat.id)}
                                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all group ${
                                  isSelected 
                                    ? 'bg-blue-50 text-blue-700' 
                                    : 'hover:bg-gray-50 text-gray-700'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                                    isSelected 
                                      ? 'bg-blue-600 border-blue-600 text-white' 
                                      : 'bg-white border-gray-200 text-gray-400 group-hover:border-gray-300'
                                  }`}>
                                    <Library size={16} />
                                  </div>
                                  <span className="text-sm font-bold uppercase tracking-tight">{cat.name}</span>
                                </div>
                                {isSelected && <Check size={18} className="text-blue-600" />}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-2">
                  <Link 
                    href="/dashboard/readings/categories/create"
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 w-fit"
                  >
                    + Create New Category
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 flex items-center justify-end gap-3">
            <Link 
              href="/dashboard/readings"
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
                  Update Reading
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
