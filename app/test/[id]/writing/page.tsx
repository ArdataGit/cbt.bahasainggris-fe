'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PenTool, Loader2, Info, ArrowRight, Save, Clock } from 'lucide-react';
import axios from 'axios';

interface Writing {
  id: number;
  title: string;
  content: string;
  jenis: 'ESSAY' | 'SHORT_ANSWER';
  targetWords: number;
  SoalWriting: { id: number; question: string }[];
  categories: { timer: number }[];
}

interface Paket {
  id: number;
  name: string;
  writingCategories: any[];
  speakingCategories: any[];
}

export default function WritingTestPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [view, setView] = useState<'introduction' | 'test'>('introduction');
  const [paket, setPaket] = useState<Paket | null>(null);
  const [writings, setWritings] = useState<Writing[]>([]);
  const [currentWritingIndex, setCurrentWritingIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(35 * 60);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchData();
      fetchSettings();
    }
  }, [id]);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/settings`);
      if (response.data.success) {
        setSettings(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch settings');
    }
  };

  useEffect(() => {
    document.getElementById('prompt-container')?.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentWritingIndex]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const paketRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/pakets/${id}`);
      if (paketRes.data.success) {
        const paketData = paketRes.data.data;
        setPaket(paketData);

        const allWritingIds = paketData.writingCategories.flatMap((cat: any) => 
          cat.writings.map((w: any) => w.id)
        );

        const uniqueWritingIds = Array.from(new Set(allWritingIds));

        const promises = uniqueWritingIds.map((wid: any) => 
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/writing/${wid}`)
        );
        const responses = await Promise.all(promises);
        const itemsData = responses.map(res => res.data.data);
        setWritings(itemsData);

        // Set timer from the first category if available
        if (paketData.writingCategories?.[0]?.timer) {
          setTimeLeft(paketData.writingCategories[0].timer * 60);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load test data.');
    } finally {
      setLoading(false);
    }
  };

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

  const getWordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  const handleAnswerChange = (key: string | number, text: string) => {
    setAnswers(prev => ({ ...prev, [key]: text }));
    // Auto-save feedback effect
    setSavingStatus('saving');
    setTimeout(() => setSavingStatus('saved'), 1000);
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

      const results = writings.map(item => {
        let taskScore = 0;
        const subAnswers = item.SoalWriting.map(sw => {
          const userAnswer = (answers[`q-${sw.id}`] || '').trim().toLowerCase();
          
          if (item.jenis === 'SHORT_ANSWER' && (sw as any).AnswerWriting) {
            const isCorrect = (sw as any).AnswerWriting.some((aw: any) => 
               aw.answer.trim().toLowerCase() === userAnswer
            );
            if (isCorrect) taskScore += 1;
          }

          return {
            soalWritingId: sw.id,
            answer: answers[`q-${sw.id}`] || ''
          };
        });

        return {
          writingId: item.id,
          answer: answers[item.id] || '',
          answers: subAnswers,
          score: item.jenis === 'SHORT_ANSWER' ? taskScore : 0
        };
      });

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/history/writing`, {
        userDataId: parseInt(userDataId),
        results
      });

      if (response.data.success) {
        // Navigate to Speaking or Score
        if (paket?.speakingCategories && paket.speakingCategories.length > 0) {
          router.push(`/test/${id}/speaking`);
        } else {
          router.push(`/test/${id}/score?userId=${userDataId}`);
        }
      }
    } catch (err: any) {
      console.error('Error finishing test:', err);
      alert('Error finishing test');
    } finally {
      setLoading(false);
    }
  };

  if (loading && writings.length === 0) {
    return (
      <div className="min-h-screen bg-[#E3F2FD] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (view === 'introduction') {
    return (
      <div className="min-h-screen bg-[#E3F2FD] relative flex flex-col font-sans">
        {/* Background Geometric Patterns - matching the user image style */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-between px-10">
           <div className="flex flex-col gap-4 opacity-40">
            {[...Array(8)].map((_, i) => (
              <div key={`l-${i}`} className="w-48 h-48 border-r-[4px] border-t-[4px] border-blue-400 rotate-45" style={{ marginLeft: i * 16 }}></div>
            ))}
          </div>
          <div className="flex flex-col gap-4 opacity-40">
            {[...Array(8)].map((_, i) => (
              <div key={`r-${i}`} className="w-48 h-48 border-l-[4px] border-b-[4px] border-blue-400 rotate-45" style={{ marginRight: i * 16 }}></div>
            ))}
          </div>
        </div>

        <header className="relative z-10 w-full h-20 bg-white border-b flex items-center justify-center shadow-sm">
          {settings?.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" className="h-10 object-contain" />
          ) : (
            <div className="flex items-center gap-0.5">
              <span className="text-3xl font-black italic text-slate-800 tracking-tighter">COBA</span>
              <span className="text-3xl font-light text-slate-500 tracking-[0.3em] ml-2">TEST</span>
            </div>
          )}
        </header>

        <main className="relative z-10 flex-grow flex items-center justify-center p-6">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col">
            <div className="pt-16 pb-12 px-12 text-center">
              <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">Writing</h1>
              <p className="text-2xl text-slate-600 font-medium tracking-tight">You are about to start the writing section.</p>
            </div>
            
            <div className="bg-[#F4F9FF] py-16 flex flex-col items-center border-y border-blue-50">
              <div className="w-20 h-20 bg-white rounded-xl shadow-sm border border-blue-100 flex items-center justify-center mb-6">
                 <PenTool size={40} className="text-blue-500" strokeWidth={1.5} />
              </div>
              <h3 className="text-slate-800 font-bold text-xl mb-2">Writing</h3>
              <p className="text-slate-900 font-black text-3xl tracking-tight">{Math.floor(timeLeft / 60)} mins</p>
            </div>

            <div className="p-16 flex-grow">
              {settings?.writingInstructions ? (
                <div 
                  className="prose prose-slate max-w-none text-[18px] leading-relaxed text-slate-800 font-medium"
                  dangerouslySetInnerHTML={{ __html: settings.writingInstructions }}
                />
              ) : (
                <ul className="space-y-8">
                  {[
                    `You will see ${writings.length} prompt${writings.length > 1 ? 's' : ''} in this section. The prompts are not all the same difficulty. Pace yourself so that you have time to answer all the prompts.`,
                    "You can use any standard English spelling (UK, US, etc.).",
                    "You do not have to answer the prompts truthfully. If you find a question too personal or don't have any relevant experience, feel free to make up a fictitious answer.",
                    "Your score will include the complexity of vocabulary and linguistic structures used. Submitting shorter answers than the target length or using simple language may result in a lower score."
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-6">
                      <div className="mt-2.5 w-2 h-2 rounded-full bg-slate-900 shrink-0"></div>
                      <p className="text-[18px] leading-relaxed text-slate-800 font-medium">{text}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="px-16 pb-16 flex justify-center">
              <button 
                onClick={() => setView('test')}
                className="bg-[#007BFF] hover:bg-[#0069D9] text-white text-2xl font-black px-20 py-5 rounded-full shadow-xl shadow-blue-200 transition-all active:scale-95"
              >
                Start
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const currentWriting = writings[currentWritingIndex];

  return (
    <div className="h-screen overflow-hidden bg-white flex flex-col font-sans">
      <header className="h-16 bg-white border-b flex items-center justify-center relative shadow-sm">
        {settings?.logoUrl ? (
          <img src={settings.logoUrl} alt="Logo" className="h-10 object-contain" />
        ) : (
          <div className="flex items-center gap-0.5">
            <span className="text-2xl font-black italic text-slate-800 tracking-tighter">COBA</span>
            <span className="text-2xl font-light text-slate-500 tracking-[0.2em] ml-1">TEST</span>
          </div>
        )}
      </header>

      <div className="h-14 border-b flex items-center px-8 gap-6 bg-white z-20">
        <div className="flex items-center gap-2 text-slate-600">
          <PenTool size={20} />
          <span className="font-semibold text-sm mr-4 uppercase tracking-wider">Writing</span>
          <div className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black tracking-[0.2em] uppercase rounded border border-blue-100">
            Task {currentWritingIndex + 1} of {writings.length}
          </div>
        </div>
        
        <div className="flex-grow bg-slate-100 h-1.5 rounded-full relative overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${((currentWritingIndex + 1) / writings.length) * 100}%` }}
          ></div>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-bold text-slate-800 font-mono text-lg">{formatTime(timeLeft)}</span>
          <div className="w-5 h-5 rounded-full bg-blue-500 shadow-sm animate-pulse"></div>
        </div>
      </div>

      <main className="flex-grow flex overflow-hidden">
        {/* Left Column: Prompt / Instructions - Hidden for Short Answer */}
        {currentWriting?.jenis !== 'SHORT_ANSWER' && (
          <div 
            id="prompt-container"
            className="w-1/2 p-12 overflow-y-auto border-r border-slate-100 bg-white"
          >
            <div className="max-w-2xl mx-auto">
               {/* <div className="flex items-center gap-3 mb-6">
                  <div className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black tracking-[0.2em] uppercase rounded border border-blue-100">
                     Task {currentWritingIndex + 1} of {writings.length}
                  </div>
                  {currentWriting?.jenis && (
                    <div className="px-3 py-1 bg-purple-50 text-purple-600 text-[10px] font-black tracking-[0.2em] uppercase rounded border border-purple-100">
                      {currentWriting.jenis.replace('_', ' ')}
                    </div>
                  )}
               </div> */}

               {/* <h1 className="text-4xl font-black text-slate-900 mb-8 leading-tight tracking-tight">
                 {currentWriting?.title || 'Writing Prompt'}
               </h1> */}
               
               <div 
                 className="prose prose-slate max-w-none text-[18px] leading-relaxed text-slate-700 font-medium"
                 dangerouslySetInnerHTML={{ __html: currentWriting?.content || '' }}
               />

               <div className="mt-12 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-4">
                  <Info className="text-blue-500 shrink-0 mt-0.5" size={20} />
                  <div className="text-sm text-slate-600 font-medium">
                     Please provide your response in the writing area on the right. 
                     {currentWriting?.targetWords > 0 && (
                       <span className="block mt-1 font-bold text-blue-700">
                         Recommended length: {currentWriting.targetWords} words.
                       </span>
                     )}
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Right Column: Writing Area */}
        <div className={`${currentWriting?.jenis === 'SHORT_ANSWER' ? 'w-full px-4 sm:px-12 py-12 sm:py-20' : 'w-1/2 p-12'} bg-[#F8FBFF] flex flex-col relative overflow-y-auto`}>
           <div className={`flex-grow flex flex-col ${currentWriting?.jenis === 'SHORT_ANSWER' ? 'max-w-4xl' : 'max-w-3xl'} w-full mx-auto`}>
                <div className="mb-8">
                   <h2 className="text-xl font-bold text-slate-900 mb-4 leading-relaxed">
                     Read the following questions and provide your short answers.
                   </h2>
                </div>

              <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                  {/* <span className="text-[12px] font-black text-slate-400 tracking-widest uppercase italic">
                    {currentWriting?.jenis === 'SHORT_ANSWER' ? 'Your Answer' : 'Your Response'}
                  </span> */}
                  {savingStatus !== 'idle' && (
                       <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-100 rounded-full text-xs text-slate-500 animate-in fade-in slide-in-from-left-2 transition-all">
                          {savingStatus === 'saving' ? (
                            <>
                              <Loader2 size={12} className="animate-spin text-blue-500" />
                              <span className="font-bold">Auto-saving...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle size={12} className="text-green-500" />
                              <span className="font-bold">Draft Saved</span>
                            </>
                          )}
                       </div>
                    )}
                 </div>
                  {/* <div className="flex items-center gap-3">
                    <Clock size={16} className="text-slate-400" />
                    <span className="text-[12px] font-black text-slate-500 tracking-widest uppercase font-mono">{formatTime(timeLeft)}</span>
                  </div> */}
              </div>

              <div className="flex-grow flex flex-col gap-10">
                {currentWriting?.jenis === 'SHORT_ANSWER' ? (
                  currentWriting.SoalWriting.map((sw, idx) => (
                    <div key={sw.id} className="flex flex-col gap-4">
                       <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white text-sm font-black">
                             {idx + 1}
                          </span>
                          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                             {sw.question}
                          </h3>
                       </div>
                       <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col p-6 focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
                          <textarea 
                             className="w-full h-32 resize-none outline-none text-xl leading-relaxed text-slate-800 placeholder:text-slate-200 font-medium"
                             placeholder="Type your answer here..."
                             value={answers[`q-${sw.id}`] || ''}
                             onChange={(e) => handleAnswerChange(`q-${sw.id}`, e.target.value)}
                          />
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="flex-grow bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col p-8 focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50 transition-all group">
                    <textarea 
                        className="flex-grow w-full resize-none outline-none text-xl leading-relaxed text-slate-800 placeholder:text-slate-200 font-medium"
                        placeholder="Start typing your response here..."
                        value={answers[currentWriting?.id] || ''}
                        onChange={(e) => handleAnswerChange(currentWriting.id, e.target.value)}
                    />

                    <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-center sm:justify-between">
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase mb-0.5 text-center sm:text-left">Word Count</span>
                                <span className={`text-2xl font-black text-center sm:text-left ${
                                  currentWriting?.targetWords > 0 && getWordCount(answers[currentWriting.id] || '') < currentWriting.targetWords
                                  ? 'text-slate-400' 
                                  : 'text-blue-600'
                                }`}>
                                  {getWordCount(answers[currentWriting?.id] || '')}
                                  {currentWriting?.targetWords > 0 && (
                                    <span className="text-sm text-slate-300 font-bold ml-1">/ {currentWriting.targetWords} recommended</span>
                                  )}
                                </span>
                            </div>
                        </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-12 flex justify-end gap-6">
                 {currentWritingIndex < writings.length - 1 ? (
                   <button 
                     onClick={() => {
                        setCurrentWritingIndex(prev => prev + 1);
                     }}
                     className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-full font-black shadow-xl shadow-blue-100 transition-all flex items-center gap-3 hover:scale-105 active:scale-95 text-lg"
                   >
                     Next Task
                     <ArrowRight size={20} strokeWidth={3} />
                   </button>
                 ) : (
                   <button 
                     onClick={handleFinish}
                     className="bg-[#007BFF] hover:bg-[#0069D9] text-white px-14 py-4 rounded-full font-black shadow-xl shadow-blue-100 transition-all flex items-center gap-3 hover:scale-105 active:scale-95 text-lg"
                   >
                     Finish Writing Section
                   </button>
                 )}
              </div>
           </div>
        </div>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
        }

        .prose p {
          margin-bottom: 1.5rem;
        }
      `}</style>
    </div>
  );
}

// Helper components
function CheckCircle({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
