'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Headphones, Loader2, Play, Volume2, CheckCircle, Info, ArrowRight } from 'lucide-react';
import axios from 'axios';

interface Option {
  id: number;
  text: string;
  imageUrl?: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  question: string;
  options: Option[];
}

interface Listening {
  id: number;
  title: string;
  content: string;
  audioUrl: string | null;
  SoalListeing: Question[];
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

export default function ListeningTestPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [view, setView] = useState<'audio-check' | 'introduction' | 'test'>('audio-check');
  const [paket, setPaket] = useState<Paket | null>(null);
  const [listenings, setListenings] = useState<Listening[]>([]);
  const [currentListeningIndex, setCurrentListeningIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [playCounts, setPlayCounts] = useState<Record<number, number>>({});
  
  const currentListening = listenings[currentListeningIndex];
  
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
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
    document.getElementById('audio-container')?.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('questions-container')?.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentListeningIndex]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const paketRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/pakets/${id}`);
      if (paketRes.data.success) {
        const paketData = paketRes.data.data;
        console.log('Full Paket Data:', paketData);
        setPaket(paketData);

        const fromCategories = paketData.listeningCategories.flatMap((cat: any) => 
          (cat.listenings || []).map((l: any) => l.id)
        );
        const directIds = (paketData.listenings || []).map((l: any) => l.id);
        
        const allListeningIds = [...fromCategories, ...directIds];
        console.log('All Listening IDs extracted:', allListeningIds);

        const uniqueListeningIds = Array.from(new Set(allListeningIds));
        console.log('Unique Listening IDs:', uniqueListeningIds);

        const promises = uniqueListeningIds.map((lid: any) => 
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/listening/${lid}`)
        );
        const responses = await Promise.all(promises);
        const itemsData = responses.map(res => res.data.data);
        console.log('Fetched Listenings:', itemsData);
        itemsData.forEach((item, index) => {
          console.log(`Listening ${index} audioUrl:`, item.audioUrl);
        });
        setListenings(itemsData);

        if (itemsData.length > 0 && itemsData[0].categories?.[0]?.timer) {
          setTimeLeft(itemsData[0].categories[0].timer * 60);
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

  const handleFinish = async () => {
    try {
      const userDataId = localStorage.getItem('userDataId');
      if (!userDataId) {
        alert('User data not found. Please register first.');
        router.push(`/test/${id}`);
        return;
      }

      setLoading(true);

      // Prepare results per listening item
      const results = listenings.map(item => {
        const itemQuestions = item.SoalListeing;
        let listeningScore = 0;
        
        const answersList = itemQuestions.map(q => {
          const selectedOptionId = answers[q.id];
          const selectedOption = q.options.find(opt => opt.id === selectedOptionId);
          const isCorrect = selectedOption?.isCorrect || false;
          
          if (isCorrect) listeningScore++;
          
          return {
            soalListeningId: q.id,
            listeningOptionId: selectedOptionId || null,
            answer: selectedOption?.text || '-',
          };
        });

        return {
          listeningId: item.id,
          score: listeningScore,
          answers: answersList
        };
      });

      // Save to backend
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/history/listening`, {
        userDataId: parseInt(userDataId),
        results
      });

      if (response.data.success) {
        console.log('Results saved:', response.data.data);
        // Navigation Logic: Writing > Speaking > Score
        if (paket?.writingCategories && paket.writingCategories.length > 0) {
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

  const toggleCheckAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Check audio playback failed:", error);
            alert("Gagal memutar suara cek. Mohon periksa koneksi internet atau pengaturan audio Anda.");
          });
        }
        setIsPlaying(true);
      }
    }
  };

  const toggleListeningAudio = () => {
    if (audioRef.current && currentListening) {
      const currentCount = playCounts[currentListening.id] || 0;
      
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // Check if the user is resuming a paused audio (currentTime > 0 means it was started before)
        const isStartingFresh = audioRef.current.currentTime === 0 || audioRef.current.ended;

        // Allow: resuming a paused audio (always), OR starting fresh if count < 2
        if (!isStartingFresh || currentCount < 2) {
          // Reset time if it has ended, so it plays from start
          if (audioRef.current.ended) {
            audioRef.current.currentTime = 0;
          }
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.error("Listening audio playback failed:", error);
              alert("Gagal memutar audio. Mohon periksa kembali materi audio di dashboard.");
            });
          }
          setIsPlaying(true);
        } else {
          alert('You have reached the maximum of 2 plays for this audio.');
        }
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    if (currentListening) {
      setPlayCounts(prev => ({
        ...prev,
        [currentListening.id]: (prev[currentListening.id] || 0) + 1
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E3F2FD] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (view === 'audio-check') {
    return (
      <div className="min-h-screen bg-[#E3F2FD] relative flex flex-col font-sans">
        {/* Background Geometric Patterns */}
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
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl p-16 text-center">
            <h1 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">Audio check</h1>
            <p className="text-xl text-slate-600 mb-12 font-medium">Please check your audio settings before you start.</p>
            
            <div className="mb-12 flex flex-col items-center">
              <audio 
                ref={audioRef} 
                src="https://www.soundjay.com/buttons/beep-01a.mp3"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="hidden"
              />
              <button 
                onClick={toggleCheckAudio}
                className="w-24 h-24 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-xl shadow-blue-200 transition-all hover:scale-105"
              >
                {isPlaying ? (
                  <div className="flex gap-2 items-center">
                    <div className="w-2 h-10 bg-white rounded-full animate-pulse"></div>
                    <div className="w-2 h-10 bg-white rounded-full animate-pulse delay-75"></div>
                  </div>
                ) : (
                  <Play size={40} fill="currentColor" />
                )}
              </button>
              <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-xs">
                {isPlaying ? 'Audio is playing...' : 'Press play button'}
              </p>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-8">Can you hear the recording?</h2>

            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => alert('Please check your device volume or headphones.')}
                className="px-10 py-4 border-2 border-blue-600 text-blue-600 font-bold rounded-full hover:bg-blue-50 transition-colors min-w-[140px]"
              >
                No
              </button>
              <button 
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.pause();
                    setIsPlaying(false);
                  }
                  setView('introduction');
                }}
                className="px-10 py-4 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 min-w-[200px]"
              >
                Yes, continue to test
              </button>
            </div>
          </div>
        </main>

        <div className="absolute bottom-10 right-10">
            <button className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg">
                <Volume2 size={24} />
            </button>
        </div>
      </div>
    );
  }

  if (view === 'introduction') {
    return (
      <div className="min-h-screen bg-[#E3F2FD] relative flex flex-col">
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
            <span className="text-2xl font-black italic text-slate-800 tracking-tighter">CBT</span>
            <span className="text-2xl font-light text-slate-500 tracking-[0.2em] ml-1">TEST</span>
          </div>
        </header>

        <main className="relative z-10 flex-grow flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="pt-10 pb-8 px-8 text-center">
              <h1 className="text-[32px] font-bold text-slate-900 mb-2">Listening</h1>
              <p className="text-lg text-slate-600">You are about to start the listening section.</p>
            </div>
            <div className="bg-[#F4F9FF] py-12 px-8 flex flex-col items-center border-y">
              <Headphones size={64} className="text-blue-500 mb-4" strokeWidth={1.2} />
              <h3 className="text-slate-800 font-medium text-lg">Listening</h3>
              <p className="text-slate-900 font-bold text-xl">{Math.floor(timeLeft / 60)} mins</p>
            </div>
            <div className="p-10 flex-grow">
              {settings?.listeningInstructions ? (
                <div 
                  className="prose prose-slate max-w-none text-[16px] leading-relaxed text-slate-800"
                  dangerouslySetInnerHTML={{ __html: settings.listeningInstructions }}
                />
              ) : (
                <ul className="space-y-6">
                  {[
                    "Listen carefully as some recordings may only play a limited number of times.",
                    "Make sure you can hear the audio clearly throughout the test.",
                    "Once you submit a task, you cannot go back."
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0"></div>
                      <p className="text-[16px] leading-relaxed text-slate-800">{text}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="px-10 pb-12 flex justify-center">
              <button 
                onClick={() => setView('test')}
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
          <Headphones size={20} />
          <span className="font-semibold text-sm mr-4">Listening</span>
        </div>
        
        <div className="flex-grow bg-slate-100 h-1.5 rounded-full relative overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${((currentListeningIndex + 1) / listenings.length) * 100}%` }}
          ></div>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-bold text-slate-800 font-mono text-lg">{formatTime(timeLeft)}</span>
          <div className="w-5 h-5 rounded-full bg-blue-500 shadow-sm"></div>
        </div>
      </div>

      <main className="flex-grow flex overflow-hidden">
        {/* Left Column: Audio and Instructions */}
        <div 
          id="audio-container"
          className="w-1/2 p-12 overflow-y-auto border-r border-slate-100 bg-white custom-scrollbar"
        >
          <div className="max-w-2xl mx-auto">
            {/* Audio Player Card - More compact and integrated */}
            <div className="bg-[#F8FBFF] rounded-2xl p-6 border border-blue-100 mb-10 flex items-center gap-6 shadow-sm">
               <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shrink-0 shadow-md">
                  <Volume2 className="text-white" size={28} />
               </div>
               <div className="flex-grow">
                 <h4 className="text-slate-900 font-bold mb-1">Audio Recording</h4>
                 <p className="text-slate-500 text-sm">
                   Plays remaining: <span className="font-bold text-blue-600">{Math.max(0, 2 - (playCounts[currentListening?.id] || 0))}</span>/2
                 </p>
               </div>
               
               {currentListening?.audioUrl ? (
                 <div className="flex items-center gap-4">
                    <audio 
                      ref={audioRef}
                      src={`${process.env.NEXT_PUBLIC_API_URL}${currentListening.audioUrl}`}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onEnded={handleAudioEnded}
                      className="hidden"
                    />
                    <button 
                      onClick={toggleListeningAudio}
                      className="bg-white hover:bg-slate-50 text-blue-600 w-14 h-14 rounded-full flex items-center justify-center shadow-sm border border-blue-200 transition-all active:scale-95"
                    >
                      {isPlaying ? (
                        <div className="flex gap-1 items-center">
                           <div className="w-1.5 h-6 bg-blue-600 rounded-full animate-pulse"></div>
                           <div className="w-1.5 h-6 bg-blue-600 rounded-full animate-pulse delay-75"></div>
                        </div>
                      ) : (
                        <Play fill="#2563eb" className="ml-1" size={24} />
                      )}
                    </button>
                 </div>
               ) : (
                 <div className="px-4 py-2 bg-red-50 text-red-500 text-xs font-bold rounded-lg border border-red-100">
                    Audio Missing
                 </div>
               )}
            </div>

            {/* Dynamic Content - Like Reading Page */}
            {/* <h1 className="text-3xl font-black text-slate-900 mb-8 leading-tight">
              {currentListening?.title || 'Listening Task'}
            </h1> */}
            
            <h2 className="text-xl font-bold text-slate-900 mb-8 leading-relaxed">
              Listen to the recording about a specific topic and choose the best answer for each question.
            </h2>
            <div 
              className="prose prose-slate max-w-none text-[17px] leading-relaxed text-slate-700"
              dangerouslySetInnerHTML={{ __html: currentListening?.content || '' }}
            />

           
          </div>
        </div>

        {/* Right Column: Questions */}
        <div 
          id="questions-container"
          className="w-1/2 bg-[#F8FBFF] p-12 overflow-y-auto relative custom-scrollbar"
        >
          <div className="max-w-xl mx-auto space-y-8">
            {currentListening?.SoalListeing?.map((soal) => (
              <div 
                key={soal.id} 
                id={`q-${soal.id}`}
                className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100"
              >
                <h3 className="text-lg font-bold text-slate-900 mb-6 leading-snug">
                  {soal.question}
                </h3>
                <div className="space-y-3">
                  {soal.options?.map((option) => (
                    <label 
                      key={option.id}
                      className={`block w-full p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-4 ${
                        answers[soal.id] === option.id 
                        ? 'border-blue-500 bg-blue-50/50 shadow-sm' 
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
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
                      </div>

                      {option.imageUrl && (
                        <div className="pl-10">
                          <img 
                            src={option.imageUrl} 
                            alt="Option visual" 
                            className="max-w-full h-auto rounded-lg border border-slate-100 shadow-sm max-h-48 object-contain"
                          />
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-end gap-4 max-w-xl mx-auto pb-12">
              {currentListeningIndex < listenings.length - 1 ? (
                <button 
                  onClick={() => {
                    setCurrentListeningIndex(prev => prev + 1);
                    setIsPlaying(false);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3.5 rounded-full font-bold shadow-lg transition-all flex items-center gap-2 group"
                >
                  Next Task
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button 
                  onClick={handleFinish}
                  className="bg-[#007BFF] hover:bg-[#0069D9] text-white px-10 py-3.5 rounded-full font-bold shadow-lg transition-all flex items-center gap-2"
                >
                  Finish Listening
                </button>
              )}
          </div>

          {/* Navigation Dots on Right edge - Represents Questions */}
          <div className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-30">
              {currentListening?.SoalListeing?.map((soal, i) => (
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
        </div>
      </main>

      <style jsx global>{`
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
      `}</style>
    </div>
  );
}
