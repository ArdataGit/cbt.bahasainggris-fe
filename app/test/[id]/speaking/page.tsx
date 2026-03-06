'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Mic, Volume2, Play, PieChart, Square, Check } from 'lucide-react';
import axios from 'axios';

interface Paket {
  id: number;
  name: string;
  speakingCategories: any[];
}

export default function SpeakingTestIntroPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [view, setView] = useState<'introduction' | 'microphone' | 'microphone-test' | 'test'>('introduction');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paket, setPaket] = useState<Paket | null>(null);
  const [totalTimer, setTotalTimer] = useState(15); // Default 15 mins
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  const [speakings, setSpeakings] = useState<any[]>([]);
  const [currentSpeakingIndex, setCurrentSpeakingIndex] = useState(0);
  const [audioState, setAudioState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'recorded'>('idle');
  const [answers, setAnswers] = useState<Blob[]>([]);
  const [repeatCounts, setRepeatCounts] = useState<Record<number, number>>({});
  
  // Microphone Test States
  const [testVolume, setTestVolume] = useState(0);
  const [testAudioUrl, setTestAudioUrl] = useState<string | null>(null);
  const [isTestRecording, setIsTestRecording] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const testAudioRef = useRef<HTMLAudioElement | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const testRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const testChunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    if (view === 'test' && speakings.length > 0 && audioState === 'idle') {
      const timer = setTimeout(() => {
        playAudio();
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, currentSpeakingIndex, audioState, speakings.length]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/pakets/${id}`);
      if (res.data.success) {
        const data = res.data.data;
        setPaket(data);
        
        // Calculate total time from categories if available
        if (data.speakingCategories && data.speakingCategories.length > 0) {
          let totalMins = 0;
          let hasTimer = false;
          data.speakingCategories.forEach((cat: any) => {
             if (cat.timer) {
                 totalMins += cat.timer;
                 hasTimer = true;
             }
          });
           if (hasTimer) {
               setTotalTimer(totalMins);
               setTimeLeft(totalMins * 60);
           }

          // Fetch speaking details safely
          const allSpeakingIds = data.speakingCategories.flatMap((cat: any) => 
            (cat.speakings || []).map((s: any) => s.id)
          );
          const uniqueSpeakingIds = Array.from(new Set(allSpeakingIds));
          if (uniqueSpeakingIds.length > 0) {
            const speakingPromises = uniqueSpeakingIds.map((sid: any) => 
              axios.get(`${process.env.NEXT_PUBLIC_API_URL}/speakings/${sid}`)
            );
            const speakingResponses = await Promise.all(speakingPromises);
            setSpeakings(speakingResponses.map(res => res.data.data));
          }
        }
      } else {
        throw new Error(res.data.message || 'Failed to fetch packet.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
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
      handleNext();
    }
  }, [view, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setView('microphone');
  };

  const handleAllowMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      startVolumeAnalysis(stream);
      setView('microphone-test');
    } catch (err) {
      alert('Microphone access is required for the speaking test.');
    }
  };

  const startVolumeAnalysis = (stream: MediaStream) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.fftSize = 256;
    
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateVolume = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      setTestVolume(average);
      animationFrameRef.current = requestAnimationFrame(updateVolume);
    };

    updateVolume();
  };

  const startTestRecording = () => {
    if (!streamRef.current) return;
    const mediaRecorder = new MediaRecorder(streamRef.current);
    testRecorderRef.current = mediaRecorder;
    testChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        testChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(testChunksRef.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(audioBlob);
      setTestAudioUrl(url);
    };

    mediaRecorder.start();
    setIsTestRecording(true);
    setTestAudioUrl(null);
  };

  const stopTestRecording = () => {
    if (testRecorderRef.current && testRecorderRef.current.state === 'recording') {
      testRecorderRef.current.stop();
      setIsTestRecording(false);
    }
  };

  const playTestRecording = () => {
    if (testAudioRef.current) {
        testAudioRef.current.play();
    }
  };

  const handleContinueToTest = () => {
    cleanupAudioAnalysis();
    setView('test');
  };

  const cleanupAudioAnalysis = () => {
      if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
      }
      if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
      }
      analyserRef.current = null;
  };

  useEffect(() => {
    return () => {
      cleanupAudioAnalysis();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleSkipTest = () => {
       const userDataId = localStorage.getItem('userDataId');
       router.push(`/test/${id}/score${userDataId ? `?userId=${userDataId}` : ''}`); 
  };

  const playAudio = () => {
    if (audioRef.current) {
      setAudioState('playing');
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Audio playback failed:", error);
          alert("Audio file could not be played or is missing. Proceeding to recording mode.");
          setAudioState('ended');
        });
      }
    } else {
      setAudioState('ended');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      startVolumeAnalysis(stream); // Start visualizer

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAnswers((prev) => {
          const newAnswers = [...prev];
          newAnswers[currentSpeakingIndex] = audioBlob;
          return newAnswers;
        });
      };

      mediaRecorder.start();
      setRecordingState('recording');
    } catch (err) {
      alert('Could not start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      cleanupAudioAnalysis(); // Stop visualizer
      setRecordingState('recorded');
    }
  };

  const playPreview = () => {
    if (answers[currentSpeakingIndex] && previewAudioRef.current) {
        const url = URL.createObjectURL(answers[currentSpeakingIndex]);
        previewAudioRef.current.src = url;
        previewAudioRef.current.play();
        
        // Cleanup URL after playing to avoid memory leaks
        previewAudioRef.current.onended = () => {
            URL.revokeObjectURL(url);
        };
    }
  };

  const handleNext = async () => {
    if (currentSpeakingIndex < speakings.length - 1) {
      setCurrentSpeakingIndex(prev => prev + 1);
      setAudioState('idle');
      setRecordingState('idle');
    } else {
      try {
        const userDataId = localStorage.getItem('userDataId');
        if (!userDataId) {
          alert('User data not found. Please register first.');
          router.push(`/test/${id}`);
          return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('userDataId', userDataId);

        let hasAnswers = false;
        speakings.forEach((speaking, i) => {
          if (answers[i]) {
            hasAnswers = true;
            formData.append('speakingIds', speaking.id.toString());
            formData.append('audios', answers[i], `speaking_${speaking.id}.webm`);
          }
        });

        // Even if no answers (e.g., they skipped), we might just navigate away
        if (hasAnswers) {
          const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/history/speaking`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          if (!res.data.success) {
             throw new Error(res.data.message);
          }
        }
        
        router.push(`/test/${id}/score?userId=${userDataId}`);
      } catch (err: any) {
         console.error('Error submitting speaking test:', err);
         alert('Failed to submit speaking test: ' + (err.response?.data?.message || err.message));
         setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E3F2FD] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#1877F2]" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#E3F2FD] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button onClick={() => router.push('/')} className="bg-[#1877F2] text-white px-6 py-2 rounded-full font-medium">Back Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#DEEDF8] relative flex flex-col font-sans overflow-hidden">
      {/* Background Chevrons SVG Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-20 flex justify-between overflow-hidden">
        {/* Left Chevrons */}
        <div className="h-full flex items-center -ml-20">
             <svg width="400" height="600" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                {[...Array(8)].map((_, i) => (
                    <path key={i} d={`M${0} ${0 - i*40} L${300 + i*10} 300 L${0} ${600 + i*40}`} stroke="#0056b3" strokeWidth="1.5" />
                ))}
            </svg>
        </div>
        {/* Right Chevrons */}
        <div className="h-full flex items-center -mr-20">
             <svg width="400" height="600" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                {[...Array(8)].map((_, i) => (
                    <path key={i} d={`M${400} ${0 - i*40} L${100 - i*10} 300 L${400} ${600 + i*40}`} stroke="#0056b3" strokeWidth="1.5" />
                ))}
            </svg>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 w-full bg-white border-t-[3px] border-blue-600 shadow-[0_2px_10px_rgba(0,0,0,0.05)] h-16 flex items-center justify-center">
        <div className="flex items-center">
          {/* Mock EF SET Logo or COBA TEST */}
          <span className="text-2xl font-black italic tracking-tighter text-[#2D3748]">COBA</span>
          <span className="text-2xl font-light tracking-[0.2em] text-[#A0AEC0] ml-1">TEST</span>
        </div>
      </header>

      {/* Main Content */}
      {view === 'introduction' && (
        <main className="relative z-10 flex-grow flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden flex flex-col">
            
            {/* Top Title Section */}
            <div className="pt-12 pb-10 px-8 text-center">
              <h1 className="text-[34px] font-bold text-[#1A202C] mb-3">Speaking</h1>
              <p className="text-[17px] text-[#4A5568] font-medium">You are about to start the speaking section.</p>
            </div>

            {/* Middle Light Blue Banner */}
            <div className="bg-[#F4F9FF] py-10 flex flex-col items-center border-y border-[#E2E8F0]">
              {/* Animated Soundwave Mock Icon */}
              <div className="flex items-center gap-1.5 h-12 mb-5 opacity-90">
                <div className="w-1 bg-[#1877F2] rounded-full h-4"></div>
                <div className="w-1 bg-[#1877F2] rounded-full h-6"></div>
                <div className="w-1 bg-[#1877F2] rounded-full h-10"></div>
                <div className="w-1 bg-[#1877F2] rounded-full h-6"></div>
                <div className="w-1 bg-[#1877F2] rounded-full h-8"></div>
                <div className="w-1 bg-[#1877F2] rounded-full h-4"></div>
                <div className="w-1 bg-[#1877F2] rounded-full h-10"></div>
                <div className="w-1 bg-[#1877F2] rounded-full h-5"></div>
                <div className="w-1 bg-[#1877F2] rounded-full h-8"></div>
              </div>
              <h3 className="text-[#2D3748] font-medium text-[16px] mb-1">Speaking</h3>
              <p className="text-[#1A202C] font-extrabold text-[15px]">{totalTimer} mins</p>
            </div>

            {/* Bottom Instructions Section */}
            <div className="p-12 pb-14 bg-white flex flex-col items-center">
              <ul className="space-y-6 max-w-xl self-center w-full px-4 mb-14">
                <li className="flex items-start gap-4">
                  <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[#2D3748] shrink-0"></div>
                  <p className="text-[15px] leading-[1.6] text-[#2D3748] font-medium">
                    On the next screen, you will be asked to authorize your microphone. We need access to your microphone to record your answers.
                  </p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[#2D3748] shrink-0"></div>
                  <p className="text-[15px] leading-[1.6] text-[#2D3748] font-medium">
                    Make sure you are in a quiet place so your recordings are clear. Use the practice question to check your recording levels.
                  </p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[#2D3748] shrink-0"></div>
                  <p className="text-[15px] leading-[1.6] text-[#2D3748] font-medium">
                    Once you submit a recording, you cannot go back.
                  </p>
                </li>
              </ul>

              <button 
                onClick={handleStart}
                className="bg-[#1877F2] hover:bg-[#166FE5] text-white text-[15px] font-bold px-12 py-3 rounded-full transition-colors w-auto min-w-[140px]"
              >
                Start
              </button>
            </div>
          </div>
        </main>
      )}

      {view === 'microphone' && (
        <main className="relative z-10 flex-grow flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl px-10 py-16 text-center">
                <h2 className="text-[28px] font-bold text-[#1A202C] mb-4">Please allow access to your microphone</h2>
                <p className="text-[16px] text-[#4A5568] mb-10">For the speaking test, we need access to your microphone.</p>
                
                <div className="flex flex-col items-center">
                    <button 
                        onClick={handleAllowMicrophone}
                        className="bg-[#1877F2] hover:bg-[#166FE5] text-white text-[15px] font-bold px-10 py-3.5 rounded-full transition-colors mb-6"
                    >
                        Allow microphone
                    </button>
                    <button onClick={handleSkipTest} className="text-[#4A5568] hover:text-[#1A202C] text-[14px] underline font-medium">
                          Skip the speaking test
                    </button>
                </div>
            </div>
        </main>
      )}

      {view === 'microphone-test' && (
        <main className="relative z-10 flex-grow flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl px-10 py-12 text-center">
                <h2 className="text-[28px] font-bold text-[#1A202C] mb-4">Test your microphone</h2>
                <p className="text-[16px] text-[#4A5568] mb-8">Speak normally to see if your microphone is working.</p>
                
                {/* Volume Meter */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-full max-w-md h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200 mb-2">
                        <div 
                            className={`h-full transition-all duration-75 ${testVolume > 50 ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(100, (testVolume / 100) * 100)}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Input Level</p>
                </div>

                {/* Recorder Test */}
                <div className="bg-slate-50 rounded-2xl p-8 mb-10 border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-6">Recording Preview</h3>
                    <div className="flex items-center justify-center gap-6">
                        {!isTestRecording ? (
                            <button 
                                onClick={startTestRecording}
                                className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                            >
                                <Mic size={28} />
                            </button>
                        ) : (
                            <button 
                                onClick={stopTestRecording}
                                className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg animate-pulse"
                            >
                                <Square size={28} fill="currentColor" />
                            </button>
                        )}

                        <div className="h-10 w-px bg-slate-200"></div>

                        <button 
                            onClick={playTestRecording}
                            disabled={!testAudioUrl}
                            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${testAudioUrl ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                        >
                            <Play size={28} fill={testAudioUrl ? "currentColor" : "none"} className="ml-1" />
                        </button>
                    </div>
                    {testAudioUrl && (
                        <p className="mt-4 text-xs font-bold text-green-600 flex items-center justify-center gap-1">
                            <Check size={14} /> Recording ready. Play it back to check quality.
                        </p>
                    )}
                    <audio ref={testAudioRef} src={testAudioUrl || undefined} className="hidden" />
                </div>
                
                <div className="flex flex-col items-center">
                    <button 
                        onClick={handleContinueToTest}
                        className="bg-[#1877F2] hover:bg-[#166FE5] text-white text-[15px] font-bold px-12 py-3.5 rounded-full transition-colors mb-4 shadow-lg shadow-blue-200"
                    >
                        Looks good, continue
                    </button>
                    <button 
                        onClick={() => {
                            cleanupAudioAnalysis();
                            setView('microphone');
                        }} 
                        className="text-[#4A5568] hover:text-[#1A202C] text-[14px] font-medium"
                    >
                         Back
                    </button>
                </div>
            </div>
        </main>
      )}
      {view === 'test' && speakings.length > 0 && (
        <div className="flex-grow flex flex-col relative z-10 w-full overflow-hidden">
          <audio 
            ref={audioRef} 
            src={speakings[currentSpeakingIndex]?.audioUrl ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${speakings[currentSpeakingIndex].audioUrl}` : undefined}
            onEnded={() => setAudioState('ended')}
            onError={() => {
               console.error("Failed to load audio source.");
               if (audioState === 'playing') {
                 alert("Audio file not found or corrupted. Proceeding to recording mode.");
                 setAudioState('ended');
               }
            }}
            className="hidden" 
          />
          {/* Sub-header Progress Bar */}
          <div className="h-14 bg-white border-b border-[#E2E8F0] px-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1877F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                <path d="M12 4v16M8 8v8M16 8v8M4 11v2M20 11v2"/>
              </svg>
              <span className="text-[15px] font-bold text-[#2D3748]">Speaking</span>
            </div>
            
            <div className="flex-grow max-w-2xl mx-8">
              <div className="h-2.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden flex">
                 <div className="h-full bg-[#1877F2] rounded-full" style={{ width: `${((currentSpeakingIndex + 1) / speakings.length) * 100}%` }}></div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-[15px] text-[#2D3748] tracking-mono">{formatTime(timeLeft)}</span>
              <PieChart size={18} fill="#1877F2" className="text-[#1877F2]" />
            </div>
          </div>

          {/* Main Test Content */}
          <main className="flex-grow flex flex-col items-center justify-center p-4 relative">
            <div className="z-10 text-center mb-10 max-w-3xl px-6">
              <h1 className="text-[40px] font-bold text-[#1A202C] mb-6 tracking-tight">Part 1 - Task {currentSpeakingIndex + 1}</h1>
              
              <div 
                className="prose prose-slate max-w-none text-xl leading-relaxed text-slate-700 font-medium mb-8"
                dangerouslySetInnerHTML={{ __html: speakings[currentSpeakingIndex]?.content || '' }}
              />

              <div className="bg-blue-50/50 rounded-2xl border border-blue-100 p-4 inline-block">
                <p className="text-[16px] text-blue-700 font-bold">
                  {speakings[currentSpeakingIndex].jenis === 'MENIRU' ? 'Play the recording, then repeat what you heard.' : 'Play the recording, then answer the question.'}
                </p>
              </div>
            </div>

            {/* Soundwave Visualizer */}
            <div className={`absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center gap-1.5 px-10 overflow-hidden pointer-events-none transition-all duration-500 ${recordingState === 'recording' ? 'bg-red-500/10 inset-y-0 opacity-100 scale-105' : 'opacity-40 scale-100'}`}>
              
              {/* Blinking REC indicator */}
              {recordingState === 'recording' && (
                <div className="absolute top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-red-600 text-white px-4 py-1.5 rounded-full text-sm font-bold animate-pulse shadow-lg z-30">
                  <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping"></div>
                  REC
                </div>
              )}

              {/* Generate dynamic looking bars */}
              {[...Array(60)].map((_, i) => {
                const distance = Math.abs(30 - i);
                const maxH = 220; // Increased max height
                const baseH = 12;
                
                // Calculate height based on volume and position
                const volumeEffect = (testVolume / 100) * (maxH - baseH) * 1.5; // Scaled up effect
                const distanceEffect = 1 - (distance / 32);
                const wave = recordingState === 'recording' || audioState === 'playing' 
                  ? Math.sin(Date.now() * 0.01 + i * 0.3) * 20 
                  : 0;
                
                let height = baseH + (volumeEffect * Math.max(0, distanceEffect)) + wave;
                if (distance > 28) height = baseH + (Math.random() * 8);
                
                return (
                  <div 
                    key={i} 
                    className={`w-2 rounded-full transition-all duration-75 ${recordingState === 'recording' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.7)]' : 'bg-[#1877F2]'}`} 
                    style={{ 
                      height: `${Math.max(baseH, height)}px`, 
                      opacity: Math.max(0.15, 1 - (distance / 35)) 
                    }}
                  ></div>
                );
              })}
            </div>

            {/* Action Button */}
            {recordingState === 'recorded' ? (
              <div className="flex flex-wrap justify-center gap-4 mt-4 z-20">
                <button 
                   onClick={playPreview}
                   className="bg-emerald-50 text-emerald-600 border-2 border-emerald-100 hover:bg-emerald-100 rounded-full px-8 h-12 flex items-center justify-center shadow-sm hover:scale-105 transition-transform text-[15px] font-bold"
                >
                    <Play size={18} fill="currentColor" className="mr-2" />
                    Pratinjau Suara
                </button>
                {(repeatCounts[currentSpeakingIndex] || 0) < 2 && (
                  <button 
                    onClick={() => {
                      setRepeatCounts(prev => ({
                        ...prev,
                        [currentSpeakingIndex]: (prev[currentSpeakingIndex] || 0) + 1
                      }));
                      setAudioState('idle');
                      setRecordingState('idle');
                      setTestVolume(0);
                    }}
                    className="bg-white text-[#1877F2] border-2 border-[#1877F2] hover:bg-[#F4F9FF] rounded-full px-8 h-12 flex items-center justify-center shadow-sm hover:scale-105 transition-transform text-[15px] font-bold"
                  >
                      Ulangi ({2 - (repeatCounts[currentSpeakingIndex] || 0)} sisa)
                  </button>
                )}
                <button 
                   onClick={handleNext}
                   className="bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-full px-8 h-12 flex items-center justify-center shadow-lg hover:scale-105 transition-transform text-[15px] font-bold"
                >
                    {currentSpeakingIndex < speakings.length - 1 ? 'Lanjut' : 'Selesai'}
                </button>
                <audio ref={previewAudioRef} className="hidden" />
              </div>
            ) : recordingState === 'recording' ? (
              <div className="relative z-20 mt-4">
                {/* Ripple Effect */}
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20 scale-150"></div>
                <div className="absolute inset-0 bg-red-400 rounded-full animate-pulse opacity-30 scale-125"></div>
                
                <button 
                   onClick={stopRecording}
                   className="relative bg-red-500 hover:bg-red-600 text-white rounded-full w-20 h-20 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-transform hover:scale-110 active:scale-95"
                >
                  <Square size={30} fill="currentColor" />
                </button>
              </div>
            ) : audioState === 'ended' ? (
               <button 
                 onClick={startRecording}
                 className="z-20 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-full w-20 h-20 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
               >
                 <Mic size={36} />
               </button>
            ) : audioState === 'playing' ? (
              <button 
                 disabled
                 className="z-20 bg-[#A0AEC0] text-white rounded-full w-20 h-20 flex items-center justify-center shadow-lg cursor-not-allowed"
              >
                 <Loader2 size={36} className="animate-spin" />
              </button>
            ) : (
              <button 
                 onClick={playAudio}
                 className="z-20 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-full w-20 h-20 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
              >
                <Play size={36} fill="currentColor" className="ml-2" />
              </button>
            )}
          </main>
        </div>
      )}
      
      {view === 'test' && speakings.length === 0 && !loading && (
        <div className="flex-grow flex items-center justify-center p-4">
           <p className="text-xl font-medium text-slate-500">No speaking tasks found in this section.</p>
        </div>
      )}

      {/* Floating Action Button (Speaker) */}
      <div className="absolute bottom-6 right-6">
        <button className="bg-[#1877F2] hover:bg-[#166FE5] text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center justify-center">
          <Volume2 size={24} />
        </button>
      </div>
      
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          background-color: #DEEDF8;
        }
      `}</style>
    </div>
  );
}
