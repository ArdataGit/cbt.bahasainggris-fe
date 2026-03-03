'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, BookOpen, MessageSquare, Edit, Trash2, Loader2, AlertCircle, Library } from 'lucide-react';
import axios from 'axios';
import Breadcrumbs from '@/app/components/breadcrumbs';

interface Reading {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  categories: { id: number; name: string }[];
}

export default function ReadingsPage() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReadings();
  }, []);

  const fetchReadings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/readings`);
      const data = response.data;
      if (data.success) {
        setReadings(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch readings');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this reading? All related questions will also be deleted.')) return;
    
    try {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/readings/${id}`);
      const data = response.data;
      if (data.success) {
        setReadings(readings.filter(r => r.id !== id));
      } else {
        alert(data.message || 'Failed to delete reading');
      }
    } catch (err) {
      alert('Error deleting reading');
    }
  };

  const filteredReadings = readings.filter(reading => 
    reading.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Readings', active: true },
        ]} 
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 mt-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Readings Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all reading materials for the CBT platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/readings/categories"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-6 py-2.5 rounded-lg font-bold text-sm transition-all border border-gray-200 shadow-sm active:scale-95"
          >
            <Library size={18} className="text-amber-500" />
            <span>Reading Categories</span>
          </Link>
          <Link 
            href="/dashboard/readings/create"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm active:scale-95"
          >
            <Plus size={18} />
            <span>Add New Reading</span>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search readings..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-white text-gray-950 font-medium"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-500">
            <Loader2 className="animate-spin mb-4 text-blue-600" size={40} />
            <p className="font-medium">Loading readings...</p>
          </div>
        ) : error ? (
          <div className="py-20 flex flex-col items-center justify-center text-red-500 px-4 text-center">
            <AlertCircle size={40} className="mb-4 text-red-400" />
            <p className="font-bold text-lg mb-1">Error Loading Data</p>
            <p className="text-sm opacity-80 mb-6">{error}</p>
            <button 
              onClick={fetchReadings} 
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-bold transition-all"
            >
              Try Again
            </button>
          </div>
        ) : filteredReadings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
              <BookOpen size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No readings found</h3>
            <p className="text-gray-500 max-w-xs mx-auto mb-8">
              {searchTerm ? `We couldn't find any results for "${searchTerm}"` : "Get started by creating your first reading material."}
            </p>
            {!searchTerm && (
              <Link 
                href="/dashboard/readings/create"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-md active:scale-95"
              >
                <Plus size={20} />
                <span>Create First Reading</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Reading Title</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Categories</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReadings.map((reading) => (
                  <tr key={reading.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 max-w-md">
                      <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{reading.title}</div>
                      <div 
                        className="text-xs text-gray-500 line-clamp-1 mt-1 opacity-70 group-hover:opacity-100 transition-opacity" 
                        dangerouslySetInnerHTML={{ __html: reading.content.substring(0, 100).replace(/<[^>]*>/g, '') + '...' }}
                      ></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {reading.categories && reading.categories.length > 0 ? (
                          reading.categories.map(cat => (
                            <span 
                              key={cat.id} 
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-white text-gray-600 border border-gray-200 shadow-sm"
                            >
                              <Library size={10} className="text-amber-500" />
                              {cat.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-gray-400 font-medium italic">Uncategorized</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/dashboard/readings/${reading.id}/questions`}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all text-xs font-bold border border-transparent hover:border-blue-100"
                          title="Manage Questions"
                        >
                          <MessageSquare size={14} />
                          <span>Questions</span>
                        </Link>
                        <Link 
                          href={`/dashboard/readings/${reading.id}/edit`}
                          className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all border border-transparent hover:border-amber-100"
                          title="Edit Reading"
                        >
                          <Edit size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(reading.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
                          title="Delete Reading"
                        >
                          <Trash2 size={18} />
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
