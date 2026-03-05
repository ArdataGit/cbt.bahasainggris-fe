'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BookOpen, Loader2, Info } from 'lucide-react';
import axios from 'axios';

interface Option {
  id: number;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  question: string;
  options: Option[];
}

interface Reading {
  id: number;
  title: string;
  content: string;
  SoalReading: Question[];
  categories: { timer: number }[];
}

interface Paket {
  id: number;
  name: string;
  readingCategories: any[];
  listeningCategories: any[];
  writingCategories: any[];
  speakingCategories: any[];
}

export default function ReadingTestPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [view, setView] = useState<'introduction' | 'test'>('introduction');
  const [paket, setPaket] = useState<Paket | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [currentReadingIndex, setCurrentReadingIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // Default 25 minutes in seconds
  const [answers, setAnswers] = useState<Record<number, number>>({});

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    document.getElementById('passage-container')?.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('questions-container')?.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentReadingIndex]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const paketRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/pakets/${id}`);
      if (paketRes.data.success) {
        const paketData = paketRes.data.data;
        setPaket(paketData);

        // Aggregate all reading IDs from all categories
        const allReadingIds = paketData.readingCategories.flatMap((cat: any) => 
          cat.readings.map((r: any) => r.id)
        );

        // Remove duplicates if any
        const uniqueReadingIds = Array.from(new Set(allReadingIds));

        // Fetch details for each reading
        const readingPromises = uniqueReadingIds.map((rid: any) => 
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/readings/${rid}`)
        );
        const readingResponses = await Promise.all(readingPromises);
        const readingsData = readingResponses.map(res => res.data.data);
        setReadings(readingsData);

        // Set timer from the first reading's category if available
        if (readingsData.length > 0 && readingsData[0].categories?.[0]?.timer) {
          setTimeLeft(readingsData[0].categories[0].timer * 60);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load test data.');
    } finally {
      setLoading(false);
    }
  };

  // Timer Logic
  useEffect(() => {
    if (view === 'test' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && view === 'test') {
      handleFinish();
    }
  }, [view, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setView('test');
  };

  const handleFinish = async () => {
    try {
      const userDataId = localStorage.getItem('userDataId');
      if (!userDataId) {
        alert('User data not found. Please register first.');
        router.push(`/test/${id}`);
        return;
      }

      setLoading(true);

      // Prepare results per reading
      const results = readings.map(reading => {
        const passageQuestions = reading.SoalReading;
        let readingScore = 0;
        
        const answersList = passageQuestions.map(q => {
          const selectedOptionId = answers[q.id];
          const selectedOption = q.options.find(opt => opt.id === selectedOptionId);
          const isCorrect = selectedOption?.isCorrect || false;
          
          if (isCorrect) readingScore++;
          
          return {
            soalReadingId: q.id,
            readingOptionId: selectedOptionId || null,
            answer: selectedOption?.text || '-',
          };
        });

        return {
          readingId: reading.id,
          score: readingScore,
          answers: answersList
        };
      });

      // Save to backend
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/history/reading`, {
        userDataId: parseInt(userDataId),
        results
      });

      if (response.data.success) {
        console.log('Results saved:', response.data.data);
        // Navigation Logic: Listening > Writing > Speaking > Score
        if (paket?.listeningCategories && paket.listeningCategories.length > 0) {
          router.push(`/test/${id}/listening`);
        } else if (paket?.writingCategories && paket.writingCategories.length > 0) {
          router.push(`/test/${id}/writing`);
        } else if (paket?.speakingCategories && paket.speakingCategories.length > 0) {
          router.push(`/test/${id}/speaking`);
        } else {
          router.push(`/test/${id}/score?userId=${userDataId}`);
        }
      } else {
        throw new Error(response.data.message || 'Failed to save results.');
      }
    } catch (err: any) {
      console.error('Error finishing test:', err);
      alert('Error finishing test: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const currentReading = readings[currentReadingIndex];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E3F2FD] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (error || !paket) {
    return (
      <div className="min-h-screen bg-[#E3F2FD] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-slate-600 mb-6">{error || 'Paket not found'}</p>
          <button onClick={() => router.push('/')} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Back Home</button>
        </div>
      </div>
    );
  }

  if (view === 'introduction') {
    return (
      <div className="min-h-screen bg-[#E3F2FD] relative flex flex-col font-sans">
        {/* Background Geometric Patterns */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-4 opacity-40">
            {[...Array(6)].map((_, i) => (
              <div key={`l-${i}`} className="w-32 h-32 border-r-[3px] border-t-[3px] border-blue-400 rotate-45" style={{ marginLeft: i * 12 }}></div>
            ))}
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-4 opacity-40">
            {[...Array(6)].map((_, i) => (
              <div key={`r-${i}`} className="w-32 h-32 border-l-[3px] border-b-[3px] border-blue-400 rotate-45" style={{ marginRight: i * 12 }}></div>
            ))}
          </div>
        </div>

        <header className="relative z-10 w-full h-16 bg-white border-b flex items-center justify-center shadow-sm">
          <div className="flex items-center gap-0.5">
            <span className="text-2xl font-black italic text-slate-800">COBA</span>
            <span className="text-2xl font-light text-slate-500 tracking-[0.2em] ml-1">TEST</span>
          </div>
        </header>

        <main className="relative z-10 flex-grow flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="pt-10 pb-8 px-8 text-center">
              <h1 className="text-[32px] font-bold text-slate-900 mb-2">Reading</h1>
              <p className="text-lg text-slate-600">You are about to start the reading section.</p>
            </div>
            <div className="bg-[#F4F9FF] py-12 px-8 flex flex-col items-center border-y">
              <BookOpen size={64} className="text-blue-500 mb-4" strokeWidth={1.2} />
              <h3 className="text-slate-800 font-medium text-lg">Reading</h3>
              <p className="text-slate-900 font-bold text-xl">{Math.floor(timeLeft / 60)} mins</p>
            </div>
            <div className="p-10">
              <ul className="space-y-6">
                {[
                  "The questions in this test may get harder or easier to adapt to your level. Use the progress bar so that you have time to answer all the questions",
                  "You will not lose points for incorrect answers.",
                  "Once you submit a task, you cannot go back."
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0"></div>
                    <p className="text-[16px] leading-relaxed text-slate-800">{text}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="px-10 pb-12 flex justify-center">
              <button 
                onClick={handleStart}
                className="bg-[#007BFF] hover:bg-[#0069D9] text-white text-lg font-bold px-12 py-3 rounded-full transition-all"
              >
                Start
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Test Header */}
      <header className="h-16 bg-white border-b flex items-center justify-center relative shadow-sm">
        <div className="flex items-center gap-0.5">
          <span className="text-2xl font-black italic text-slate-800">COBA</span>
          <span className="text-2xl font-light text-slate-500 tracking-[0.2em] ml-1">TEST</span>
        </div>
      </header>

      {/* Control Bar */}
      <div className="h-14 border-b flex items-center px-8 gap-6 bg-white z-20">
        <div className="flex items-center gap-2 text-slate-600">
          <BookOpen size={20} />
          <span className="font-semibold text-sm mr-4">Reading</span>
        </div>
        
        <div className="flex-grow bg-slate-100 h-1.5 rounded-full relative overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${((currentReadingIndex + 1) / readings.length) * 100}%` }}
          ></div>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-bold text-slate-800 font-mono text-lg">{formatTime(timeLeft)}</span>
          <div className="w-5 h-5 rounded-full bg-blue-500 shadow-sm"></div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow flex overflow-hidden">
        {/* Left Column: Passage */}
        <div id="passage-container" className="w-1/2 p-12 overflow-y-auto border-r border-slate-100 bg-white custom-scrollbar">
          <h2 className="text-xl font-bold text-slate-900 mb-8 leading-relaxed">
            Read the passage about a historic building and choose the best answer for each question.
          </h2>
          <div 
            className="prose prose-slate max-w-none text-[17px] leading-relaxed text-slate-700"
            dangerouslySetInnerHTML={{ __html: currentReading?.content || '' }}
          />
        </div>

        {/* Right Column: Questions */}
        <div id="questions-container" className="w-1/2 bg-[#F8FBFF] p-12 overflow-y-auto relative custom-scrollbar">
          <div className="max-w-xl mx-auto space-y-8">
            {currentReading?.SoalReading.map((soal, sIndex) => (
              <div 
                key={soal.id} 
                id={`q-${soal.id}`}
                className="bg-white rounded-xl p-8 shadow-sm border border-slate-100"
              >
                <h3 className="text-lg font-bold text-slate-900 mb-6 leading-snug">
                  {soal.question}
                </h3>
                <div className="space-y-3">
                  {soal.options?.map((option) => (
                    <label 
                      key={option.id}
                      className={`block w-full p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-4 ${
                        answers[soal.id] === option.id 
                        ? 'border-blue-500 bg-blue-50/50 shadow-sm' 
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        answers[soal.id] === option.id ? 'border-blue-500' : 'border-slate-300'
                      }`}>
                        {answers[soal.id] === option.id && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
                      </div>
                      <input 
                        type="radio" 
                        name={`q-${soal.id}`} 
                        className="hidden"
                        checked={answers[soal.id] === option.id}
                        onChange={() => setAnswers(prev => ({ ...prev, [soal.id]: option.id }))}
                      />
                      <span className="text-slate-700 font-medium">{option.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Dots on Right edge - Represents Questions */}
          <div className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3">
              {currentReading?.SoalReading.map((soal, i) => (
                <div 
                  key={soal.id}
                  className={`w-2.5 h-2.5 rounded-full border-2 border-blue-300 transition-all cursor-pointer ${
                    answers[soal.id] ? 'bg-blue-400 border-blue-400' : 'bg-transparent'
                  }`}
                  title={`Question ${i + 1}`}
                  onClick={() => {
                    document.getElementById(`q-${soal.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                ></div>
              ))}
          </div>
          
          {/* Footer Navigation */}
          <div className="mt-12 flex justify-end gap-4 max-w-xl mx-auto pb-12">
              {currentReadingIndex < readings.length - 1 ? (
                <button 
                  onClick={() => {
                    setCurrentReadingIndex(prev => prev + 1);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3.5 rounded-full font-bold shadow-lg transition-all flex items-center gap-2 group"
                >
                  Next Task
                  <svg 
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button 
                  onClick={handleFinish}
                  className="bg-[#007BFF] hover:bg-[#0069D9] text-white px-10 py-3.5 rounded-full font-bold shadow-lg transition-all flex items-center gap-2"
                >
                  Finish Reading
                </button>
              )}
          </div>
        </div>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Roboto+Mono:wght@400;700&display=swap');
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        #passage-container {
          overflow-x: hidden;
        }

        #passage-container img {
          max-width: 100% !important;
          height: auto !important;
          object-fit: contain;
        }

        #passage-container * {
          max-width: 100%;
          overflow-wrap: anywhere;
          word-break: normal;
        }
      `}</style>
    </div>
  );
}
