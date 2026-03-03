'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, AlertCircle, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';
import Breadcrumbs from '@/app/components/breadcrumbs';

export default function EditQuestionPage({ params }: { params: Promise<{ id: string, soalId: string }> }) {
  const { id: readingId, soalId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    readingId: readingId,
    question: '',
    options: [] as { id?: number; text: string; isCorrect: boolean }[]
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestion();
  }, [soalId]);

  const fetchQuestion = async () => {
    try {
      setFetching(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/soal-readings/${soalId}`);
      const data = response.data;
      if (data.success) {
        const q = data.data;
        setFormData({
          readingId: q.readingId,
          question: q.question,
          options: q.options.map((opt: any) => ({
            id: opt.id,
            text: opt.text,
            isCorrect: opt.isCorrect
          }))
        });
      } else {
        throw new Error(data.message || 'Failed to fetch question data.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFetching(false);
    }
  };

  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, question: e.target.value });
  };

  const handleOptionChange = (index: number, text: string) => {
    const newOptions = [...formData.options];
    newOptions[index].text = text;
    setFormData({ ...formData, options: newOptions });
  };

  const handleCorrectAnswerChange = (index: number) => {
    const newOptions = formData.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index
    }));
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { text: '', isCorrect: false }]
    });
  };

  const removeOption = (index: number) => {
    if (formData.options.length <= 2) return;
    const newOptions = formData.options.filter((_, i) => i !== index);
    if (!newOptions.some(opt => opt.isCorrect)) {
      newOptions[0].isCorrect = true;
    }
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.options.some(opt => !opt.text.trim())) {
      setError('Please fill in all options.');
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/soal-readings/${soalId}`, formData);

      if (response.data.success) {
        router.push(`/dashboard/readings/${readingId}/questions`);
        router.refresh();
      } else {
        throw new Error(response.data.message || 'Failed to update question.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-6xl mx-auto py-20 flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="animate-spin mb-4 text-blue-600" size={48} />
        <p className="text-lg font-medium">Fetching question data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Readings', href: '/dashboard/readings' },
          { label: 'Questions', href: `/dashboard/readings/${readingId}/questions` },
          { label: 'Edit Question', active: true },
        ]} 
      />

      <div className="flex items-center gap-4 mb-8">
        <Link 
          href={`/dashboard/readings/${readingId}/questions`}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          aria-label="Back to questions"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Question</h1>
          <p className="text-sm text-gray-500 mt-1">Modify choices and details for this question.</p>
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
          <div className="p-6 lg:p-8 space-y-8">
            {/* Question Textarea */}
            <div>
              <label htmlFor="question" className="block text-sm font-semibold text-gray-700 mb-2">
                Question Text
              </label>
              <textarea
                id="question"
                name="question"
                value={formData.question}
                onChange={handleQuestionChange}
                required
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none text-base bg-white"
                placeholder="Enter the question here..."
              />
            </div>

            {/* Options List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-gray-700">
                  Answer Options
                </label>
                <button
                  type="button"
                  onClick={addOption}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-all border border-blue-200"
                >
                  <Plus size={14} />
                  <span>Add Option</span>
                </button>
              </div>

              <div className="space-y-3">
                {formData.options.map((opt, index) => (
                  <div key={index} className="flex gap-3 items-start group">
                    <div className="mt-2.5">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={opt.isCorrect}
                        onChange={() => handleCorrectAnswerChange(index)}
                        className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                        title="Mark as correct answer"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-xs font-bold text-gray-400">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          required
                          className={`w-full pl-8 pr-4 py-2.5 rounded-lg border transition-all outline-none bg-white ${
                            opt.isCorrect 
                              ? 'border-green-500 ring-2 ring-green-100' 
                              : 'border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500'
                          }`}
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      disabled={formData.options.length <= 2}
                      className="mt-2 text-gray-400 hover:text-red-500 disabled:opacity-0 transition-all p-1"
                      title="Remove option"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-gray-50 flex items-center justify-end gap-3">
            <Link 
              href={`/dashboard/readings/${readingId}/questions`}
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
                  Update Question
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
