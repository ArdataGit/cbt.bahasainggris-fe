'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Check, X, Search, BookOpen, Headphones, Edit3, Mic } from 'lucide-react';
import axios from 'axios';
import Breadcrumbs from '@/app/components/breadcrumbs';

interface Category {
  id: number;
  name: string;
}

export default function CreatePaketPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    paketCategoryId: '',
    subPaketCategoryId: '',
    readingCategoryIds: [] as number[],
    listeningCategoryIds: [] as number[],
    writingCategoryIds: [] as number[],
    speakingCategoryIds: [] as number[],
    isFree: false,
  });
  
  const [paketCategories, setPaketCategories] = useState<Category[]>([]);
  const [subPaketCategories, setSubPaketCategories] = useState<any[]>([]);
  const [readingCategories, setReadingCategories] = useState<Category[]>([]);
  const [listeningCategories, setListeningCategories] = useState<Category[]>([]);
  const [writingCategories, setWritingCategories] = useState<Category[]>([]);
  const [speakingCategories, setSpeakingCategories] = useState<Category[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllCategories();
  }, []);

  const fetchAllCategories = async () => {
    try {
      setFetching(true);
      const [resR, resL, resW, resS, resPC, resSPC] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reading-categories`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/listening-categories`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/writing-categories`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/speaking-categories`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/paket-categories`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/sub-paket-categories`)
      ]);
      if (resR.data.success) setReadingCategories(resR.data.data);
      if (resL.data.success) setListeningCategories(resL.data.data);
      if (resW.data.success) setWritingCategories(resW.data.data);
      if (resS.data.success) setSpeakingCategories(resS.data.data);
      if (resPC.data.success) setPaketCategories(resPC.data.data.map((c: any) => ({ id: c.id, name: c.categoryName })));
      if (resSPC.data.success) setSubPaketCategories(resSPC.data.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        paketCategoryId: formData.paketCategoryId || null,
        subPaketCategoryId: formData.subPaketCategoryId || null,
        readingCategoryIds: formData.readingCategoryIds,
        listeningCategoryIds: formData.listeningCategoryIds,
        writingCategoryIds: formData.writingCategoryIds,
        speakingCategoryIds: formData.speakingCategoryIds,
        isFree: formData.isFree,
      };

      const token = localStorage.getItem('token');
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/pakets`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.data.success) {
        router.push('/dashboard/pakets');
        router.refresh();
      } else {
        throw new Error(response.data.message || 'Failed to create paket.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // Generic Category Selector Component
  const CategorySelector = ({ 
    type, 
    icon: Icon, 
    title, 
    items, 
    selectedIds, 
    field 
  }: { 
    type: string,
    icon: React.ElementType,
    title: string,
    items: Category[],
    selectedIds: number[],
    field: 'readingCategoryIds' | 'listeningCategoryIds' | 'writingCategoryIds' | 'speakingCategoryIds'
  }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const toggleItem = (id: number) => {
      const isSelected = selectedIds.includes(id);
      const newIds = isSelected ? selectedIds.filter(itemId => itemId !== id) : [...selectedIds, id];
      setFormData(prev => ({ ...prev, [field]: newIds }));
    };

    const removeItem = (id: number) => {
      setFormData(prev => ({ ...prev, [field]: selectedIds.filter(itemId => itemId !== id) }));
    };

    return (
      <div className="pt-6 border-t border-gray-100">
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Icon size={18} className="text-gray-400" />
          Assign {title} Categories
        </label>
        
        <div className="relative">
          <div 
            className="min-h-[50px] w-full px-4 py-2 rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 outline-none transition-all bg-white cursor-pointer flex flex-wrap gap-2 items-center"
            onClick={() => setIsOpen(!isOpen)}
          >
            {selectedIds.length === 0 && !isOpen && (
              <span className="text-gray-400 text-sm">Search and assign {title.toLowerCase()} categories...</span>
            )}
            {items.filter(item => selectedIds.includes(item.id)).map(item => (
              <span 
                key={item.id} 
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md border border-blue-100 shadow-sm"
              >
                {item.name}
                <button 
                  type="button" 
                  onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                  className="hover:text-blue-900 focus:outline-none"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
            <div className="flex-1 min-w-[150px]">
              <div className="flex items-center gap-2 w-full">
                {isOpen && <Search size={14} className="text-gray-400 shrink-0" />}
                <input
                  type="text"
                  className="w-full bg-transparent border-none outline-none text-sm placeholder:text-gray-400"
                  placeholder={selectedIds.length > 0 ? "Search more..." : (isOpen ? "Type to search category names..." : "")}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (!isOpen) setIsOpen(true);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={() => setIsOpen(true)}
                />
              </div>
            </div>
          </div>

          {isOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsOpen(false)}
              ></div>
              <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto divide-y divide-gray-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {fetching ? (
                  <div className="p-4 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Loading categories...
                  </div>
                ) : items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm italic">
                    No {title.toLowerCase()} categories found matching "{searchTerm}"
                  </div>
                ) : (
                  items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                      <div 
                        key={item.id}
                        className={`px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}
                        onClick={() => toggleItem(item.id)}
                      >
                        <div className="flex flex-col pr-4">
                          <span className={`text-sm font-bold truncate ${isSelected ? 'text-blue-600' : 'text-gray-900'}`}>
                            {item.name}
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
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Pakets', href: '/dashboard/pakets' },
          { label: 'Create', active: true },
        ]} 
      />

      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard/pakets"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          aria-label="Back to pakets"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">Create New Exam Paket</h1>
          <p className="text-sm text-gray-500 mt-1">Bundle different assessment categories into a single examination package.</p>
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
                Package Name
              </label>
               <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-lg font-medium"
                placeholder="e.g., TOEFL Simulation Test 1..."
              />
            </div>

            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg border border-amber-100">
               <input
                type="checkbox"
                id="isFree"
                name="isFree"
                checked={formData.isFree}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
              />
              <div>
                <label htmlFor="isFree" className="block text-sm font-bold text-amber-900 cursor-pointer">
                  Mark as Free Package
                </label>
                <p className="text-xs text-amber-700">Free packages will be displayed in the "Gratis" section on the landing page.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="paketCategoryId" className="block text-sm font-semibold text-gray-700 mb-2">
                  Paket Category
                </label>
                <select
                  id="paketCategoryId"
                  name="paketCategoryId"
                  value={formData.paketCategoryId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium bg-white"
                >
                  <option value="">Select Category</option>
                  {paketCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="subPaketCategoryId" className="block text-sm font-semibold text-gray-700 mb-2">
                  Sub Paket Category
                </label>
                <select
                  id="subPaketCategoryId"
                  name="subPaketCategoryId"
                  value={formData.subPaketCategoryId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium bg-white"
                >
                  <option value="">Select Sub Category</option>
                  {subPaketCategories
                    .filter(sub => !formData.paketCategoryId || sub.paketCategoryId === parseInt(formData.paketCategoryId))
                    .map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.subCategoryName}</option>
                    ))}
                </select>
              </div>
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
                placeholder="Brief details about this assessment bundle..."
              />
            </div>

            {/* Category Selectors */}
            <div className="space-y-2">
              <CategorySelector type="reading" icon={BookOpen} title="Reading" items={readingCategories} selectedIds={formData.readingCategoryIds} field="readingCategoryIds" />
              <CategorySelector type="listening" icon={Headphones} title="Listening" items={listeningCategories} selectedIds={formData.listeningCategoryIds} field="listeningCategoryIds" />
              <CategorySelector type="writing" icon={Edit3} title="Writing" items={writingCategories} selectedIds={formData.writingCategoryIds} field="writingCategoryIds" />
              <CategorySelector type="speaking" icon={Mic} title="Speaking" items={speakingCategories} selectedIds={formData.speakingCategoryIds} field="speakingCategoryIds" />
            </div>

          </div>

          <div className="p-6 bg-gray-50 flex items-center justify-end gap-3 rounded-b-xl">
             <Link 
              href="/dashboard/pakets"
              className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 rounded-lg transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || fetching}
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
                  Save Paket
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

