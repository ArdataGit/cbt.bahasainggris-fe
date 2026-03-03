'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Search, MessageSquare, Edit, Trash2, Loader2, AlertCircle, Play, Mic, Library, BookOpen, ChevronRight } from 'lucide-react';
import axios from 'axios';
import Breadcrumbs from '@/app/components/breadcrumbs';

interface Speaking {
  id: number;
  title: string;
  content: string;
  audioUrl?: string;
  createdAt: string;
  _count: {
    SoalSpeaking: number;
  };
}

export default function SpeakingListPage() {
  const router = useRouter();
  const [speakings, setSpeakings] = useState<Speaking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSpeakings();
  }, []);

  const fetchSpeakings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/speakings`);
      if (response.data.success) {
        setSpeakings(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch speaking materials.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this speaking material? All associated questions will also be deleted.')) return;

    try {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/speakings/${id}`);
      if (response.data.success) {
        setSpeakings(speakings.filter(item => item.id !== id));
      } else {
        alert(response.data.message || 'Failed to delete.');
      }
    } catch (err) {
      alert('Error deleting item');
    }
  };

  const filteredSpeakings = speakings.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Speaking', active: true },
        ]} 
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Speaking Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage speaking prompts, audio references, and questions.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/speaking/categories"
            className="inline-flex items-center justify-center gap-2 bg-white border border-gray-300 hover:border-blue-500 hover:text-blue-600 text-gray-700 px-4 py-2.5 rounded-lg font-bold transition-all shadow-sm"
          >
            <Library size={18} />
            <span className="hidden sm:inline">Speaking Categories</span>
          </Link>
          <Link 
            href="/dashboard/speaking/create"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold transition-all shadow-sm active:scale-95"
          >
            <Plus size={18} />
            <span>Create Speaking</span>
          </Link>
        </div>
      </div>

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
          Total: <span className="text-blue-600 font-bold">{filteredSpeakings.length}</span> records
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-bottom border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Passage Info</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Audio Ref</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Questions</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                 <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <Loader2 className="animate-spin mx-auto text-blue-500 mb-2" size={32} />
                    Loading speaking materials...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-red-500 font-medium">
                    ⚠️ Error: {error}
                  </td>
                </tr>
              ) : filteredSpeakings.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mic size={32} />
                    </div>
                    <p>No speaking materials found.</p>
                  </td>
                </tr>
              ) : (
                filteredSpeakings.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-110 transition-transform">
                          <Mic size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight line-clamp-1">{item.title}</p>
                          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">ID: #SPK-{item.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       {item.audioUrl ? (
                        <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                          <Play size={12} fill="currentColor" /> Attached
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No audio</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                        {item._count?.SoalSpeaking || 0} Questions
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/dashboard/speaking/${item.id}/questions`}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-100"
                        >
                          Manage Questions
                          <ChevronRight size={14} />
                        </Link>
                        <Link 
                          href={`/dashboard/speaking/${item.id}/edit`}
                          className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-100"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
