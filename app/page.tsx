"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, ChevronDown } from "lucide-react";

export default function Home() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md z-50 px-6 md:px-12 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-8">
          <div className="flex items-center">
            <span className="text-3xl font-black italic text-slate-900 tracking-tighter">EF</span>
            <span className="text-3xl font-light text-slate-500 tracking-[0.3em] ml-2">SET</span>
          </div>
          <div className="hidden lg:flex items-center gap-8 text-[15px] font-bold text-slate-600">
            <div 
              className="relative group cursor-pointer"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <div className="flex items-center gap-1 hover:text-blue-600 transition-colors py-8">
                Tes kami <ChevronDown size={14} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              
              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-16 left-0 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link href="/test/1" className="block px-6 py-3 hover:bg-slate-50 text-slate-800 hover:text-blue-600 transition-colors">
                    2 Skill
                  </Link>
                  <Link href="/test/2" className="block px-6 py-3 hover:bg-slate-50 text-slate-800 hover:text-blue-600 transition-colors border-t border-gray-50">
                    4 Skill
                  </Link>
                </div>
              )}
            </div>
            <Link href="#" className="hover:text-blue-600 transition-colors">Untuk perusahaan</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">Sertifikasi</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">CEFR</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">Tentang kami</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <Link href="/dashboard" className="hidden sm:block text-[15px] font-bold text-slate-900 hover:text-blue-600 px-4">Dashboard</Link>
           <Link href="/test/1" className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-[15px] font-bold hover:bg-slate-800 transition-all">
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
            <h1 className="text-5xl md:text-[64px] font-black leading-[1.1] mb-8 tracking-tighter text-slate-900">
              Tes bahasa Inggris gratis yang berstandar dan pertama di dunia
            </h1>
            <p className="text-xl md:text-2xl font-medium text-slate-700 mb-12 max-w-xl leading-relaxed">
              Ikuti EF Standard English Test dan dapatkan penilaian dari kecakapan membaca dan mendengarmu. Kapan pun dan di mana pun.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/test/2" 
                className="bg-slate-900 text-white px-10 py-5 rounded-full text-lg font-black shadow-xl shadow-slate-900/10 hover:scale-105 active:scale-95 transition-all text-center"
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
                alt="Woman with headphones taking English test"
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

            {/* Certificate Overlap */}
           

            {/* Decorative Bubbles */}
            <div className="absolute top-10 -left-10 w-20 h-20 bg-white/10 backdrop-blur-md rounded-full -z-10 animate-pulse"></div>
            <div className="absolute bottom-20 left-10 w-32 h-32 bg-white/5 backdrop-blur-md rounded-full -z-10 animate-bounce delay-700" style={{ animationDuration: '4s' }}></div>
          </div>
        </div>
      </main>

      {/* Features Footer (Brief) */}
      <footer className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
           <div>
              <div className="text-3xl font-black italic text-slate-300 mb-4 opacity-50">EF SET</div>
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
