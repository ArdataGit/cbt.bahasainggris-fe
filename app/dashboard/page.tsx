'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, Sparkles, Package, BookOpen, Clock, Zap } from 'lucide-react';
import api from '@/app/lib/api';

function DashboardContent() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [counts, setCounts] = useState({
    myPackages: 0,
    availablePackages: 0,
    totalUsers: 0
  });
  const [banners, setBanners] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const tripayRef = searchParams.get('tripay_reference');
  const merchantRef = searchParams.get('tripay_merchant_ref');
  const [showStatus, setShowStatus] = useState(!!tripayRef);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        fetchStats(parsedUser);
        fetchBanners();
        fetchHistory();
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/history/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        const allData = response.data.data;
        const recentData = allData.slice(0, 5).map((item: any, index: number) => ({
          ...item,
          urutan: allData.length - index
        }));
        setHistory(recentData);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const getScoreSummary = (item: any) => {
    const reading = item.readingHistories.length > 0 ? 
      item.readingHistories.reduce((acc: number, rh: any) => acc + rh.score, 0) : null;
    const listening = item.listeningHistories.length > 0 ? 
      item.listeningHistories.reduce((acc: number, lh: any) => acc + lh.score, 0) : null;
    const writing = item.writingHistories.length > 0 ? 
      item.writingHistories.reduce((acc: number, wh: any) => acc + wh.score, 0) : null;
    const speaking = item.speakingHistories.length > 0 ? 
      item.speakingHistories.reduce((acc: number, sh: any) => acc + sh.score, 0) : null;

    return { reading, listening, writing, speaking };
  };

  const fetchBanners = async () => {
    try {
      const response = await api.get('/banners');
      if (response.data.success) {
        setBanners(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch banners:', error);
    }
  };

  const fetchStats = async (userData: any) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      const [resPaketPembelians, resUserPurchases, resDataUsers] = await Promise.all([
        api.get('/paket-pembelians', config),
        api.get('/paket-pembelians/user', config),
        api.get('/data-users/count', config)
      ]);

      setCounts({
        availablePackages: resPaketPembelians.data.success ? resPaketPembelians.data.data.length : 0,
        myPackages: resUserPurchases.data.success ? resUserPurchases.data.data.length : 0,
        totalUsers: resDataUsers.data.success ? resDataUsers.data.data : 0
      });
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    }
  };

  const stats = user?.role === 'admin' ? [
    { label: 'Total Readings', value: '24', color: 'bg-blue-50 text-blue-700' },
    { label: 'Active Users', value: counts.totalUsers.toString(), color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Pending Reviews', value: '5', color: 'bg-amber-50 text-amber-700' },
  ] : [
    { label: 'Paket Pembelian Saya', value: counts.myPackages.toString(), color: 'bg-blue-50 text-blue-700' },
    { label: 'Paket Tersedia', value: counts.availablePackages.toString(), color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Jumlah Siswa', value: counts.totalUsers.toString(), color: 'bg-amber-50 text-amber-700' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-4 lg:p-0">
      {/* Moving the status alert up if needed, but keeping original flow */}
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

      {/* Small Greeting Section Above Banner */}
      <div className="relative px-4">
        <div className="flex items-center gap-2 mb-1">
           <span className="px-2.5 py-0.5 bg-blue-600 text-white text-[8px] font-black uppercase tracking-[0.1em] rounded-full shadow-md shadow-blue-200/50">
             {user?.role === 'admin' ? 'Administrator' : 'Student'}
           </span>
           <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight uppercase italic leading-tight">
            Selamat Datang, <span className="text-blue-600">{user?.name || 'User'}</span>
          </h2>
        </div>
      </div>

      {/* Sliding Banner Section */}
      {banners.length > 0 && (
        <div className="relative w-full aspect-[16/9] md:aspect-[3/1] rounded-[2rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-50 group">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/banners/${banner.imageUrl}`}
                alt={`Banner ${index + 1}`}
                className="w-full h-full object-cover transform transition-transform duration-[5s] scale-100 hover:scale-105"
              />
            </div>
          ))}

          {/* Slider Dots */}
          {banners.length > 1 && (
            <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1 md:h-1.5 transition-all duration-300 rounded-full ${
                    index === currentSlide ? 'w-6 md:w-8 bg-white shadow-lg' : 'w-1.5 md:w-2 bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bg-white p-6 md:p-14 rounded-[2rem] md:rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-[0.05] rotate-12 group-hover:rotate-0 transition-transform duration-1000 hidden md:block">
           <Sparkles size={180} />
        </div>
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 relative z-10 w-full">
          {stats.map((stat, i) => (
            <div key={i} className={`${stat.color} rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group/stat flex flex-col justify-between min-h-[120px] md:min-h-[140px]`}>
              <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.25em] opacity-60 mb-2 group-hover/stat:tracking-[0.3em] transition-all">{stat.label}</p>
              <div className="flex items-end justify-between">
                <p className="text-2xl md:text-4xl font-black tracking-tighter">{stat.value}</p>
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/40 flex items-center justify-center opacity-0 group-hover/stat:opacity-100 transition-opacity">
                   <Clock size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent History Section */}
      <div className="bg-white p-6 md:p-14 rounded-[2rem] md:rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden group">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
          <div>
            <h4 className="text-xl md:text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Aktivitas Terakhir</h4>
            <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] md:tracking-[0.15em] mt-1 italic">5 percobaan terbaru Anda</p>
          </div>
          <button 
            onClick={() => window.location.href = '/dashboard/history-user'}
            className="text-[10px] md:text-xs font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 underline underline-offset-4"
          >
            Lihat Semua
          </button>
        </div>

        <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0 scrollbar-hide">
          {history.length > 0 ? (
            <div className="min-w-[800px] lg:min-w-full">
              <table className="w-full text-left border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-slate-400">
                    <th className="px-4 md:px-6 pb-2">Aktivitas</th>
                    <th className="px-4 md:px-6 pb-2">Paket</th>
                    <th className="px-4 md:px-6 pb-2 text-center">Tanggal</th>
                    <th className="px-2 pb-2 text-center">R</th>
                    <th className="px-2 pb-2 text-center">L</th>
                    <th className="px-2 pb-2 text-center">W</th>
                    <th className="px-2 pb-2 text-center">S</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => {
                    const scores = getScoreSummary(item);
                    return (
                      <tr 
                        key={item.id} 
                        className="group bg-slate-50 hover:bg-white hover:shadow-2xl hover:shadow-blue-500/10 transition-all cursor-pointer"
                        onClick={() => window.location.href = `/dashboard/history-user/detail?paketId=${item.paketId}`}
                      >
                        <td className="px-4 md:px-6 py-3 md:py-4 rounded-l-[1rem] md:rounded-l-[1.5rem] border-y border-l border-slate-100 group-hover:border-blue-100">
                          <div className="flex items-center gap-3 md:gap-4">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                              <Clock size={16} />
                            </div>
                            <span className="font-black text-slate-900 uppercase italic tracking-tight text-xs md:text-base">Pengerjaan {item.urutan}</span>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 border-y border-slate-100 group-hover:border-blue-100">
                            <span className="font-bold text-slate-600 uppercase tracking-tighter text-[10px] md:text-xs block truncate max-w-[120px] md:max-w-[150px]">{item.paket?.name || 'Paket Soal'}</span>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 border-y border-slate-100 group-hover:border-blue-100 text-center">
                          <span className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </td>
                        {[
                          { v: scores.reading, c: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
                          { v: scores.listening, c: 'text-blue-700 bg-blue-50 border-blue-100' },
                          { v: scores.writing, c: 'text-amber-700 bg-amber-50 border-amber-100' },
                          { v: scores.speaking, c: 'text-purple-700 bg-purple-50 border-purple-100' }
                        ].map((sc, i) => (
                          <td key={i} className={`px-2 py-3 md:py-4 border-y border-slate-100 group-hover:border-blue-100 text-center ${i === 3 ? 'rounded-r-[1rem] md:rounded-r-[1.5rem] border-r' : ''}`}>
                            <div className={`inline-flex w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex-col items-center justify-center border transition-all ${sc.v !== null ? sc.c : 'bg-slate-100/40 text-slate-300 border-slate-100/50'}`}>
                              <span className="text-[10px] md:text-xs font-black tracking-tighter">{sc.v ?? '-'}</span>
                            </div>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-slate-400 text-sm font-medium italic">Belum ada riwayat pengerjaan soal.</p>
            </div>
          )}
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
