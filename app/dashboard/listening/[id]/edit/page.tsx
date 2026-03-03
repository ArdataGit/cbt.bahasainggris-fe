'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Music, AlertCircle, Upload, Search, Check, X, Library } from 'lucide-react';
import axios from 'axios';
import Breadcrumbs from '@/app/components/breadcrumbs';
import Editor from '@/app/components/editor';

export default function EditListeningPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    audioUrl: '',
    categoryIds: [] as number[]
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchListening();
    fetchCategories();
  }, [id]);

  const fetchCategories = async () => {
    try {
      setFetchingCategories(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/listening-categories`);
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setFetchingCategories(false);
    }
  };

  const fetchListening = async () => {
    try {
      setFetching(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/listening/${id}`);
      if (response.data.success) {
        const item = response.data.data;
        setFormData({
          title: item.title,
          content: item.content,
          audioUrl: item.audioUrl || '',
          categoryIds: item.categories?.map((c: any) => c.id) || []
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch listening material.');
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleContentChange = (content: string) => {
    setFormData({
      ...formData,
      content: content
    });
  };

  const toggleCategory = (categoryId: number) => {
    const isSelected = formData.categoryIds.includes(categoryId);
    const newCategoryIds = isSelected
      ? formData.categoryIds.filter(id => id !== categoryId)
      : [...formData.categoryIds, categoryId];
    
    setFormData({
      ...formData,
      categoryIds: newCategoryIds
    });
  };

  const removeCategory = (categoryId: number) => {
    setFormData({
      ...formData,
      categoryIds: formData.categoryIds.filter(id => id !== categoryId)
    });
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCategories = categories.filter(c => formData.categoryIds.includes(c.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('content', formData.content);
      // Keep existing URL if no new file is selected
      data.append('audioUrl', formData.audioUrl);
      
      // Append categoryIds as a JSON string
      if (formData.categoryIds.length > 0) {
        data.append('categoryIds', JSON.stringify(formData.categoryIds));
      }
      
      if (audioFile) {
        data.append('audio', audioFile);
      }

      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/listening/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        router.push('/dashboard/listening');
        router.refresh();
      } else {
        throw new Error(response.data.message || 'Failed to update listening material.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-4xl mx-auto py-20 flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="animate-spin mb-4 text-blue-600" size={48} />
        <p className="text-lg font-medium">Fetching listening data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Listening', href: '/dashboard/listening' },
          { label: 'Edit', active: true },
        ]} 
      />

      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard/listening"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          aria-label="Back to listening list"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Listening</h1>
          <p className="text-sm text-gray-500 mt-1">Update title, transcript or audio file.</p>
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
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                Listening Title
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

            <div>
              <label htmlFor="audio" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Music size={16} className="text-blue-600" />
                Audio File
              </label>
              
              {formData.audioUrl && !audioFile && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <Music size={14} />
                    <span className="font-medium truncate max-w-xs">{formData.audioUrl.split('/').pop()}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-blue-200 text-blue-700 px-2 py-0.5 rounded uppercase">Current</span>
                </div>
              )}

              <div 
                onClick={() => document.getElementById('audio')?.click()}
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors bg-gray-50/50 cursor-pointer group/upload"
              >
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 group-hover/upload:text-blue-500 transition-colors" />
                  <div className="flex text-sm text-gray-600">
                    <span className="relative rounded-md font-medium text-blue-600 hover:text-blue-500">
                      {audioFile ? 'Change file' : 'Upload a new file'}
                    </span>
                    <input id="audio" name="audio" type="file" className="sr-only" accept="audio/*" onChange={handleFileChange} />
                    <p className="pl-1 text-gray-500">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {audioFile ? audioFile.name : 'MP3, WAV up to 10MB'}
                  </p>
                </div>
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Library size={16} className="text-gray-400" />
                Select Categories
              </label>
              
              <div className="relative">
                <div 
                  className="min-h-[50px] w-full px-4 py-2 rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 outline-none transition-all bg-white cursor-pointer flex flex-wrap gap-2 items-center"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {selectedCategories.length === 0 && !isDropdownOpen && (
                    <span className="text-gray-400 text-sm">Select categories for this listening...</span>
                  )}
                  {selectedCategories.map(c => (
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
                      placeholder={selectedCategories.length > 0 ? "Search more..." : ""}
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
                      ) : filteredCategories.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm italic">
                          No categories found for "{searchTerm}"
                        </div>
                      ) : (
                        filteredCategories.map(c => {
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
                                {c.description && (
                                  <span className="text-xs text-gray-500 line-clamp-1">{c.description}</span>
                                )}
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
              <p className="text-[10px] text-gray-500 mt-1.5 ml-1 italic">Associate this listening material with one or more categories.</p>
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
                Description / Transcript
              </label>
              <Editor 
                value={formData.content}
                onChange={handleContentChange}
                placeholder="Enter transcript or instructions here..."
              />
            </div>
          </div>

          <div className="p-6 bg-gray-50 flex items-center justify-end gap-3">
            <Link 
              href="/dashboard/listening"
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
                  Update Listening
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
