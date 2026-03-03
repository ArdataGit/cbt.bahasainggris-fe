'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, ArrowLeft, Edit, Trash2, Loader2, AlertCircle, FileText, ChevronRight } from 'lucide-react';
import axios from 'axios';
import Breadcrumbs from '@/app/components/breadcrumbs';

interface AnswerWriting {
  id: number;
  answer: string;
}

interface SoalWriting {
  id: number;
  jenis: 'ESSAY' | 'SHORT_ANSWER';
  question: string;
  AnswerWriting: AnswerWriting[];
}

interface WritingMeta {
  id: number;
  title: string;
}

export default function WritingQuestionsListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: writingId } = use(params);
  const router = useRouter();
  const [questions, setQuestions] = useState<SoalWriting[]>([]);
  const [writing, setWriting] = useState<WritingMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [writingId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch Writing Info
      const writingRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/writing/${writingId}`);
      if (writingRes.data.success) {
        setWriting(writingRes.data.data);
      }

      // Fetch Questions
      const questionsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/soal-writing?writingId=${writingId}`);
      if (questionsRes.data.success) {
        setQuestions(questionsRes.data.data);
      } else {
        throw new Error(questionsRes.data.message || 'Failed to fetch questions');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    
    try {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/soal-writing/${id}`);
      if (response.data.success) {
        setQuestions(questions.filter(q => q.id !== id));
      } else {
        alert(response.data.message || 'Failed to delete question');
      }
    } catch (err) {
      alert('Error deleting question');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Writing', href: '/dashboard/writing' },
          { label: writing?.title || 'Loading...', active: true },
        ]} 
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/writing"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            aria-label="Back to writing list"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Questions</h1>
            <p className="text-sm text-gray-500 mt-1">
              Writing: <span className="font-medium text-blue-600">{writing?.title || 'Loading...'}</span>
            </p>
          </div>
        </div>
        <Link 
          href={`/dashboard/writing/${writingId}/questions/create`}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold transition-all shadow-sm"
        >
          <Plus size={18} />
          <span>Add Question</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-500 bg-white rounded-xl border border-gray-200">
          <Loader2 className="animate-spin mb-2" size={32} />
          <p>Loading questions...</p>
        </div>
      ) : error ? (
        <div className="py-20 flex flex-col items-center justify-center text-red-500 bg-white rounded-xl border border-gray-200 px-4 text-center">
          <AlertCircle size={32} className="mb-2" />
          <p className="font-bold text-lg text-gray-950">Error loading data</p>
          <p className="text-sm opacity-80">{error}</p>
          <button onClick={fetchData} className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors font-bold">
            Try Again
          </button>
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto">
            <FileText size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No questions yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">
            This writing material doesn't have any questions. Create one to get started.
          </p>
          <Link 
            href={`/dashboard/writing/${writingId}/questions/create`}
            className="inline-flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-bold transition-all shadow-sm"
          >
            <Plus size={18} />
            <span>Add First Question</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, index) => (
            <div key={q.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group">
              <div className="p-5 flex justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          q.jenis === 'ESSAY' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {q.jenis.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="text-gray-950 font-bold leading-relaxed">{q.question}</h4>
                    </div>
                  </div>
                  
                  {q.AnswerWriting && q.AnswerWriting.length > 0 && (
                    <div className="mt-4 pl-9">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Reference Answers / Keywords</p>
                      <div className="flex flex-wrap gap-2">
                        {q.AnswerWriting.map((ans) => (
                          <span key={ans.id} className="text-sm py-1.5 px-3 rounded-lg border border-gray-100 bg-gray-50 text-gray-600">
                            {ans.answer}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2">
                  <Link 
                    href={`/dashboard/writing/${writingId}/questions/${q.id}/edit`}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                    title="Edit Question"
                  >
                    <Edit size={18} />
                  </Link>
                  <button 
                    onClick={() => handleDelete(q.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                    title="Delete Question"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
