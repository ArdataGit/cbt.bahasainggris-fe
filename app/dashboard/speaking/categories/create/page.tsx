'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Check, X, Search, Library } from 'lucide-react';
import axios from 'axios';
import Breadcrumbs from '@/app/components/breadcrumbs';

interface Speaking {
  id: number;
  title: string;
}

export default function CreateSpeakingCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    timer: 0,
    speakingIds: [] as number[]
  });
  
  const [speakings, setSpeakings] = useState<Speaking[]>([]);
  const [fetchingSpeakings, setFetchingSpeakings] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSpeakings();
  }, []);

  const fetchSpeakings = async () => {
    try {
      setFetchingSpeakings(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/speakings`);
      if (response.data.success) {
        setSpeakings(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch speakings:', err);
    } finally {
      setFetchingSpeakings(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.name === 'timer' ? parseInt(e.target.value) || 0 : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const toggleSpeaking = (id: number) => {
    const isSelected = formData.speakingIds.includes(id);
    const newSpeakingIds = isSelected
      ? formData.speakingIds.filter(sId => sId !== id)
      : [...formData.speakingIds, id];
    
    setFormData({
      ...formData,
      speakingIds: newSpeakingIds
    });
  };

  const removeSpeaking = (id: number) => {
    setFormData({
      ...formData,
      speakingIds: formData.speakingIds.filter(sId => sId !== id)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        speakingIds: formData.speakingIds.length > 0 ? formData.speakingIds : undefined
      };

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/speaking-categories`, payload);

      if (response.data.success) {
        router.push('/dashboard/speaking/categories');
        router.refresh();
      } else {
        throw new Error(response.data.message || 'Failed to create speaking category.');
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
          { label: 'Speaking', href: '/dashboard/speaking' },
          { label: 'Categories', href: '/dashboard/speaking/categories' },
          { label: 'Create', active: true },
        ]} 
      />

      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard/speaking/categories"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          aria-label="Back to categories"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">Create Speaking Category</h1>
          <p className="text-sm text-gray-500 mt-1">Add a new category and assign speaking passages to it.</p>
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
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Category Name
              </label>
               <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-lg font-medium"
                placeholder="e.g., TOEFL Task 1, IELTS Part 2..."
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none text-sm"
                placeholder="Brief description of this category..."
              />
            </div>

            <div className="w-1/3">
              <label htmlFor="timer" className="block text-sm font-semibold text-gray-700 mb-2">
                Timer (Minutes)
              </label>
               <div className="relative">
                <input
                  type="number"
                  id="timer"
                  name="timer"
                  value={formData.timer}
                  onChange={handleChange}
                  min="0"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">min</span>
              </div>
            </div>

            {/* Speaking Passages Assignment */}
            <div className="pt-4 border-t border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Library size={18} className="text-gray-400" />
                Assign Speaking Passages
              </label>
              
               <div className="relative">
                <div 
                  className="min-h-[50px] w-full px-4 py-2 rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 outline-none transition-all bg-white cursor-pointer flex flex-wrap gap-2 items-center"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {formData.speakingIds.length === 0 && !isDropdownOpen && (
                    <span className="text-gray-400 text-sm">Search and assign passages...</span>
                  )}
                  {speakings.filter(s => formData.speakingIds.includes(s.id)).map(s => (
                    <span 
                      key={s.id} 
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md border border-blue-100 shadow-sm"
                    >
                      {s.title}
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); removeSpeaking(s.id); }}
                        className="hover:text-blue-900 focus:outline-none"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                  <div className="flex-1 min-w-[150px]">
                    <div className="flex items-center gap-2 w-full">
                       {isDropdownOpen && <Search size={14} className="text-gray-400 shrink-0" />}
                      <input
                        type="text"
                        className="w-full bg-transparent border-none outline-none text-sm placeholder:text-gray-400"
                        placeholder={formData.speakingIds.length > 0 ? "Search more..." : (isDropdownOpen ? "Type to search passage titles..." : "")}
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
                </div>

                {isDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsDropdownOpen(false)}
                    ></div>
                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto divide-y divide-gray-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      {fetchingSpeakings ? (
                        <div className="p-4 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
                          <Loader2 size={16} className="animate-spin" />
                          Loading passages...
                        </div>
                      ) : speakings.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm italic">
                          No speakings found matching "{searchTerm}"
                        </div>
                      ) : (
                        speakings.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase())).map(s => {
                          const isSelected = formData.speakingIds.includes(s.id);
                          return (
                            <div 
                              key={s.id}
                              className={`px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}
                              onClick={() => toggleSpeaking(s.id)}
                            >
                              <div className="flex flex-col pr-4">
                                <span className={`text-sm font-bold truncate ${isSelected ? 'text-blue-600' : 'text-gray-900'}`}>
                                  {s.title}
                                </span>
                              </div>
                              <div className="shrink-0 flex items-center">
                                {isSelected ? (
                                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                    <Check size={12} strokeWidth={3} />
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Click the input to search or select from available speaking passages.
              </p>
            </div>

          </div>

          <div className="p-6 bg-gray-50 flex items-center justify-end gap-3 rounded-b-xl">
             <Link 
              href="/dashboard/speaking/categories"
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
                  Save Category
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
