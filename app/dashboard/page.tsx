'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, Sparkles, Package, BookOpen, Clock, Zap } from 'lucide-react';

function DashboardContent() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const tripayRef = searchParams.get('tripay_reference');
  const merchantRef = searchParams.get('tripay_merchant_ref');
  const [showStatus, setShowStatus] = useState(!!tripayRef);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }
  }, []);

  const stats = user?.role === 'admin' ? [
    { label: 'Total Readings', value: '24', color: 'bg-blue-50 text-blue-700' },
    { label: 'Active Users', value: '143', color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Pending Reviews', value: '5', color: 'bg-amber-50 text-amber-700' },
  ] : [
    { label: 'Paket Aktif', value: '3', color: 'bg-blue-50 text-blue-700' },
    { label: 'Total Skor', value: '85%', color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Sisa Waktu', value: '12 Hari', color: 'bg-amber-50 text-amber-700' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-4 lg:p-0">
      {/* Tripay Status Alert */}
      {showStatus && (
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-[2rem] flex items-center justify-between gap-6 shadow-xl shadow-emerald-500/5 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="text-emerald-900 font-black uppercase italic tracking-tight">Pembayaran Sedang Diproses</h3>
              <p className="text-emerald-600/80 text-[10px] font-bold uppercase tracking-widest">ID TRANSAKSI: {merchantRef || tripayRef}</p>
            </div>
          </div>
          <button 
            onClick={() => setShowStatus(false)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-emerald-400 hover:text-emerald-600 transition-colors shadow-sm"
          >
            <CheckCircle2 size={20} />
          </button>
        </div>
      )}

      <div className="bg-white p-8 md:p-14 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden group min-h-[450px] flex flex-col justify-center">
        <div className="absolute top-0 right-0 p-12 opacity-[0.05] rotate-12 group-hover:rotate-0 transition-transform duration-1000">
           <Sparkles size={180} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
             <span className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.25em] rounded-full shadow-xl shadow-blue-200/50">
               {user?.role === 'admin' ? 'Administrator' : 'Student Member'}
             </span>
             {user?.role !== 'admin' && (
                <span className="px-4 py-1.5 bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.25em] rounded-full shadow-xl shadow-amber-200/50 flex items-center gap-1.5">
                  <Zap size={10} fill="currentColor" /> Pro
                </span>
             )}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6 uppercase italic leading-[1.1]">
            Selamat Datang, <br />
            <span className="text-blue-600">{user?.name || 'User'}</span>
          </h1>
          <p className="text-slate-500 max-w-xl font-medium leading-relaxed text-sm md:text-base">
            {user?.role === 'admin' 
              ? 'Kelola seluruh aspek platform dari sini. Pantau pengguna, materi, dan transaksi secara real-time untuk memastikan kualitas layanan.' 
              : 'Teruslah mengasah kemampuan bahasa Inggris Anda. Pilih paket latihan terbaru atau lihat statistik kemajuan di bawah ini.'}
          </p>
        </div>
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 relative z-10 w-full">
          {stats.map((stat, i) => (
            <div key={i} className={`${stat.color} rounded-[2.5rem] p-8 border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group/stat flex flex-col justify-between min-h-[140px]`}>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-60 mb-2 group-hover/stat:tracking-[0.35em] transition-all">{stat.label}</p>
              <div className="flex items-end justify-between">
                <p className="text-4xl font-black tracking-tighter">{stat.value}</p>
                <div className="w-8 h-8 rounded-full bg-white/40 flex items-center justify-center opacity-0 group-hover/stat:opacity-100 transition-opacity">
                   <Clock size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-between group cursor-pointer hover:border-blue-500 transition-all active:scale-[0.98]">
            <div className="flex items-center gap-8">
               <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg shadow-blue-500/5 group-hover:shadow-blue-500/20">
                  <Package size={28} />
               </div>
               <div>
                  <h4 className="font-black text-slate-900 uppercase italic tracking-tight text-xl">Latihan Terbaru</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-1 italic">Mulai asah kemampuanmu</p>
               </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
               <Sparkles size={20} />
            </div>
         </div>
         <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-between group cursor-pointer hover:border-indigo-500 transition-all active:scale-[0.98]">
            <div className="flex items-center gap-8">
               <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[1.5rem] flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg shadow-indigo-500/5 group-hover:shadow-indigo-500/20">
                  <BookOpen size={28} />
               </div>
               <div>
                  <h4 className="font-black text-slate-900 uppercase italic tracking-tight text-xl">Lihat History</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-1 italic">Pantau progres belajar</p>
               </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
               <Zap size={20} />
            </div>
         </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="p-20 text-center flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs animate-pulse">Initializing Portal...</p>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

function Loader2({ className, size }: { className?: string, size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
