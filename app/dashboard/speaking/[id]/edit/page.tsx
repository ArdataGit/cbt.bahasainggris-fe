'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Upload, AlertCircle, Play, Tag, Search, Check, X } from 'lucide-react';
import axios from 'axios';
import Breadcrumbs from '@/app/components/breadcrumbs';
import Editor from '@/app/components/editor';

export default function EditSpeakingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    jenis: 'MENIRU' as 'MENIRU' | 'MENJAWAB',
    categoryIds: [] as number[]
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSpeaking();
    fetchCategories();
  }, [id]);

  useEffect(() => {
    return () => {
      if (audioPreviewUrl) {
        URL.revokeObjectURL(audioPreviewUrl);
      }
    };
  }, [audioPreviewUrl]);

  const fetchCategories = async () => {
    try {
      setFetchingCategories(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/speaking-categories`);
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setFetchingCategories(false);
    }
  };

  const fetchSpeaking = async () => {
    try {
      setFetching(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/speakings/${id}`);
      if (response.data.success) {
        const item = response.data.data;
        setFormData({
          title: item.title,
          content: item.content,
          jenis: item.jenis,
          categoryIds: item.categories?.map((c: any) => c.id) || []
        });
        if (item.audioUrl) {
          setCurrentAudioUrl(item.audioUrl);
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch speaking material.');
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

  const handleContentChange = (content: string) => {
    setFormData({
      ...formData,
      content: content
    });
  };

  const toggleCategory = (categoryId: number) => {
    const isSelected = formData.categoryIds.includes(categoryId);
    const newCategoryIds = isSelected
      ? formData.categoryIds.filter(cid => cid !== categoryId)
      : [...formData.categoryIds, categoryId];
    
    setFormData({
      ...formData,
      categoryIds: newCategoryIds
    });
  };

  const removeCategory = (categoryId: number) => {
    setFormData({
      ...formData,
      categoryIds: formData.categoryIds.filter(cid => cid !== categoryId)
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('audio/')) {
        setError('Please select a valid audio file (MP3, WAV, etc.)');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('Audio file size should not exceed 10MB');
        return;
      }
      if (audioPreviewUrl) {
        URL.revokeObjectURL(audioPreviewUrl);
      }
      setAudioFile(file);
      setAudioPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('content', formData.content);
      submitData.append('jenis', formData.jenis);
      
      if (formData.categoryIds.length > 0) {
          submitData.append('categoryIds', JSON.stringify(formData.categoryIds));
      } else {
          submitData.append('categoryIds', '[]');
      }

      if (audioFile) {
        submitData.append('audio', audioFile);
      }

      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/speakings/${id}`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        router.push('/dashboard/speaking');
        router.refresh();
      } else {
        throw new Error(response.data.message || 'Failed to update speaking material.');
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
        <p className="text-lg font-medium">Fetching speaking data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Speaking', href: '/dashboard/speaking' },
          { label: 'Edit', active: true },
        ]} 
      />

      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard/speaking"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          aria-label="Back to speaking list"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">Edit Speaking</h1>
          <p className="text-sm text-gray-500 mt-1">Update title, instructions, or audio file.</p>
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
                Title
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

            {/* Speaking Type Selection */}
            <div>
              <label htmlFor="jenis" className="block text-sm font-semibold text-gray-700 mb-2">
                Speaking Type
              </label>
              <select
                id="jenis"
                name="jenis"
                value={formData.jenis}
                onChange={(e) => setFormData({ ...formData, jenis: e.target.value as 'MENIRU' | 'MENJAWAB' })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-medium bg-white"
              >
                <option value="MENIRU">Meniru (Repeat)</option>
                <option value="MENJAWAB">Menjawab (Answer)</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                {formData.jenis === 'MENIRU' 
                  ? 'Focuses on pronunciation and mimicry of the audio prompt.' 
                  : 'Focuses on comprehension and answering specific questions.'}
              </p>
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Audio File (Optional)
              </label>
              
              {currentAudioUrl && !audioFile && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-lg flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Play size={18} fill="currentColor" className="ml-0.5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Current Audio</p>
                    </div>
                  </div>
                  <audio controls className="w-full mt-2">
                    <source src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${currentAudioUrl}`} />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors relative group">
                <div className="space-y-2 text-center">
                  <Upload className="mx-auto h-10 w-10 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label
                      htmlFor="audio-upload"
                      className="relative cursor-pointer bg-transparent rounded-md font-bold text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-2"
                    >
                      <span>{currentAudioUrl ? 'Replace audio file' : 'Upload an audio file'}</span>
                      <input 
                        id="audio-upload" 
                        name="audio-upload" 
                        type="file" 
                        accept="audio/*"
                        className="sr-only" 
                        onChange={handleFileChange}
                      />
                    </label>
                    {!currentAudioUrl && <p className="pl-1">or drag and drop</p>}
                  </div>
                  <p className="text-xs text-gray-500">
                    MP3, WAV up to 10MB
                  </p>
                  
                  {audioFile && audioPreviewUrl && (
                    <div className="mt-4 flex flex-col gap-2 p-3 bg-green-50 border border-green-100 rounded-lg w-full">
                      <div className="inline-flex items-center gap-2 text-green-700 text-sm font-medium">
                        <Check size={16} />
                        {audioFile.name} (Ready to upload)
                      </div>
                      <audio controls className="w-full mt-2">
                        <source src={audioPreviewUrl} type={audioFile.type} />
                      </audio>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
                Instructions / Content
              </label>
              <Editor 
                value={formData.content}
                onChange={handleContentChange}
                placeholder="Enter the background text or speaking prompt here..."
              />
            </div>
          </div>

          <div className="p-6 bg-gray-50 flex items-center justify-end gap-3">
            <Link 
              href="/dashboard/speaking"
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
                  Update Speaking
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
