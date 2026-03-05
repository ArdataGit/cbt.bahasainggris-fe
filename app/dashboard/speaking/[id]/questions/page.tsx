'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, ArrowLeft, Loader2, AlertCircle, MessageSquare, ChevronRight } from 'lucide-react';
import axios from 'axios';
import Breadcrumbs from '@/app/components/breadcrumbs';

interface AnswerSpeaking {
  id: number;
  answer: string;
}

interface SoalSpeaking {
  id: number;
  speakingId: number;
  jenis: 'MENIRU' | 'MENJAWAB';
  question: string;
  AnswerSpeaking: AnswerSpeaking[];
}

interface Speaking {
  id: number;
  title: string;
}

export default function SoalSpeakingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [soalList, setSoalList] = useState<SoalSpeaking[]>([]);
  const [speaking, setSpeaking] = useState<Speaking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [speakingRes, soalRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/speakings/${id}`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/soal-speakings?speakingId=${id}`)
      ]);

      if (speakingRes.data.success && soalRes.data.success) {
        setSpeaking(speakingRes.data.data);
        setSoalList(soalRes.data.data);
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (soalId: number) => {
    if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) return;

    try {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/soal-speakings/${soalId}`);
      if (response.data.success) {
        setSoalList(soalList.filter(s => s.id !== soalId));
      } else {
        alert(response.data.message || 'Failed to delete question');
      }
    } catch (err) {
      alert('Error deleting question');
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch(type) {
      case 'MENIRU': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'MENJAWAB': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatQuestionText = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || '';
    return text.length > 120 ? text.substring(0, 120) + '...' : text;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-20 flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="animate-spin mb-4 text-blue-600" size={48} />
        <p className="text-lg font-medium">Loading questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-20 px-4 flex flex-col items-center justify-center text-red-500 text-center">
        <AlertCircle size={48} className="mb-4" />
        <p className="font-bold text-xl mb-2">Error loading data</p>
        <p className="max-w-md opacity-80">{error}</p>
        <button 
          onClick={fetchData} 
          className="mt-6 px-6 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium border border-red-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Speaking', href: '/dashboard/speaking' },
          { label: 'Questions', active: true },
        ]} 
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-start gap-4">
          <Link 
            href="/dashboard/speaking"
            className="p-2 mt-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 shrink-0"
            aria-label="Back to speaking list"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-serif flex items-center gap-2">
              Questions <ChevronRight size={20} className="text-gray-400" /> <span className="text-blue-600">{speaking?.title}</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage essay and short-answer questions for this speaking material.</p>
          </div>
        </div>
        
        <Link 
          href={`/dashboard/speaking/${id}/questions/create`}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-sm active:scale-95 shrink-0"
        >
          <Plus size={18} />
          <span>Add Question</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Info Sidebar */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">Summary</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Total Questions</p>
                <p className="text-2xl font-bold text-blue-600">{soalList.length}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="bg-purple-50 p-2.5 rounded-lg border border-purple-100">
                  <p className="text-[10px] text-purple-600 uppercase font-bold">Meniru</p>
                  <p className="text-lg font-bold text-purple-900">
                    {soalList.filter(s => s.jenis === 'MENIRU').length}
                  </p>
                </div>
                <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                  <p className="text-[10px] text-amber-600 uppercase font-bold mb-0.5 leading-tight">Menjawab</p>
                  <p className="text-lg font-bold text-amber-900">
                    {soalList.filter(s => s.jenis === 'MENJAWAB').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="md:col-span-3">
          <div className="space-y-4">
            {soalList.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 border-dashed p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No questions yet</h3>
                <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
                  Get started by creating your first question for this speaking material. 
                  You can add essay prompts or short-answer questions.
                </p>
                <Link 
                  href={`/dashboard/speaking/${id}/questions/create`}
                  className="inline-flex items-center gap-2 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-2.5 rounded-lg font-bold transition-all"
                >
                  <Plus size={18} /> Add First Question
                </Link>
              </div>
            ) : (
              soalList.map((soal, index) => (
                <div key={soal.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:border-blue-300 transition-colors group">
                  <div className="p-5 flex flex-col sm:flex-row gap-4">
                    
                    {/* Number Badge */}
                    <div className="shrink-0">
                      <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center font-bold text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200 transition-colors">
                        {index + 1}
                      </div>
                    </div>

                    {/* Question Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getTypeBadgeColor(soal.jenis)}`}>
                          {soal.jenis.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="text-gray-900 font-medium text-sm leading-relaxed max-w-2xl bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                        {formatQuestionText(soal.question)}
                      </div>

                      {soal.jenis === 'MENJAWAB' && soal.AnswerSpeaking && soal.AnswerSpeaking.length > 0 && (
                        <div className="mt-4 pl-3 border-l-2 border-amber-200">
                           <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                             Valid Answers ({soal.AnswerSpeaking.length})
                           </p>
                           <div className="flex flex-wrap gap-2">
                             {soal.AnswerSpeaking.map((ans, i) => (
                               <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-semibold border border-green-100 shadow-sm">
                                 {ans.answer}
                               </span>
                             ))}
                           </div>
                        </div>
                      )}
                      
                       {soal.jenis === 'MENIRU' && (
                        <div className="mt-3">
                           <p className="text-xs text-gray-400 italic flex items-center gap-1.5">
                             Students will provide a free-text response or audio recording for this question.
                           </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 mt-4 sm:mt-0">
                      <Link 
                        href={`/dashboard/speaking/${id}/questions/${soal.id}/edit`}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                        title="Edit Question"
                      >
                        <Edit size={18} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(soal.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        title="Delete Question"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
