'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Loader2, Trophy, ArrowRight, CheckCircle, XCircle, BarChart3, RotateCcw, BookOpen, Headphones } from 'lucide-react';

interface HistoryData {
    name: string;
    readingHistories: any[];
    listeningHistories: any[];
    writingHistories: any[];
    speakingHistories: any[];
}

import { useSearchParams } from 'next/navigation';

function ScoreContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = params.id;
    const urlUserId = searchParams.get('userId');
    
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<HistoryData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const localUserId = localStorage.getItem('userDataId');
        const userDataId = urlUserId || localUserId;

        if (!userDataId) {
            router.push(`/test/${id}`);
            return;
        }

        const fetchHistory = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/history/user?userDataId=${userDataId}`);
                if (response.data.success) {
                    setHistory(response.data.data);
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load results');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [id, urlUserId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                <p className="text-slate-600 font-medium animate-pulse">Calculating your score...</p>
            </div>
        );
    }

    if (error || !history) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-slate-100">
                    <XCircle className="text-red-500 mx-auto mb-4" size={64} />
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Oops! Something went wrong</h1>
                    <p className="text-slate-600 mb-6">{error || 'Could not retrieve your results.'}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-200"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Calculate Reading Totals
    const totalReadingQuestions = history.readingHistories.reduce((acc, rh) => acc + (rh.reading?.SoalReading?.length || 0), 0);
    const totalReadingCorrect = history.readingHistories.reduce((acc, rh) => acc + rh.score, 0);
    
    // Calculate Listening Totals
    const totalListeningQuestions = history.listeningHistories.reduce((acc, lh) => acc + (lh.listening?.SoalListeing?.length || 0), 0);
    const totalListeningCorrect = history.listeningHistories.reduce((acc, lh) => acc + lh.score, 0);

    // Overall Totals
    const totalQuestions = totalReadingQuestions + totalListeningQuestions;
    const totalCorrect = totalReadingCorrect + totalListeningCorrect;
    const overallPercentage = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    
    const readingPercentage = totalReadingQuestions > 0 ? Math.round((totalReadingCorrect / totalReadingQuestions) * 100) : 0;
    const listeningPercentage = totalListeningQuestions > 0 ? Math.round((totalListeningCorrect / totalListeningQuestions) * 100) : 0;

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-12 px-6">
            <div className="max-w-4xl mx-auto">
                {/* Header Card */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-200 mb-10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-12 opacity-10">
                        <Trophy size={200} />
                    </div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <span className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-sm font-semibold mb-4 inline-block">
                                Test Completed
                            </span>
                            <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">Great Work, {history.name}!</h1>
                            <p className="text-blue-100 text-lg opacity-90 max-w-md">
                                You've successfully finished the test. Here's a breakdown of your performance across all sections.
                            </p>
                        </div>
                        
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2rem] text-center min-w-[200px]">
                             <p className="text-blue-100 text-sm font-bold uppercase tracking-widest mb-1">Overall Accuracy</p>
                             <div className="text-6xl font-black mb-1">{overallPercentage}%</div>
                             <div className="flex items-center justify-center gap-1.5 text-blue-100/80 text-sm">
                                 <CheckCircle size={14} />
                                 <span>{totalCorrect} / {totalQuestions} correct</span>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Score Breakdown */}
                <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                    <BarChart3 className="text-blue-600" />
                    Section Breakdown
                </h2>

                <div className="grid grid-cols-1 gap-6">
                    {/* Reading Section Card */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                                    <BookOpen className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Reading Component</h3>
                                    <p className="text-slate-500 text-sm font-medium">{history.readingHistories.length} Passages Completed</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-black text-slate-900">{totalReadingCorrect}<span className="text-slate-300 mx-1">/</span>{totalReadingQuestions}</div>
                                <p className="text-emerald-500 font-bold text-sm tracking-wide">CORRECT ANSWERS</p>
                            </div>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                                <div>
                                    <span className="text-xs font-black inline-block py-1 px-2 uppercase rounded-full text-emerald-600 bg-emerald-100">
                                        Accuracy
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-black inline-block text-emerald-600">
                                        {readingPercentage}%
                                    </span>
                                </div>
                            </div>
                            <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-slate-100">
                                <div 
                                    style={{ width: `${readingPercentage}%` }}
                                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500 rounded-full transition-all duration-1000"
                                ></div>
                            </div>
                        </div>
                        
                        {/* Detail List */}
                        <div className="mt-8 space-y-4">
                            {history.readingHistories.map((rh, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-slate-400">
                                            {idx + 1}
                                        </div>
                                        <span className="font-bold text-slate-700 truncate max-w-[200px] md:max-w-md">{rh.reading.title}</span>
                                    </div>
                                    <span className="bg-white px-3 py-1 rounded-lg border border-slate-200 font-bold text-slate-900 text-sm shadow-sm">
                                        {rh.score} / {rh.reading.SoalReading.length}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Listening Section Card */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shadow-inner">
                                    <Headphones className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Listening Component</h3>
                                    <p className="text-slate-500 text-sm font-medium">{history.listeningHistories.length} Sections Completed</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-black text-slate-900">{totalListeningCorrect}<span className="text-slate-300 mx-1">/</span>{totalListeningQuestions}</div>
                                <p className="text-purple-500 font-bold text-sm tracking-wide">CORRECT ANSWERS</p>
                            </div>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                                <div>
                                    <span className="text-xs font-black inline-block py-1 px-2 uppercase rounded-full text-purple-600 bg-purple-100">
                                        Accuracy
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-black inline-block text-purple-600">
                                        {listeningPercentage}%
                                    </span>
                                </div>
                            </div>
                            <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-slate-100">
                                <div 
                                    style={{ width: `${listeningPercentage}%` }}
                                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500 rounded-full transition-all duration-1000"
                                ></div>
                            </div>
                        </div>
                        
                        {/* Detail List */}
                        <div className="mt-8 space-y-4">
                            {history.listeningHistories.map((lh, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-slate-400">
                                            {idx + 1}
                                        </div>
                                        <span className="font-bold text-slate-700 truncate max-w-[200px] md:max-w-md">{lh.listening.title}</span>
                                    </div>
                                    <span className="bg-white px-3 py-1 rounded-lg border border-slate-200 font-bold text-slate-900 text-sm shadow-sm">
                                        {lh.score} / {lh.listening.SoalListeing.length}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Placeholder for other sections */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {['Writing', 'Speaking'].map((section) => {
                            const histories = section === 'Writing' ? history.writingHistories :
                                             history.speakingHistories;
                            
                            const isCompleted = histories.length > 0;

                            return (
                                <div key={section} className={`p-6 rounded-[2rem] border transition-all ${
                                    isCompleted ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50/50 border-dashed border-slate-300 opacity-60'
                                }`}>
                                    <h4 className="font-black text-slate-400 uppercase tracking-widest text-xs mb-3">{section}</h4>
                                    {isCompleted ? (
                                         <div className="flex items-center justify-between">
                                            <span className="text-slate-900 font-bold">Completed</span>
                                            <CheckCircle className="text-emerald-500" size={20} />
                                         </div>
                                    ) : (
                                        <span className="text-slate-400 font-medium italic text-sm">No data available</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button 
                        onClick={() => router.push('/')}
                        className="w-full sm:w-auto px-10 py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-slate-200 group"
                    >
                        <RotateCcw size={20} className="group-hover:-rotate-45 transition-transform" />
                        Back to Dashboard
                    </button>
                    <button 
                        className="w-full sm:w-auto px-10 py-4 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                        onClick={() => window.print()}
                    >
                        Download Results
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                
                body {
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }
            `}</style>
        </div>
    );
}

export default function ScorePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                <p className="text-slate-600 font-medium animate-pulse">Loading scores...</p>
            </div>
        }>
            <ScoreContent />
        </Suspense>
    );
}
