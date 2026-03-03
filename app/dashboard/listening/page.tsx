'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Search, BookOpen, MessageSquare, Edit, Trash2, Loader2, AlertCircle, Play, Headphones, Library } from 'lucide-react';
import axios from 'axios';
import Breadcrumbs from '@/app/components/breadcrumbs';

interface Listening {
  id: number;
  title: string;
  content: string;
  audioUrl?: string;
  createdAt: string;
  _count?: {
    SoalListeing: number;
  }
}

export default function ListeningPage() {
  const router = useRouter();
  const [listeningList, setListeningList] = useState<Listening[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchListening();
  }, []);

  const fetchListening = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/listening`);
      if (response.data.success) {
        setListeningList(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch listening records.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this record? This will also delete all associated questions.')) return;
    
    try {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/listening/${id}`);
      if (response.data.success) {
        setListeningList(listeningList.filter(item => item.id !== id));
      } else {
        alert(response.data.message || 'Failed to delete record');
      }
    } catch (err) {
      alert('Error deleting record');
    }
  };

  const filteredList = listeningList.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Listening', active: true },
        ]} 
      />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Listening Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage audio passages and their associated questions.</p>
        </div>
        <div className="flex gap-2">
          <Link 
            href="/dashboard/listenings/categories"
            className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 hover:text-blue-700 px-4 py-2.5 rounded-lg font-bold transition-all shadow-sm active:scale-95"
          >
            <Library size={18} />
            <span>Listening Categories</span>
          </Link>
          <Link 
            href="/dashboard/listening/create"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold transition-all shadow-sm hover:shadow-md active:shadow-none"
          >
            <Plus size={18} />
            <span>Add Listening</span>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by title..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-gray-950"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-500 font-medium">
          Total: <span className="text-blue-600 font-bold">{filteredList.length}</span> records
        </div>
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-500">
            <Loader2 className="animate-spin mb-4 text-blue-600" size={40} />
            <p className="font-medium">Loading listening materials...</p>
          </div>
        ) : error ? (
          <div className="py-20 flex flex-col items-center justify-center text-red-500 px-4 text-center">
            <AlertCircle size={40} className="mb-4" />
            <p className="font-bold text-lg">Error loading data</p>
            <p className="text-sm opacity-80 max-w-sm mx-auto">{error}</p>
            <button 
              onClick={fetchListening}
              className="mt-6 px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-bold transition-all"
            >
              Try Again
            </button>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-500 px-4 text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <Headphones size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No listening records found</h3>
            <p className="text-sm max-w-xs mx-auto mb-6">Create your first listening material to start adding questions.</p>
            <Link 
              href="/dashboard/listening/create"
              className="bg-white border border-gray-300 hover:border-blue-500 hover:text-blue-600 px-6 py-2 rounded-lg font-bold transition-all shadow-sm"
            >
              Add New Listening
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-bottom border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Passage Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Audio</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stats</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date Created</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-110 transition-transform">
                          <Headphones size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.title}</p>
                          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">ID: #LST-{item.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.audioUrl ? (
                        <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                          <Play size={12} fill="currentColor" /> Audio Attached
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No audio</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-gray-600" title="Questions count">
                          <MessageSquare size={14} />
                          <span className="text-xs font-bold">0</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link 
                          href={`/dashboard/listening/${item.id}/questions`}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                          title="Manage Questions"
                        >
                          <Edit size={14} />
                          Questions
                        </Link>
                        <Link 
                          href={`/dashboard/listening/${item.id}/edit`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                          title="Delete"
                        >
                          <Trash2 size={16} />
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
