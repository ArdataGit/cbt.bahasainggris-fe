"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Play, 
  ChevronDown, 
  Clock, 
  BookOpen, 
  Headphones, 
  PenTool, 
  Mic, 
  ArrowRight, 
  Package,
  Loader2
} from "lucide-react";
import axios from "axios";

interface Paket {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  isFree: boolean;
  _count: {
    readingCategories: number;
    listeningCategories: number;
    writingCategories: number;
    speakingCategories: number;
  };
}

interface LandingPaket {
  id: number;
  paketId: number;
  paket: Paket;
}

export default function Home() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [landingPakets, setLandingPakets] = useState<LandingPaket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLandingPakets = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/landing-pakets`);
        if (response.data.success) {
          setLandingPakets(response.data.data);
        }
      } catch (err: any) {
        console.error("Failed to fetch curated packages:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLandingPakets();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md z-50 px-6 md:px-12 flex items-center justify-between border-b border-gray-100 uppercase">
        <div className="flex items-center gap-8">
          <div className="flex items-center tracking-tighter">
            <span className="text-3xl font-black italic text-slate-900">CBT</span>
            <span className="text-3xl font-black italic text-blue-600 ml-1">INGGRIS</span>
          </div>
          <div className="hidden lg:flex items-center gap-8 text-[15px] font-bold text-slate-600">
            <div 
              className="relative group cursor-pointer"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <div className="flex items-center gap-1 hover:text-blue-600 transition-colors py-8 uppercase">
                Tes kami <ChevronDown size={14} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              
              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-16 left-0 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 animate-in fade-in slide-in-from-top-2 duration-200 lowercase">
                   {landingPakets.slice(0, 5).map(lp => (
                     <Link key={lp.id} href={`/test/${lp.paketId}`} className="block px-6 py-3 hover:bg-slate-50 text-slate-800 hover:text-blue-600 transition-colors border-b border-gray-50 last:border-0 truncate uppercase font-bold text-xs">
                        {lp.paket.name}
                     </Link>
                   ))}
                   <Link href="/test" className="block px-6 py-3 hover:bg-slate-50 text-blue-600 font-bold hover:text-blue-700 transition-colors uppercase text-xs">
                      Semua Tes
                   </Link>
                </div>
              )}
            </div>
            <Link href="#" className="hover:text-blue-600 transition-colors">Untuk perusahaan</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors font-black">Sertifikasi</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">CEFR</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">Tentang kami</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <Link href="/dashboard" className="hidden sm:block text-[15px] font-bold text-slate-900 hover:text-blue-600 px-4">Dashboard</Link>
           <Link href="/test" className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-[15px] font-bold hover:bg-slate-800 transition-all uppercase tracking-wide">
             Mulai Tes
           </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative flex-grow pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1ee2ca] via-[#35dd8b] to-[#12c4b5] h-[85vh] -z-10 rounded-b-[4rem] md:rounded-b-[8rem]"></div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-32 flex flex-col lg:flex-row items-center gap-16">
          {/* Left Content */}
          <div className="lg:w-1/2">
            <h1 className="text-5xl md:text-[64px] font-black leading-[1.1] mb-8 tracking-tighter text-slate-900 uppercase">
              Tes bahasa Inggris gratis yang berstandar
            </h1>
            <p className="text-xl md:text-2xl font-medium text-slate-700 mb-12 max-w-xl leading-relaxed">
              Ikuti EF Standard English Test dan dapatkan penilaian dari kecakapan membaca dan mendengarmu. Kapan pun dan di mana pun.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/test" 
                className="bg-slate-900 text-white px-10 py-5 rounded-full text-lg font-black shadow-xl shadow-slate-900/10 hover:scale-105 active:scale-95 transition-all text-center uppercase tracking-tight"
              >
                Tes bahasa Inggrismu sekarang
              </Link>
            </div>
          </div>

          {/* Right Visuals */}
          <div className="lg:w-1/2 relative">
            <div className="relative z-10 w-full max-w-md mx-auto aspect-[4/5] rounded-[3rem] overflow-hidden border-[12px] border-white/20 shadow-2xl">
              <Image 
                src="/images/hero-woman.png" 
                alt="Woman with headphones"
                fill
                className="object-cover"
                priority
              />
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/40 cursor-pointer hover:scale-110 transition-transform">
                   <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-[#12c4b5]">
                      <Play fill="currentColor" size={24} className="ml-1" />
                   </div>
                 </div>
              </div>
            </div>

            {/* Decorative Bubbles */}
            <div className="absolute top-10 -left-10 w-20 h-20 bg-white/10 backdrop-blur-md rounded-full -z-10 animate-pulse"></div>
            <div className="absolute bottom-20 left-10 w-32 h-32 bg-white/5 backdrop-blur-md rounded-full -z-10 animate-bounce delay-700" style={{ animationDuration: '4s' }}></div>
          </div>
        </div>

        {/* Curated Pakets Section */}
        <section className="bg-slate-50 py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 px-4">
              <div className="space-y-4">
                <span className="text-blue-600 font-black text-xs uppercase tracking-[0.3em]">Featured Tests</span>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                  Pilih Paket Ujian <span className="text-blue-600 italic">Gratis</span> Kami
                </h2>
                <p className="text-lg text-slate-500 max-w-2xl leading-relaxed font-medium">
                  Uji kemampuan bahasa Inggris Anda dengan standar internasional. Hasil instan dan akurat.
                </p>
              </div>
              <Link href="/test" className="hidden md:flex items-center gap-2 text-blue-600 font-black hover:gap-4 transition-all">
                 LIHAT SEMUA TES <ArrowRight size={20} />
              </Link>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500 px-4">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                <p className="text-slate-500 font-medium lowercase">Menyiapkan paket ujian terbaik untuk Anda...</p>
              </div>
            ) : landingPakets.length === 0 ? (
               <div className="text-center py-20 px-4 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                  <Package size={48} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-400 font-medium">Belum ada paket yang dikurasi.</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-4">
                {landingPakets.map((lp, index) => {
                  const item = lp.paket;
                  const totalItems = 
                    (item._count?.readingCategories || 0) + 
                    (item._count?.listeningCategories || 0) + 
                    (item._count?.writingCategories || 0) + 
                    (item._count?.speakingCategories || 0);

                  return (
                    <div 
                      key={lp.id} 
                      className="group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:border-blue-500/50 hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] transition-all duration-500 flex flex-col animate-in fade-in slide-in-from-bottom-8 shadow-sm"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="p-10 flex-grow">
                        <div className="flex items-start justify-between mb-8">
                          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-500 border border-blue-100/50">
                            <Package size={32} />
                          </div>
                          <div className="flex flex-col items-end gap-2">
                             <span className="text-[10px] font-black text-blue-600 px-4 py-1.5 bg-blue-50 rounded-full border border-blue-100 tracking-[0.2em]">
                               EN-CBT
                             </span>
                             {item.isFree && (
                                <span className="text-[10px] font-black text-amber-600 px-4 py-1.5 bg-amber-50 rounded-full border border-amber-100 tracking-[0.2em] uppercase">
                                  FREE
                                </span>
                             )}
                          </div>
                        </div>
                        
                        <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors mb-4 uppercase tracking-tighter leading-tight">
                          {item.name}
                        </h3>
                        
                        <p className="text-slate-500 text-[15px] leading-relaxed mb-10 line-clamp-2 italic font-medium">
                          {item.description || 'Uji kemampuan bahasa Inggris Anda dengan paket ujian komprehensif ini.'}
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { icon: BookOpen, color: 'text-emerald-500', label: 'Reading', count: item._count.readingCategories },
                            { icon: Headphones, color: 'text-purple-500', label: 'Listening', count: item._count.listeningCategories },
                            { icon: PenTool, color: 'text-cyan-500', label: 'Writing', count: item._count.writingCategories },
                            { icon: Mic, color: 'text-amber-500', label: 'Speaking', count: item._count.speakingCategories },
                          ].map((skill) => (
                            <div key={skill.label} className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 group-hover:bg-blue-50/20 transition-colors border border-transparent group-hover:border-blue-100/30">
                              <skill.icon size={18} className={skill.color} />
                              <div className="flex flex-col">
                                <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider font-sans">{skill.label}</span>
                                <span className="text-sm font-black text-slate-700 tracking-tight">{skill.count} MODUL</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="px-6 py-6 md:px-10 md:py-8 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest shrink-0">
                          <Clock size={16} className="text-slate-300" />
                          UPDATED: {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </div>
                        <Link 
                          href={`/test/${item.id}`}
                          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 font-black px-6 py-3 rounded-full transition-all shadow-xl active:scale-95 uppercase tracking-tighter text-xs ${
                            totalItems > 0 
                              ? 'bg-slate-900 hover:bg-blue-600 text-white shadow-slate-900/20 hover:shadow-blue-600/20' 
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                          onClick={(e) => totalItems === 0 && e.preventDefault()}
                        >
                          Mulai Tes
                          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-20 text-center md:hidden">
               <Link href="/test" className="inline-flex items-center gap-3 bg-white border-2 border-slate-900 text-slate-900 px-10 py-5 rounded-full text-lg font-black hover:bg-slate-900 hover:text-white transition-all uppercase tracking-tight">
                  Lihat Semua Tes
               </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Features Footer (Brief) */}
      <footer className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
           <div>
              <div className="text-3xl font-black italic text-slate-300 mb-4 opacity-50">TEST</div>
              <p className="text-slate-500 font-medium">Tes bahasa Inggris online tercanggih di dunia.</p>
           </div>
           {[
             { label: 'Tes Kami', links: ['EF SET Certificate', 'Tes cepat', 'Bagi Pelajar'] },
             { label: 'Organisasi', links: ['Sekolah', 'Perusahaan', 'Universitas'] },
             { label: 'Tentang', links: ['CEFR', 'Latar belakang', 'Bantuan'] },
           ].map((group) => (
             <div key={group.label}>
                <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-6">{group.label}</h4>
                <ul className="space-y-4">
                  {group.links.map(link => (
                    <li key={link}><Link href="#" className="text-slate-500 hover:text-blue-600 font-medium transition-colors">{link}</Link></li>
                  ))}
                </ul>
             </div>
           ))}
        </div>
      </footer>
    </div>
  );
}
