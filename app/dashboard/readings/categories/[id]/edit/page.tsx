'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Clock, Tag, AlignLeft, AlertCircle, Search, Check, X, BookOpen } from 'lucide-react';
import axios from 'axios';
import Breadcrumbs from '@/app/components/breadcrumbs';

interface Reading {
  id: number;
  title: string;
}

export default function EditReadingCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [fetchingReadings, setFetchingReadings] = useState(true);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    timer: 60,
    readingIds: [] as number[]
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategory();
    fetchReadings();
  }, [id]);

  const fetchCategory = async () => {
    try {
      setFetching(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reading-categories/${id}`);
      if (response.data.success) {
        const item = response.data.data;
        setFormData({
          name: item.name,
          description: item.description || '',
          timer: item.timer,
          readingIds: item.readings?.map((r: any) => r.id) || []
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch category.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setFetching(false);
    }
  };

  const fetchReadings = async () => {
    try {
      setFetchingReadings(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/readings`);
      if (response.data.success) {
        setReadings(response.data.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch readings:', err);
    } finally {
      setFetchingReadings(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const toggleReading = (readingId: number) => {
    const isSelected = formData.readingIds.includes(readingId);
    const newReadingIds = isSelected
      ? formData.readingIds.filter(rid => rid !== readingId)
      : [...formData.readingIds, readingId];
    
    setFormData({
      ...formData,
      readingIds: newReadingIds
    });
  };

  const removeReading = (readingId: number) => {
    setFormData({
      ...formData,
      readingIds: formData.readingIds.filter(rid => rid !== readingId)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/reading-categories/${id}`, formData);

      if (response.data.success) {
        router.push('/dashboard/readings/categories');
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
      <div className="max-w-6xl mx-auto py-20 flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="animate-spin mb-4 text-blue-600" size={48} />
        <p className="text-lg font-medium">Fetching category data...</p>
      </div>
    );
  }

  const filteredReadings = readings.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedReadings = readings.filter(r => formData.readingIds.includes(r.id));

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Readings', href: '/dashboard/readings' },
          { label: 'Categories', href: '/dashboard/readings/categories' },
          { label: 'Edit', active: true },
        ]} 
      />

      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard/readings/categories"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Reading Category</h1>
          <p className="text-sm text-gray-500 mt-1">Modify category name, description or timer.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-gray-950">
        {error && (
          <div className="m-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-3">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="divide-y divide-gray-100">
          <div className="p-6 lg:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Tag size={16} className="text-gray-400" />
                  Category Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
                  placeholder="e.g. TOEFL Reading Section"
                />
              </div>

              <div>
                <label htmlFor="timer" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  Test Timer (Minutes)
                </label>
                <input
                  type="number"
                  id="timer"
                  name="timer"
                  value={formData.timer}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
                  placeholder="60"
                />
              </div>
            </div>

            {/* Reading Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <BookOpen size={16} className="text-gray-400" />
                Associated Readings
              </label>
              
              <div className="relative">
                <div 
                  className="min-h-[50px] w-full px-4 py-2 rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 outline-none transition-all bg-white cursor-pointer flex flex-wrap gap-2 items-center"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {selectedReadings.length === 0 && !isDropdownOpen && (
                    <span className="text-gray-400 text-sm">Select readings for this category...</span>
                  )}
                  {selectedReadings.map(r => (
                    <span 
                      key={r.id} 
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md border border-blue-100"
                    >
                      {r.title}
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); removeReading(r.id); }}
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
                      placeholder={selectedReadings.length > 0 ? "Search more..." : ""}
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
                      {fetchingReadings ? (
                        <div className="p-4 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
                          <Loader2 size={16} className="animate-spin" />
                          Loading readings...
                        </div>
                      ) : filteredReadings.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm italic">
                          No readings found for "{searchTerm}"
                        </div>
                      ) : (
                        filteredReadings.map(r => {
                          const isSelected = formData.readingIds.includes(r.id);
                          return (
                            <div 
                              key={r.id}
                              className={`px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}
                              onClick={() => toggleReading(r.id)}
                            >
                              <div className="flex flex-col">
                                <span className={`text-sm font-bold ${isSelected ? 'text-blue-600' : 'text-gray-900'}`}>
                                  {r.title}
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
              <p className="text-[10px] text-gray-500 mt-1.5 ml-1 italic">You can add or remove associations between readings and this category.</p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <AlignLeft size={16} className="text-gray-400" />
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none"
                placeholder="Describe what kind of readings are in this category..."
              />
            </div>
          </div>

          <div className="p-6 bg-gray-50 flex items-center justify-end gap-3">
            <Link 
              href="/dashboard/readings/categories"
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
