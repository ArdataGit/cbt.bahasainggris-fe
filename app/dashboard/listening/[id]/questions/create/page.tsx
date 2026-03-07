'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';
import Breadcrumbs from '@/app/components/breadcrumbs';

export default function CreateListeningQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: listeningId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    listeningId: listeningId,
    question: '',
    options: [
      { text: '', isCorrect: true, imageUrl: '' },
      { text: '', isCorrect: false, imageUrl: '' },
      { text: '', isCorrect: false, imageUrl: '' },
      { text: '', isCorrect: false, imageUrl: '' },
    ]
  });
  const [error, setError] = useState<string | null>(null);

  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, question: e.target.value });
  };

  const handleOptionChange = (index: number, text: string) => {
    const newOptions = [...formData.options];
    newOptions[index].text = text;
    setFormData({ ...formData, options: newOptions });
  };

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIndex(index);
    setError(null);

    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/upload`, formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        const newOptions = [...formData.options];
        newOptions[index].imageUrl = response.data.data.url;
        setFormData({ ...formData, options: newOptions });
      } else {
        throw new Error(response.data.message || 'Failed to upload image.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Upload failed.');
    } finally {
      setUploadingIndex(null);
    }
  };

  const removeImage = (index: number) => {
    const newOptions = [...formData.options];
    newOptions[index].imageUrl = '';
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
      options: [...formData.options, { text: '', isCorrect: false, imageUrl: '' }]
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

    // Validation: Require either text or image
    if (formData.options.some(opt => !opt.text.trim() && !opt.imageUrl)) {
      setError('Each option must have either text or an image.');
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/soal-listening`, formData);

      if (response.data.success) {
        router.push(`/dashboard/listening/${listeningId}/questions`);
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
    <div className="max-w-4xl mx-auto py-6 px-4">
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Listening', href: '/dashboard/listening' },
          { label: 'Questions', href: `/dashboard/listening/${listeningId}/questions` },
          { label: 'Add Question', active: true },
        ]} 
      />

      <div className="flex items-center gap-4 mb-8">
        <Link 
          href={`/dashboard/listening/${listeningId}/questions`}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          aria-label="Back to questions"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Listening Question</h1>
          <p className="text-sm text-gray-500 mt-1">Create a multiple choice question with dynamic options.</p>
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

              <div className="space-y-4">
                {formData.options.map((opt, index) => (
                  <div key={index} className="flex gap-4 items-start group p-4 border border-gray-100 rounded-xl hover:bg-gray-50/50 transition-all">
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
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                         <span className="text-xs font-bold text-gray-400">
                            {String.fromCharCode(65 + index)}
                         </span>
                         <input
                           type="text"
                           value={opt.text}
                           onChange={(e) => handleOptionChange(index, e.target.value)}
                           className={`flex-1 px-4 py-2 rounded-lg border transition-all outline-none bg-white ${
                             opt.isCorrect 
                               ? 'border-green-500 ring-2 ring-green-100' 
                               : 'border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500'
                           }`}
                           placeholder={`Option ${String.fromCharCode(65 + index)} Text`}
                         />
                      </div>

                      {/* Image Preview / Upload Section */}
                      <div className="pl-7">
                        {opt.imageUrl ? (
                          <div className="relative inline-block group/img">
                            <img 
                              src={opt.imageUrl} 
                              alt={`Option ${index} Preview`} 
                              className="w-32 h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md opacity-0 group-hover/img:opacity-100 transition-opacity"
                              title="Remove image"
                            >
                              <Plus size={14} className="rotate-45" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(index, e)}
                                className="hidden"
                                disabled={uploadingIndex === index}
                              />
                              <div className={`px-4 py-2 border-2 border-dashed border-gray-200 rounded-lg text-xs font-medium text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-all flex items-center gap-2 ${uploadingIndex === index ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {uploadingIndex === index ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <Plus size={12} />
                                )}
                                {uploadingIndex === index ? 'Uploading...' : 'Add Image'}
                              </div>
                            </label>
                            <p className="text-[10px] text-gray-400">Optional: Upload an image for this option</p>
                          </div>
                        )}
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
              <p className="text-xs text-gray-500 italic">
                * Click the radio button next to an option to mark it as the correct answer. Each option must have text, an image, or both.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-gray-50 flex items-center justify-end gap-3">
            <Link 
              href={`/dashboard/listening/${listeningId}/questions`}
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
