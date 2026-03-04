'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Loader2, Trophy, ArrowRight, CheckCircle, XCircle, BarChart3, RotateCcw } from 'lucide-react';

interface HistoryData {
    name: string;
    readingHistories: any[];
    listeningHistories: any[];
    writingHistories: any[];
    speakingHistories: any[];
}

export default function ScorePage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id;
    
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<HistoryData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const userDataId = localStorage.getItem('userDataId');
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
    }, [id]);

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
    const readingPercentage = totalReadingQuestions > 0 ? Math.round((totalReadingCorrect / totalReadingQuestions) * 100) : 0;

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
                            <p className="text-blue-100 text-sm font-bold uppercase tracking-widest mb-1">Overall Percentage</p>
                            <div className="text-6xl font-black mb-1">{readingPercentage}%</div>
                            <div className="flex items-center justify-center gap-1.5 text-blue-100/80 text-sm">
                                <CheckCircle size={14} />
                                <span>{totalReadingCorrect} correct answers</span>
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
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
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

                    {/* Placeholder for other sections */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {['Listening', 'Writing', 'Speaking'].map((section) => {
                            const histories = section === 'Listening' ? history.listeningHistories :
                                             section === 'Writing' ? history.writingHistories :
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
