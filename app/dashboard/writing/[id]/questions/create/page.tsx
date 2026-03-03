'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Plus, X, ChevronDown, MessageSquare } from 'lucide-react';
import axios from 'axios';
import Breadcrumbs from '@/app/components/breadcrumbs';

export default function CreateWritingQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: writingId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    writingId: writingId,
    jenis: 'ESSAY' as 'ESSAY' | 'SHORT_ANSWER',
    question: '',
    answers: [''] // Array of reference answers
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...formData.answers];
    newAnswers[index] = value;
    setFormData({ ...formData, answers: newAnswers });
  };

  const addAnswer = () => {
    setFormData({ ...formData, answers: [...formData.answers, ''] });
  };

  const removeAnswer = (index: number) => {
    if (formData.answers.length > 1) {
      const newAnswers = formData.answers.filter((_, i) => i !== index);
      setFormData({ ...formData, answers: newAnswers });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Filter out empty answers
    const filteredAnswers = formData.answers.filter(ans => ans.trim() !== '');
    
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/soal-writing`, {
        ...formData,
        answers: filteredAnswers
      });

      if (response.data.success) {
        router.push(`/dashboard/writing/${writingId}/questions`);
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

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 text-gray-950">
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Writing', href: '/dashboard/writing' },
          { label: 'Questions', href: `/dashboard/writing/${writingId}/questions` },
          { label: 'Add Question', active: true },
        ]} 
      />

      <div className="flex items-center gap-4 mb-8">
        <Link 
          href={`/dashboard/writing/${writingId}/questions`}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Writing Question</h1>
          <p className="text-sm text-gray-500 mt-1">Create an Essay or Short Answer question.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {error && (
          <div className="m-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <span>⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="divide-y divide-gray-100">
          <div className="p-6 lg:p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="jenis" className="block text-sm font-semibold text-gray-700 mb-2">
                  Question Type
                </label>
                <div className="relative">
                  <select
                    id="jenis"
                    name="jenis"
                    value={formData.jenis}
                    onChange={handleChange}
                    className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer bg-white font-medium"
                  >
                    <option value="ESSAY">Essay</option>
                    <option value="SHORT_ANSWER">Short Answer</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ChevronDown size={18} />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="question" className="block text-sm font-semibold text-gray-700 mb-2">
                Question / Prompt
              </label>
              <textarea
                id="question"
                name="question"
                value={formData.question}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none text-base"
                placeholder="Enter the question or writing prompt..."
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Reference Answers / Keywords
                  </label>
                  <p className="text-xs text-gray-500">Provide correct answers or key phrases that will be used for grading.</p>
                </div>
                <button
                  type="button"
                  onClick={addAnswer}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                >
                  <Plus size={14} />
                  Add Answer
                </button>
              </div>

              <div className="space-y-3">
                {formData.answers.map((answer, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      required
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                      placeholder={`Enter answer ${index + 1}...`}
                    />
                    <button
                      type="button"
                      onClick={() => removeAnswer(index)}
                      disabled={formData.answers.length <= 1}
                      className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 flex items-center justify-end gap-3">
            <Link 
              href={`/dashboard/writing/${writingId}/questions`}
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
