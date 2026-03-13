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

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!id) return;

    const checkAccess = async () => {
      const userDataId = localStorage.getItem('userDataId');
      const storedPaketId = localStorage.getItem('paketId');

      if (!userDataId || storedPaketId !== String(id)) {
        window.location.href = `/test/${id}`;
        setIsAuthorized(false);
        return;
      }

      setIsAuthorized(true);
      fetchData();
      fetchSettings();
    };

    checkAccess();
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

        // Aggregate all writing IDs from all categories AND direct relations
        const fromCategories = (paketData.writingCategories || []).flatMap((cat: any) => 
          (cat.writings || []).map((w: any) => w.id)
        );
        const directIds = (paketData.writings || []).map((w: any) => w.id);
        
        const allWritingIds = [...fromCategories, ...directIds];
        const uniqueWritingIds = Array.from(new Set(allWritingIds));
        
        if (uniqueWritingIds.length > 0) {
          const writingPromises = uniqueWritingIds.map((wid: any) => 
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/writing/${wid}`)
          );
          const responses = await Promise.all(writingPromises);
          const itemsData = responses.map(res => res.data.data);
          setWritings(itemsData);
        } else {
          setWritings([]); // No writings found
        }

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

      // Defer saving: Store in localStorage
      localStorage.setItem(`pending_writing_${id}`, JSON.stringify(results));

      // Navigate to Speaking or Score
      const hasNextSection = paket?.speakingCategories && paket.speakingCategories.length > 0;
      
      if (hasNextSection) {
        router.push(`/test/${id}/speaking`);
      } else {
        // This is the last section, perform bulk save
        await saveAllResults(userDataId);
        router.push(`/test/${id}/score?userId=${userDataId}`);
      }
    } catch (err: any) {
      console.error('Error finishing test:', err);
      alert('Error finishing test');
    } finally {
      setLoading(false);
    }
  };

  const saveAllResults = async (userDataId: string) => {
    const readingData = localStorage.getItem(`pending_reading_${id}`);
    const listeningData = localStorage.getItem(`pending_listening_${id}`);
    const writingData = localStorage.getItem(`pending_writing_${id}`);
    
    const promises = [];

    if (readingData) {
      promises.push(axios.post(`${process.env.NEXT_PUBLIC_API_URL}/history/reading`, {
        userDataId: parseInt(userDataId),
        results: JSON.parse(readingData)
      }));
    }
    if (listeningData) {
      promises.push(axios.post(`${process.env.NEXT_PUBLIC_API_URL}/history/listening`, {
        userDataId: parseInt(userDataId),
        results: JSON.parse(listeningData)
      }));
    }
    if (writingData) {
      promises.push(axios.post(`${process.env.NEXT_PUBLIC_API_URL}/history/writing`, {
        userDataId: parseInt(userDataId),
        results: JSON.parse(writingData)
      }));
    }
    
    await Promise.all(promises);
    
    localStorage.removeItem(`pending_reading_${id}`);
    localStorage.removeItem(`pending_listening_${id}`);
    localStorage.removeItem(`pending_writing_${id}`);
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
      <div className="min-h-screen bg-[#E3F2FD] relative flex flex-col font-sans overflow-hidden">
        {/* Background Geometric Patterns - matching the user image style */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden hidden sm:flex items-center justify-between px-10">
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

        <header className="relative z-10 w-full h-16 md:h-20 bg-white border-b flex items-center justify-center shadow-sm shrink-0">
          {settings?.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" className="h-8 md:h-10 object-contain" />
          ) : (
            <div className="flex items-center gap-0.5">
              <span className="text-xl md:text-3xl font-black italic text-slate-800 tracking-tighter">COBA</span>
              <span className="text-xl md:text-3xl font-light text-slate-500 tracking-[0.3em] ml-2">TEST</span>
            </div>
          )}
        </header>

        <main className="relative z-10 flex-grow flex items-center justify-center p-4 md:p-6">
          <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col">
            <div className="pt-8 pb-6 md:pt-16 md:pb-12 px-6 md:px-12 text-center">
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 md:mb-6 tracking-tight">Writing</h1>
              <p className="text-lg md:text-2xl text-slate-600 font-medium tracking-tight">You are about to start the writing section.</p>
            </div>
            
            <div className="bg-[#F4F9FF] py-8 md:py-16 flex flex-col items-center border-y border-blue-50">
              <div className="w-14 h-14 md:w-20 md:h-20 bg-white rounded-xl shadow-sm border border-blue-100 flex items-center justify-center mb-4 md:mb-6">
                 <PenTool size={32} className="text-blue-500" strokeWidth={1.5} />
              </div>
              <h3 className="text-slate-800 font-bold text-lg md:text-xl mb-1 md:mb-2">Writing</h3>
              <p className="text-slate-900 font-black text-2xl md:text-3xl tracking-tight">{Math.floor(timeLeft / 60)} mins</p>
            </div>

            <div className="p-6 md:p-16 flex-grow max-h-[30vh] md:max-h-none overflow-y-auto">
              {settings?.writingInstructions ? (
                <div 
                  className="prose prose-slate max-w-none text-sm md:text-[18px] leading-relaxed text-slate-800 font-medium"
                  dangerouslySetInnerHTML={{ __html: settings.writingInstructions }}
                />
              ) : (
                <ul className="space-y-4 md:space-y-8">
                  {[
                    `You will see ${writings.length} prompt${writings.length > 1 ? 's' : ''} in this section. The prompts are not all the same difficulty. Pace yourself so that you have time to answer all the prompts.`,
                    "You can use any standard English spelling (UK, US, etc.).",
                    "You do not have to answer the prompts truthfully. If you find a question too personal or don't have any relevant experience, feel free to make up a fictitious answer.",
                    "Your score will include the complexity of vocabulary and linguistic structures used. Submitting shorter answers than the target length or using simple language may result in a lower score."
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-4 md:gap-6">
                      <div className="mt-2 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-slate-900 shrink-0"></div>
                      <p className="text-sm md:text-[18px] leading-relaxed text-slate-800 font-medium">{text}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="px-6 pb-8 md:px-16 md:pb-16 flex justify-center">
              <button 
                onClick={() => setView('test')}
                className="w-full sm:w-auto bg-[#007BFF] hover:bg-[#0069D9] text-white text-xl md:text-2xl font-black px-12 md:px-20 py-4 md:py-5 rounded-full shadow-xl shadow-blue-200 transition-all active:scale-95"
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
    <div className="h-screen bg-white flex flex-col font-sans overflow-hidden">
      <header className="h-16 bg-white border-b flex items-center justify-center relative shadow-sm shrink-0">
        {settings?.logoUrl ? (
          <img src={settings.logoUrl} alt="Logo" className="h-8 md:h-10 object-contain" />
        ) : (
          <div className="flex items-center gap-0.5">
            <span className="text-xl md:text-2xl font-black italic text-slate-800 tracking-tighter">COBA</span>
            <span className="text-xl md:text-2xl font-light text-slate-500 tracking-[0.2em] ml-1">TEST</span>
          </div>
        )}
      </header>

      {/* Control Bar */}
      <div className="h-auto md:h-14 border-b flex flex-col md:flex-row items-center px-4 md:px-8 py-2 md:py-0 gap-3 md:gap-6 bg-white z-20 shrink-0">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-2 text-slate-600">
            <PenTool size={18} />
            <span className="font-semibold text-xs md:text-sm md:mr-4 uppercase tracking-wider">Writing</span>
            <div className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] md:text-[10px] font-black tracking-[0.1em] md:tracking-[0.2em] uppercase rounded border border-blue-100 italic">
              T{currentWritingIndex + 1}/{writings.length}
            </div>
          </div>
          <div className="flex items-center gap-3 md:hidden">
            <span className="font-bold text-slate-800 font-mono text-base">{formatTime(timeLeft)}</span>
            <div className="w-4 h-4 rounded-full bg-blue-500 shadow-sm animate-pulse"></div>
          </div>
        </div>
        
        <div className="w-full md:flex-grow bg-slate-100 h-1 md:h-1.5 rounded-full relative overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${((currentWritingIndex + 1) / writings.length) * 100}%` }}
          ></div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <span className="font-bold text-slate-800 font-mono text-lg">{formatTime(timeLeft)}</span>
          <div className="w-5 h-5 rounded-full bg-blue-500 shadow-sm animate-pulse"></div>
        </div>
      </div>

      <main className="flex-grow flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column: Prompt / Instructions - Hidden for Short Answer */}
        {currentWriting?.jenis !== 'SHORT_ANSWER' && (
          <div 
            id="prompt-container"
            className="w-full lg:w-1/2 p-6 md:p-12 overflow-y-auto border-b lg:border-b-0 lg:border-r border-slate-100 bg-white h-1/2 lg:h-full"
          >
            <div className="max-w-2xl mx-auto">
               <div 
                 className="prose prose-slate max-w-none text-base md:text-[18px] leading-relaxed text-slate-700 font-medium"
                 dangerouslySetInnerHTML={{ __html: currentWriting?.content || '' }}
               />

               <div className="mt-8 md:mt-12 p-4 md:p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-4">
                  <Info className="text-blue-500 shrink-0 mt-0.5" size={20} />
                  <div className="text-xs md:text-sm text-slate-600 font-medium">
                     Please provide your response in the writing area. 
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
        <div className={`${currentWriting?.jenis === 'SHORT_ANSWER' ? 'w-full' : 'w-full lg:w-1/2 h-1/2 lg:h-full'} p-6 md:p-12 bg-[#F8FBFF] flex flex-col relative overflow-y-auto custom-scrollbar`}>
           <div className={`flex-grow flex flex-col ${currentWriting?.jenis === 'SHORT_ANSWER' ? 'max-w-4xl' : 'max-w-3xl'} w-full mx-auto`}>
                {currentWriting?.jenis === 'SHORT_ANSWER' && (
                   <div className="mb-6 md:mb-8">
                      <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-2 md:mb-4 leading-relaxed">
                        Read the following questions and provide your short answers.
                      </h2>
                   </div>
                )}

              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-4">
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
              </div>

              <div className="flex-grow flex flex-col gap-6 md:gap-10">
                {currentWriting?.jenis === 'SHORT_ANSWER' ? (
                  currentWriting.SoalWriting.map((sw, idx) => (
                    <div key={sw.id} className="flex flex-col gap-3 md:gap-4">
                       <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-lg bg-blue-600 text-white text-xs md:text-sm font-black">
                             {idx + 1}
                          </span>
                          <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                             {sw.question}
                          </h3>
                       </div>
                       <div className="bg-white rounded-[1.5rem] md:rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col p-4 md:p-6 focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
                          <textarea 
                             className="w-full h-24 md:h-32 resize-none outline-none text-lg md:text-xl leading-relaxed text-black placeholder:text-slate-200 font-medium"
                             placeholder="Type your answer here..."
                             value={answers[`q-${sw.id}`] || ''}
                             onChange={(e) => handleAnswerChange(`q-${sw.id}`, e.target.value)}
                          />
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="flex-grow bg-white rounded-[1.5rem] md:rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col p-6 md:p-8 focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50 transition-all group min-h-[250px] lg:min-h-0">
                    <textarea 
                        className="flex-grow w-full resize-none outline-none text-lg md:text-xl leading-relaxed text-black placeholder:text-slate-200 font-medium"
                        placeholder="Start typing your response here..."
                        value={answers[currentWriting?.id] || ''}
                        onChange={(e) => handleAnswerChange(currentWriting.id, e.target.value)}
                    />

                    <div className="mt-4 md:mt-8 pt-4 md:pt-6 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[8px] md:text-[10px] font-black text-slate-400 tracking-[0.1em] md:tracking-[0.2em] uppercase mb-0.5">Word Count</span>
                            <span className={`text-xl md:text-2xl font-black ${
                              currentWriting?.targetWords > 0 && getWordCount(answers[currentWriting.id] || '') < currentWriting.targetWords
                              ? 'text-slate-400' 
                              : 'text-blue-600'
                            }`}>
                              {getWordCount(answers[currentWriting?.id] || '')}
                              {currentWriting?.targetWords > 0 && (
                                <span className="text-[10px] md:text-sm text-slate-300 font-bold ml-1">/ {currentWriting.targetWords} rec.</span>
                              )}
                            </span>
                        </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 md:mt-12 flex justify-center md:justify-end gap-6 mb-8 lg:mb-0">
                 {currentWritingIndex < writings.length - 1 ? (
                   <button 
                     onClick={() => {
                        setCurrentWritingIndex(prev => prev + 1);
                     }}
                     className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 md:px-12 py-3.5 md:py-4 rounded-full font-black shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3 hover:scale-105 active:scale-95 text-base md:text-lg"
                   >
                     Next Task
                     <ArrowRight size={18} strokeWidth={3} />
                   </button>
                 ) : (
                   <button 
                     onClick={handleFinish}
                     className="w-full sm:w-auto bg-[#007BFF] hover:bg-[#0069D9] text-white px-10 md:px-14 py-3.5 md:py-4 rounded-full font-black shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3 hover:scale-105 active:scale-95 text-base md:text-lg"
                   >
                     Finish Section
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

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
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
