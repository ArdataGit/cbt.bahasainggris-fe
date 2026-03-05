'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Plus, Trash2, HelpCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import Breadcrumbs from '@/app/components/breadcrumbs';
import Editor from '@/app/components/editor';

interface Speaking {
  id: number;
  title: string;
}

export default function CreateSoalSpeakingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [speaking, setSpeaking] = useState<Speaking | null>(null);
  
  const [formData, setFormData] = useState({
    jenis: 'MENIRU' as 'MENIRU' | 'MENJAWAB',
    question: '',
    AnswerSpeaking: [{ answer: '' }]
  });
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSpeakingInfo();
  }, [id]);

  const fetchSpeakingInfo = async () => {
    try {
      setFetching(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/speakings/${id}`);
      if (response.data.success) {
        setSpeaking(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch speaking info', err);
    } finally {
      setFetching(false);
    }
  };

  const handleContentChange = (content: string) => {
    setFormData({
      ...formData,
      question: content
    });
  };

  const handleAddAnswer = () => {
    setFormData({
      ...formData,
      AnswerSpeaking: [...formData.AnswerSpeaking, { answer: '' }]
    });
  };

  const handleRemoveAnswer = (index: number) => {
    const newAnswers = [...formData.AnswerSpeaking];
    newAnswers.splice(index, 1);
    setFormData({
      ...formData,
      AnswerSpeaking: newAnswers
    });
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...formData.AnswerSpeaking];
    newAnswers[index].answer = value;
    setFormData({
      ...formData,
      AnswerSpeaking: newAnswers
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.question || formData.question === '<p></p>' || formData.question.trim() === '') {
        throw new Error('Question content cannot be empty.');
      }

      let payload = {
        speakingId: parseInt(id),
        jenis: formData.jenis,
        question: formData.question,
        AnswerSpeaking: [] as any[]
      };

      if (formData.jenis === 'MENJAWAB') {
        const validAnswers = formData.AnswerSpeaking.filter(a => a.answer.trim() !== '');
        if (validAnswers.length === 0) {
          throw new Error('Please provide at least one valid answer for short-answer questions.');
        }
        payload.AnswerSpeaking = validAnswers;
      }

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/soal-speakings`, payload);

      if (response.data.success) {
        router.push(`/dashboard/speaking/${id}/questions`);
        router.refresh();
      } else {
        throw new Error(response.data.message || 'Failed to create question.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-4xl mx-auto py-20 flex justify-center text-blue-600">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Speaking', href: '/dashboard/speaking' },
          { label: 'Questions', href: `/dashboard/speaking/${id}/questions` },
          { label: 'Create', active: true },
        ]} 
      />

      <div className="flex items-center gap-4 mb-8">
        <Link 
          href={`/dashboard/speaking/${id}/questions`}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">Add Speaking Question</h1>
          <p className="text-sm text-gray-500 mt-1">For passage: <span className="font-semibold text-gray-700">{speaking?.title}</span></p>
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
          <div className="p-6 lg:p-8 space-y-8">
            
            {/* Question Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Question Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label 
                  className={`
                    relative flex flex-col p-4 cursor-pointer rounded-xl border-2 transition-all group
                    ${formData.jenis === 'MENIRU' 
                      ? 'border-blue-600 bg-blue-50/50' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <input 
                    type="radio" 
                    name="jenis" 
                    value="MENIRU" 
                    checked={formData.jenis === 'MENIRU'}
                    onChange={() => setFormData({...formData, jenis: 'MENIRU'})}
                    className="sr-only"
                  />
                  <div className="flex justify-between items-start mb-2">
                    <span className={`font-bold ${formData.jenis === 'MENIRU' ? 'text-blue-900' : 'text-gray-900'}`}>
                      Meniru (Repeat)
                    </span>
                    {formData.jenis === 'MENIRU' && <CheckCircle2 size={20} className="text-blue-600" />}
                  </div>
                  <p className="text-xs text-gray-500">Students repeat the sentences or phrases from the prompt.</p>
                </label>

                <label 
                  className={`
                    relative flex flex-col p-4 cursor-pointer rounded-xl border-2 transition-all group
                    ${formData.jenis === 'MENJAWAB' 
                      ? 'border-blue-600 bg-blue-50/50' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <input 
                    type="radio" 
                    name="jenis" 
                    value="MENJAWAB" 
                    checked={formData.jenis === 'MENJAWAB'}
                    onChange={() => setFormData({...formData, jenis: 'MENJAWAB'})}
                    className="sr-only"
                  />
                  <div className="flex justify-between items-start mb-2">
                    <span className={`font-bold ${formData.jenis === 'MENJAWAB' ? 'text-blue-900' : 'text-gray-900'}`}>
                      Menjawab (Answer)
                    </span>
                    {formData.jenis === 'MENJAWAB' && <CheckCircle2 size={20} className="text-blue-600" />}
                  </div>
                  <p className="text-xs text-gray-500">System automatically grades based on provided correct keywords/phrases.</p>
                </label>
              </div>
            </div>

            {/* Question Content */}
            <div>
               <label className="block text-sm font-semibold text-gray-700 mb-2">
                Question Prompt <span className="text-red-500">*</span>
              </label>
              <div className="prose-editor-container border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 transition-all">
                <Editor 
                  value={formData.question}
                  onChange={handleContentChange}
                  placeholder="Type the question or prompt here..."
                />
              </div>
            </div>

            {/* Dynamic Short Answer Fields */}
            {formData.jenis === 'MENJAWAB' && (
              <div className="bg-amber-50 rounded-xl p-5 border border-amber-200 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg shrink-0 mt-0.5">
                    <HelpCircle size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-900 text-sm">Valid Answers</h3>
                    <p className="text-xs text-amber-700/80 mt-1 max-w-xl">
                      Provide all possible correct variations. The system will mark the student's answer as correct if it matches ANY of these exactly (case-insensitive).
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {formData.AnswerSpeaking.map((ans, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400">
                          {index + 1}.
                        </span>
                        <input
                          type="text"
                          value={ans.answer}
                          onChange={(e) => handleAnswerChange(index, e.target.value)}
                          placeholder="Enter a valid correct answer..."
                          required
                          className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-amber-200 bg-white focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all text-sm font-medium"
                        />
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleRemoveAnswer(index)}
                        disabled={formData.AnswerSpeaking.length === 1}
                        className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove answer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddAnswer}
                  className="mt-4 flex items-center gap-2 text-sm font-bold text-amber-700 hover:text-amber-800 bg-amber-100/50 hover:bg-amber-100 px-4 py-2 rounded-lg transition-colors border border-amber-200 border-dashed"
                >
                  <Plus size={16} /> Add Alternative Answer
                </button>
              </div>
            )}
          </div>

          <div className="p-6 bg-gray-50 flex items-center justify-end gap-3">
            <Link 
              href={`/dashboard/speaking/${id}/questions`}
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
                  Save Question
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
