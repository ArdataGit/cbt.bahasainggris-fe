'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, ArrowLeft, Edit, Trash2, Loader2, BookOpen, AlertCircle, MessageSquare } from 'lucide-react';
import axios from 'axios';
import Breadcrumbs from '@/app/components/breadcrumbs';

interface SoalReading {
  id: number;
  question: string;
  options: {
    id: number;
    text: string;
    isCorrect: boolean;
  }[];
}

interface Reading {
  id: number;
  title: string;
}

export default function QuestionsListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: readingId } = use(params);
  const router = useRouter();
  const [questions, setQuestions] = useState<SoalReading[]>([]);
  const [reading, setReading] = useState<Reading | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [readingId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch Reading Info
      const readingRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/readings/${readingId}`);
      const readingData = readingRes.data;
      if (readingData.success) {
        setReading(readingData.data);
      }

      // Fetch Questions
      const questionsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/soal-readings?readingId=${readingId}`);
      const questionsData = questionsRes.data;
      if (questionsData.success) {
        setQuestions(questionsData.data);
      } else {
        throw new Error(questionsData.message || 'Failed to fetch questions');
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
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/soal-readings/${id}`);
      const data = response.data;
      if (data.success) {
        setQuestions(questions.filter(q => q.id !== id));
      } else {
        alert(data.message || 'Failed to delete question');
      }
    } catch (err) {
      alert('Error deleting question');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Readings', href: '/dashboard/readings' },
          { label: 'Questions', active: true },
        ]} 
      />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/readings"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            aria-label="Back to readings"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Questions</h1>
            <p className="text-sm text-gray-500 mt-1">
              Reading: <span className="font-medium text-blue-600">{reading?.title || 'Loading...'}</span>
            </p>
          </div>
        </div>
        <Link 
          href={`/dashboard/readings/${readingId}/questions/create`}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
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
          <p className="font-medium text-lg">Error loading data</p>
          <p className="text-sm opacity-80">{error}</p>
          <button onClick={fetchData} className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors">
            Try Again
          </button>
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto">
            <MessageSquare size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No questions yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">
            This reading material doesn't have any questions. Create one to get started.
          </p>
          <Link 
            href={`/dashboard/readings/${readingId}/questions/create`}
            className="inline-flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus size={18} />
            <span>Add First Question</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, index) => (
            <div key={q.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group hover:border-blue-200 transition-all">
              <div className="p-6 flex justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 text-sm font-bold shrink-0 mt-0.5 border border-blue-100 uppercase tracking-tighter">
                      {index + 1}
                    </span>
                    <h4 className="text-gray-900 font-bold text-lg leading-relaxed">{q.question}</h4>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 pl-11">
                    {q.options.map((opt, optIndex) => (
                      <div 
                        key={opt.id}
                        className={`text-sm py-3 px-4 rounded-xl border flex items-center justify-between transition-all ${
                          opt.isCorrect 
                            ? 'bg-green-50 border-green-200 text-green-800 shadow-sm shadow-green-100/50' 
                            : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-white hover:border-gray-200'
                        }`}
                      >
                        <div>
                          <span className="font-bold mr-2">{String.fromCharCode(65 + optIndex)}.</span> {opt.text}
                        </div>
                        {opt.isCorrect && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-green-200 text-green-700 px-1.5 py-0.5 rounded shrink-0 ml-2">Correct</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Link 
                    href={`/dashboard/readings/${readingId}/questions/${q.id}/edit`}
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
