'use client';

import React, { useEffect, useState, use } from 'react';
import { 
  Loader2, 
  AlertCircle, 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  BookOpen, 
  Headphones, 
  PenTool, 
  Mic, 
  CheckCircle2, 
  XCircle,
  Award,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import axios from 'axios';
import Breadcrumbs from '@/app/components/breadcrumbs';
import Link from 'next/link';

interface SoalHistory {
  id: number;
  answer: string;
  soalWritingId?: number; // For Writing
}

interface Question {
  id: number;
  question: string;
  options?: { id: number; text: string; isCorrect: boolean }[];
  AnswerWriting?: { id: number; answer: string }[]; // For Writing correct answers
  correctAnswer: string; // Keep for backward compatibility
  explanation?: string;
  jenis?: 'ESSAY' | 'SHORT_ANSWER';
}

interface SkillHistory {
  id: number;
  score: number;
  createdAt: string;
  reading?: { title: string; SoalReading: Question[] };
  listening?: { title: string; SoalListeing: Question[] };
  writing?: { title: string; jenis: 'ESSAY' | 'SHORT_ANSWER'; SoalWriting: Question[] };
  speaking?: { title: string; jenis: 'ESSAY' | 'SHORT_ANSWER'; SoalSpeaking: Question[] };
  soalHistories?: SoalHistory[];
  answer?: string; // For Writing/Speaking essays
}

interface UserDetail {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  readingHistories: SkillHistory[];
  listeningHistories: SkillHistory[];
  writingHistories: SkillHistory[];
  speakingHistories: SkillHistory[];
}

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'reading' | 'listening' | 'writing' | 'speaking'>('reading');
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  useEffect(() => {
    fetchUserDetail();
  }, [id]);

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/history/user?userDataId=${id}`);
      if (response.data.success) {
        setData(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch user details');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-20 flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="animate-spin mb-4 text-blue-600" size={48} />
        <p className="font-bold text-lg tracking-tight">Generating comprehensive report...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-5xl mx-auto py-20 px-4 text-center">
        <AlertCircle size={60} className="mx-auto mb-6 text-red-500" />
        <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tighter uppercase">Report Access Error</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">{error || 'Could not find the requested user data.'}</p>
        <Link 
          href="/dashboard/history/user"
          className="inline-flex items-center gap-2 px-8 py-3 bg-gray-950 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
        >
          <ArrowLeft size={18} />
          Go Back to List
        </Link>
      </div>
    );
  }

  const handleUpdateScore = async (historyId: number, newScore: number) => {
    try {
      const res = await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/history/writing/${historyId}/score`, {
        score: newScore
      });
      if (res.data.success) {
        // Refresh data to reflect change
        fetchUserDetail();
      }
    } catch (err) {
      console.error('Error updating score:', err);
      alert('Failed to update score');
    }
  };

  const handleUpdateSpeakingScore = async (historyId: number, newScore: number) => {
    try {
      const res = await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/history/speaking/${historyId}/score`, {
        score: newScore
      });
      if (res.data.success) {
        // Refresh data to reflect change
        fetchUserDetail();
      }
    } catch (err) {
      console.error('Error updating score:', err);
      alert('Failed to update score');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isAudioPath = (path: string | undefined) => {
    if (!path) return false;
    return path.startsWith('/uploads/userspeaking/') || path.endsWith('.webm') || path.endsWith('.mp3') || path.endsWith('.wav');
  };

  const getFullAudioUrl = (path: string) => {
    // If path already starts with http, return as is. Otherwise prepend API URL
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';
    return `${baseUrl}${path}`;
  };

  const getBandScore = (score: number, total: number) => {
    if (total === 0) return "0.0";
    const raw = (score / total) * 9;
    // Round to nearest 0.5
    const rounded = Math.round(raw * 2) / 2;
    return rounded.toFixed(1);
  };

  const calculateTotalScore = () => {
    let totalCorrect = 0;
    let totalQuestions = 0;

    data.readingHistories.forEach(h => {
      totalCorrect += h.score;
      totalQuestions += (h.reading?.SoalReading || []).length;
    });

    data.listeningHistories.forEach(h => {
      totalCorrect += h.score;
      totalQuestions += (h.listening?.SoalListeing || []).length;
    });

    data.writingHistories.forEach(h => {
      totalCorrect += h.score;
      if (h.writing?.jenis === 'ESSAY') {
        totalQuestions += (h.writing?.SoalWriting || []).length + 1;
      } else {
        totalQuestions += (h.writing?.SoalWriting || []).length;
      }
    });

    data.speakingHistories.forEach(h => {
      totalCorrect += h.score;
      totalQuestions += 1;
    });

    if (totalQuestions === 0) return "0";

    const percentage = (totalCorrect / totalQuestions) * 100;
    return Math.round(percentage).toString();
  };

  const tabs = [
    { id: 'reading', label: 'Reading', icon: BookOpen, count: data.readingHistories.length, color: 'emerald' },
    { id: 'listening', label: 'Listening', icon: Headphones, count: data.listeningHistories.length, color: 'blue' },
    { id: 'writing', label: 'Writing', icon: PenTool, count: data.writingHistories.length, color: 'amber' },
    { id: 'speaking', label: 'Speaking', icon: Mic, count: data.speakingHistories.length, color: 'purple' },
  ] as const;

  const renderSection = (skill: string) => {
    let histories: SkillHistory[] = [];
    if (skill === 'reading') histories = data.readingHistories;
    if (skill === 'listening') histories = data.listeningHistories;
    if (skill === 'writing') histories = data.writingHistories;
    if (skill === 'speaking') histories = data.speakingHistories;

    if (histories.length === 0) {
      return (
        <div className="py-20 text-center bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
          <p className="text-gray-400 font-medium italic">No submissions for this section yet.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {histories.map((h, idx) => {
          const isExpanded = expandedSection === h.id;
          const questions = (h.reading?.SoalReading || h.listening?.SoalListeing || h.writing?.SoalWriting || h.speaking?.SoalSpeaking || []).map(q => ({
            ...q,
            jenis: h.writing?.jenis || h.speaking?.jenis
          }));
          const title = h.reading?.title || h.listening?.title || h.writing?.title || h.speaking?.title || 'Untitled Assessment';
          const isSpeaking = skill === 'speaking';
          const displayTotal = isSpeaking ? 1 : (h.writing?.jenis === 'ESSAY' ? questions.length + 1 : questions.length);

          return (
            <div key={h.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
              <div 
                className={`p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer ${isExpanded ? 'bg-gray-50/50' : ''}`}
                onClick={() => setExpandedSection(isExpanded ? null : h.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Section {idx + 1}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="text-[10px] font-bold text-gray-400 italic">{formatDate(h.createdAt)}</span>
                  </div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase">{title}</h3>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Score</p>
                    <div className="text-2xl font-black text-blue-600 tracking-tighter">
                      {h.score} <span className="text-gray-300 mx-0.5">/</span> {displayTotal}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="p-8 border-t border-gray-100 animate-in slide-in-from-top-4 duration-300">
                  {/* Detailed Results for MCQs */}
                  {(skill === 'reading' || skill === 'listening') && questions.length > 0 && (
                    <div className="space-y-8">
                      {questions.map((q, qIdx) => {
                        const userAnswer = h.soalHistories?.[qIdx]?.answer;
                        // Find the correct answer text from options if available
                        const correctAnswerObj = q.options?.find(opt => opt.isCorrect);
                        const correctAnswerText = correctAnswerObj ? correctAnswerObj.text : q.correctAnswer;
                        
                        const isCorrect = userAnswer === correctAnswerText;
                        return (
                          <div key={q.id} className="relative pl-8 border-l-2 border-gray-100 pb-2">
                            <div className={`absolute -left-[5px] top-1 w-2 h-2 rounded-full ${isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <h4 className="text-sm font-bold text-gray-800 leading-relaxed max-w-2xl">
                                <span className="text-gray-400 mr-2">#{qIdx + 1}</span> {q.question}
                              </h4>
                              {isCorrect ? 
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black border border-emerald-100 uppercase tracking-wider"><CheckCircle2 size={12}/> Correct</span> :
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-[10px] font-black border border-red-100 uppercase tracking-wider"><XCircle size={12}/> Incorrect</span>
                              }
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                              <div className="p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">User's Answer</p>
                                <p className={`text-xs font-bold ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>{userAnswer || 'No Answer'}</p>
                              </div>
                              {!isCorrect && (
                                <div className="p-3 rounded-xl border border-gray-100 bg-emerald-50/30">
                                  <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Correct Answer</p>
                                  <p className="text-xs font-bold text-emerald-800">{correctAnswerText}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Essay / Short Answer Response */}
                  {(skill === 'writing' || skill === 'speaking') && (
                    <div className="space-y-6">
                      {questions.map((q, qIdx) => {
                         const qAnswer = (h.soalHistories?.find(sh => (sh as any).soalWritingId === q.id)?.answer || '').trim();
                         const correctAnswers = q.AnswerWriting || [];
                         const isShortAnswer = q.jenis === 'SHORT_ANSWER' || correctAnswers.length > 0;
                         const isCorrect = isShortAnswer && correctAnswers.some(ca => 
                           ca.answer.trim().toLowerCase() === qAnswer.toLowerCase()
                         );

                         return (
                           <div key={q.id} className="mb-8 last:mb-0 relative">
                              {isShortAnswer && (
                                <div className={`absolute -left-10 top-1 w-2 h-2 rounded-full ${isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                              )}
                              <h4 className="text-sm font-black text-gray-900 uppercase tracking-tighter mb-4 flex items-center justify-between gap-2">
                                 <div className="flex items-center gap-2">
                                   <div className="w-6 h-6 rounded-lg bg-gray-950 text-white flex items-center justify-center text-[10px]">{qIdx + 1}</div>
                                   {q.question}
                                 </div>
                                 {isShortAnswer && (
                                   isCorrect ? 
                                     <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black border border-emerald-100 uppercase tracking-wider shrink-0"><CheckCircle2 size={12}/> Correct</span> :
                                     <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-[10px] font-black border border-red-100 uppercase tracking-wider shrink-0"><XCircle size={12}/> Incorrect</span>
                                 )}
                              </h4>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-8">
                                <div className={`p-4 rounded-2xl border ${isShortAnswer ? (isCorrect ? 'bg-emerald-50/10 border-emerald-100' : 'bg-red-50/10 border-red-100') : 'bg-gray-50 border-gray-100'}`}>
                                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">User's Answer</p>
                                  <p className={`text-sm font-medium italic ${isShortAnswer ? (isCorrect ? 'text-emerald-800' : 'text-red-800') : 'text-gray-700'}`}>
                                    {qAnswer || 'No answer submitted.'}
                                  </p>
                                </div>
                                
                                {correctAnswers.length > 0 && (
                                  <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2">Correct Answer / Model</p>
                                    <div className="space-y-2">
                                      {correctAnswers.map((ca, caIdx) => (
                                        <p key={ca.id} className="text-sm font-bold text-emerald-800">
                                          {ca.answer}
                                        </p>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                           </div>
                         );
                      })}
                      
                      {h.answer && (
                        <div className="p-6 md:p-8 bg-blue-50/30 rounded-[2rem] border border-blue-100/50 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                              {skill === 'writing' ? <PenTool size={120} /> : <Mic size={120} />}
                          </div>
                          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">
                            {skill === 'speaking' ? 'Candidate Voice Recording' : 'Overall Submission / Essay Response'}
                          </p>
                          <div className="text-gray-800 leading-relaxed text-sm whitespace-pre-wrap font-medium">
                            {skill === 'speaking' && isAudioPath(h.answer) ? (
                              <div className="mt-2 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-blue-100/50 shadow-sm">
                                <audio controls className="w-full h-10 custom-audio">
                                  <source src={getFullAudioUrl(h.answer)} type="audio/webm" />
                                  <source src={getFullAudioUrl(h.answer)} type="audio/mpeg" />
                                  Your browser does not support the audio element.
                                </audio>
                                <div className="flex items-center gap-2 mt-3 text-[10px] text-blue-500 font-bold uppercase tracking-wider">
                                  <Clock size={12} />
                                  <span>Recorded Audio Response</span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-6">
                                <div className="p-4 bg-white/50 rounded-2xl border border-blue-100/30">
                                  {h.answer}
                                </div>
                                
                                {skill === 'writing' && h.writing?.jenis === 'ESSAY' && (
                                  <div className="flex items-center gap-4 pt-4 border-t border-blue-100/50">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">Manual Grading:</p>
                                    <button 
                                      onClick={() => handleUpdateScore(h.id, displayTotal)}
                                      className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${h.score === displayTotal ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white text-emerald-600 border border-emerald-100 hover:bg-emerald-50'}`}
                                    >
                                      <CheckCircle2 size={14} />
                                      Mark Correct ({displayTotal})
                                    </button>
                                    <button 
                                      onClick={() => handleUpdateScore(h.id, 0)}
                                      className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${h.score === 0 ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-white text-red-600 border border-red-100 hover:bg-red-50'}`}
                                    >
                                      <XCircle size={14} />
                                      Mark Incorrect (0)
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                            {skill === 'speaking' && (
                              <div className="flex items-center gap-4 pt-4 border-t border-blue-100/50 mt-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">Manual Grading:</p>
                                <button 
                                  onClick={() => handleUpdateSpeakingScore(h.id, 1)}
                                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${h.score === 1 ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white text-emerald-600 border border-emerald-100 hover:bg-emerald-50'}`}
                                >
                                  <CheckCircle2 size={14} />
                                  Mark Correct (1)
                                </button>
                                <button 
                                  onClick={() => handleUpdateSpeakingScore(h.id, 0)}
                                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${h.score === 0 ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-white text-red-600 border border-red-100 hover:bg-red-50'}`}
                                >
                                  <XCircle size={14} />
                                  Mark Incorrect (0)
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {!h.answer && (!h.soalHistories || h.soalHistories.length === 0) && (
                        <div className="py-10 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                           <p className="text-gray-400 text-xs italic">No answer content found for this section.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 pb-20">
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'History', href: '/dashboard/history' },
          { label: 'User List', href: '/dashboard/history/user' },
          { label: data.name, active: true },
        ]} 
      />

      <div className="flex flex-col lg:flex-row gap-8 mt-8">
        {/* Profile Sidebar */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 p-8 text-center sticky top-24">
            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-tr from-blue-600 to-indigo-700 text-white flex items-center justify-center text-4xl font-black mx-auto mb-6 shadow-2xl shadow-blue-500/20">
              {data.name[0].toUpperCase()}
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase leading-tight mb-2">{data.name}</h1>
            <p className="text-xs font-bold text-blue-600 mb-8 tracking-wider uppercase opacity-80">Candidate Report</p>
            
            <div className="space-y-4 text-left border-t border-gray-50 pt-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center shrink-0">
                  <Mail size={16} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Email Address</p>
                  <p className="text-xs font-bold text-gray-600 truncate">{data.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center shrink-0">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Phone Number</p>
                  <p className="text-xs font-bold text-gray-600">{data.phone || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center shrink-0">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Registration Date</p>
                  <p className="text-xs font-bold text-gray-600">{formatDate(data.createdAt).split(' pukul ')[0]}</p>
                </div>
              </div>
            </div>

            <div className="mt-10 p-6 bg-blue-600 rounded-[2rem] text-white shadow-xl shadow-blue-200">
               <Award size={32} className="mx-auto mb-3 opacity-80" />
               <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Overall Average Score</p>
               <h4 className="text-4xl font-black tracking-tighter">{calculateTotalScore()}</h4>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {/* Tabs */}
          <div className="flex gap-2 p-1.5 bg-gray-100/50 rounded-2xl mb-8 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setExpandedSection(null); }}
                className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-black transition-all ${
                  activeTab === tab.id 
                    ? 'bg-white text-gray-900 shadow-md ring-1 ring-black/5' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <tab.icon size={16} className={activeTab === tab.id ? `text-${tab.color}-600` : ''} />
                <span className="uppercase tracking-widest">{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] ${
                    activeTab === tab.id ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="animate-in fade-in duration-500">
            {renderSection(activeTab)}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #fcfcfc; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
