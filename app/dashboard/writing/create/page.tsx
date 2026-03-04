'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Tag, Search, Check, X } from 'lucide-react';
import axios from 'axios';
import Breadcrumbs from '@/app/components/breadcrumbs';
import Editor from '@/app/components/editor';

export default function CreateWritingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    jenis: 'ESSAY',
    targetWords: 150,
    categoryIds: [] as number[]
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setFetchingCategories(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/writing-categories`);
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setFetchingCategories(false);
    }
  };

  const toggleCategory = (id: number) => {
    const isSelected = formData.categoryIds.includes(id);
    const newCategoryIds = isSelected
      ? formData.categoryIds.filter(cid => cid !== id)
      : [...formData.categoryIds, id];
    
    setFormData({
      ...formData,
      categoryIds: newCategoryIds
    });
  };

  const removeCategory = (id: number) => {
    setFormData({
      ...formData,
      categoryIds: formData.categoryIds.filter(cid => cid !== id)
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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
      const payload = {
        ...formData,
        categoryIds: `[${formData.categoryIds.join(',')}]` // Send as stringified array for multipart or parsed by controller
      };
      // actually writing endpoint doesn't use formData (no file), it uses application/json
      const jsonPayload = {
        ...formData,
        categoryIds: formData.categoryIds
      };
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/writing`, jsonPayload);

      if (response.data.success) {
        router.push('/dashboard/writing');
        router.refresh();
      } else {
        throw new Error(response.data.message || 'Failed to create writing material.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Writing', href: '/dashboard/writing' },
          { label: 'Create', active: true },
        ]} 
      />

      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard/writing"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          aria-label="Back to writing list"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">Create Writing</h1>
          <p className="text-sm text-gray-500 mt-1">Add a new writing prompt or passage.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-gray-950">
        {error && (
          <div className="m-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <span className="shrink-0">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="divide-y divide-gray-100">
          <div className="p-6 lg:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="jenis" className="block text-sm font-semibold text-gray-700 mb-2">
                  Writing Type
                </label>
                <select
                  id="jenis"
                  name="jenis"
                  value={formData.jenis}
                  onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-medium bg-white"
                >
                  <option value="ESSAY">Essay</option>
                  <option value="SHORT_ANSWER">Short Answer</option>
                </select>
              </div>
              <div>
                <label htmlFor="targetWords" className="block text-sm font-semibold text-gray-700 mb-2">
                  Target Word Count
                </label>
                <input
                  type="number"
                  id="targetWords"
                  name="targetWords"
                  value={formData.targetWords}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                  placeholder="e.g. 150"
                />
              </div>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                Writing Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-lg font-medium"
                placeholder="Enter title here..."
              />
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Tag size={16} className="text-gray-400" />
                Select Categories
              </label>
              
              <div className="relative">
                <div 
                  className="min-h-[50px] w-full px-4 py-2 rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 outline-none transition-all bg-white cursor-pointer flex flex-wrap gap-2 items-center"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {formData.categoryIds.length === 0 && !isDropdownOpen && (
                    <span className="text-gray-400 text-sm">Select categories...</span>
                  )}
                  {categories.filter(c => formData.categoryIds.includes(c.id)).map(c => (
                    <span 
                      key={c.id} 
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md border border-blue-100"
                    >
                      {c.name}
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); removeCategory(c.id); }}
                        className="hover:text-blue-900"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                  <div className="flex-1 min-w-[120px]">
                    <input
                      type="text"
                      className="w-full bg-transparent border-none outline-none text-sm placeholder:text-gray-400"
                      placeholder={formData.categoryIds.length > 0 ? "Search more..." : ""}
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if (!isDropdownOpen) setIsDropdownOpen(true);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={() => setIsDropdownOpen(true)}
                    />
                  </div>
                </div>

                {isDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsDropdownOpen(false)}
                    ></div>
                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto divide-y divide-gray-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      {fetchingCategories ? (
                        <div className="p-4 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
                          <Loader2 size={16} className="animate-spin" />
                          Loading categories...
                        </div>
                      ) : categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm italic">
                          No categories found for "{searchTerm}"
                        </div>
                      ) : (
                        categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map(c => {
                          const isSelected = formData.categoryIds.includes(c.id);
                          return (
                            <div 
                              key={c.id}
                              className={`px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}
                              onClick={() => toggleCategory(c.id)}
                            >
                              <div className="flex flex-col">
                                <span className={`text-sm font-bold ${isSelected ? 'text-blue-600' : 'text-gray-900'}`}>
                                  {c.name}
                                </span>
                              </div>
                              {isSelected && <Check size={16} className="text-blue-600" />}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
                Writing Content / Instructions
              </label>
              <Editor 
                value={formData.content}
                onChange={handleContentChange}
                placeholder="Enter the background text or writing prompt here..."
              />
            </div>
          </div>

          <div className="p-6 bg-gray-50 flex items-center justify-end gap-3">
            <Link 
              href="/dashboard/writing"
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
                  Save Writing
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
