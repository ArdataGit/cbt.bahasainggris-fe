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
        <div className="relative w-full aspect-[21/9] md:aspect-[3/1] rounded-[3.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-50 group">
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
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1.5 transition-all duration-300 rounded-full ${
                    index === currentSlide ? 'w-8 bg-white shadow-lg' : 'w-2 bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bg-white p-8 md:p-14 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-[0.05] rotate-12 group-hover:rotate-0 transition-transform duration-1000">
           <Sparkles size={180} />
        </div>
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 w-full">
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
