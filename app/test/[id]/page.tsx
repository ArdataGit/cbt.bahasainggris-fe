'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BookOpen, Headphones, Loader2, ArrowRight, CheckCircle2, PenTool, Mic, ChevronDown, Flag } from 'lucide-react';
import axios from 'axios';

interface Paket {
  id: number;
  name: string;
  description: string | null;
  readingCategories: any[];
  listeningCategories: any[];
  writingCategories: any[];
  speakingCategories: any[];
}

type Step = 'welcome' | 'registration';

interface FormData {
  fullName: string;
  email: string;
  confirmEmail: string;
  phone: string;
}

export default function PaketIntroductionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  
  const [paket, setPaket] = useState<Paket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    confirmEmail: '',
    phone: ''
  });
  
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchPaketDetails();
      fetchSettings();
    }
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

  const fetchPaketDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/pakets/${id}`);
      if (response.data.success) {
        setPaket(response.data.data);
      } else {
        throw new Error(response.data.message || 'Gagal memuat detail paket.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors: Partial<FormData> = {};
    if (!formData.fullName.trim()) errors.fullName = 'Nama wajib diisi';
    if (!formData.email.trim()) {
      errors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Format email tidak valid';
    }
    if (formData.email !== formData.confirmEmail) {
      errors.confirmEmail = 'Alamat email tidak cocok';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (formErrors[name as keyof FormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartTest = async () => {
    if (validateForm()) {
      try {
        setIsSubmitting(true);
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/data-users`, {
          ...formData,
          paketId: id
        });
        
        if (response.data.success) {
          // Store the User ID for history tracking
          const userDataId = response.data.data.id;
          localStorage.setItem('userDataId', userDataId.toString());

          // Determine the first available section based on priority: Reading > Listening > Writing > Speaking
          if (paket && paket.readingCategories && paket.readingCategories.length > 0) {
            router.push(`/test/${id}/reading`);
          } else if (paket && paket.listeningCategories && paket.listeningCategories.length > 0) {
            router.push(`/test/${id}/listening`);
          } else if (paket && paket.writingCategories && paket.writingCategories.length > 0) {
            router.push(`/test/${id}/writing`);
          } else if (paket && paket.speakingCategories && paket.speakingCategories.length > 0) {
            router.push(`/test/${id}/speaking`);
          } else {
            alert('Paket tidak memiliki modul tes.');
          }
        } else {
          throw new Error(response.data.message || 'Gagal menyimpan data.');
        }
      } catch (err: any) {
        alert(`Gagal: ${err.message || 'Terjadi kesalahan saat menyimpan data.'}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E3F2FD] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
          <p className="text-blue-900 font-medium">Memuat persiapan ujian...</p>
        </div>
      </div>
    );
  }

  if (error || !paket) {
    return (
      <div className="min-h-screen bg-[#E3F2FD] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Error</h2>
          <p className="text-slate-600 mb-6">{error || 'Paket tidak ditemukan.'}</p>
          <button 
            onClick={() => router.push('/test')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all"
          >
            Kembali ke Daftar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E3F2FD] relative overflow-hidden font-sans">
      {/* Geometric Background Patterns */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] border-[2px] border-blue-400 rotate-45 transform origin-center"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] border-[2px] border-blue-400 rotate-45 transform origin-center"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-300/0 to-blue-300/20 translate-x-[-50%] rotate-45 border-r border-t border-blue-300"></div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-l from-blue-300/0 to-blue-300/20 translate-x-[50%] rotate-45 border-l border-b border-blue-300"></div>
      </div>

      {/* Top Logo Bar */}
      <div className="absolute top-0 w-full h-16 bg-white border-b border-slate-100 flex items-center justify-center shadow-sm">
        {settings?.logoUrl ? (
          <img src={settings.logoUrl} alt="Logo" className="h-10 object-contain" />
        ) : (
          <div className="flex items-center gap-1">
            <span className="text-2xl font-black italic text-slate-800 tracking-tighter">COBA</span>
            <span className="text-2xl font-light text-slate-500 tracking-[0.2em] ml-1">TEST</span>
          </div>
        )}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen pt-24 pb-12 px-4">
        {currentStep === 'welcome' ? (
          /* Step 1: Welcome Introduction Card */
          <div className="bg-white rounded-[40px] shadow-2xl shadow-blue-900/10 w-full max-w-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-500">
            <div className="pt-12 pb-10 px-8 text-center bg-white">
              <h1 className="text-[32px] font-bold text-slate-900 mb-2 leading-tight">Selamat datang</h1>
              <p className="text-lg text-slate-600 font-medium">Anda akan segera memulai {paket.name}</p>
            </div>

            <div className="bg-[#F4F9FF]/80 py-10 px-8 border-y border-slate-50">
              <div className={`grid gap-12 mx-auto ${
                [
                  (paket.readingCategories?.length || 0) > 0, 
                  (paket.listeningCategories?.length || 0) > 0, 
                  (paket.writingCategories?.length || 0) > 0, 
                  (paket.speakingCategories?.length || 0) > 0
                ].filter(Boolean).length > 2 
                  ? 'grid-cols-2 md:grid-cols-4 max-w-2xl' : 'grid-cols-2 max-w-sm'
              }`}>
                {(paket.readingCategories?.length || 0) > 0 && (
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 mb-4 flex items-center justify-center">
                      <BookOpen size={48} className="text-blue-500 stroke-[1.5]" />
                    </div>
                    <h3 className="text-slate-800 font-medium mb-1">Membaca</h3>
                    <p className="text-slate-900 font-bold text-lg">{paket.readingCategories?.length} Reading</p>
                  </div>
                )}
                {(paket.listeningCategories?.length || 0) > 0 && (
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 mb-4 flex items-center justify-center">
                      <Headphones size={48} className="text-blue-500 stroke-[1.5]" />
                    </div>
                    <h3 className="text-slate-800 font-medium mb-1">Mendengarkan</h3>
                    <p className="text-slate-900 font-bold text-lg">{paket.listeningCategories?.length} Listening</p>
                  </div>
                )}
                {(paket.writingCategories?.length || 0) > 0 && (
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 mb-4 flex items-center justify-center">
                      <PenTool size={48} className="text-blue-500 stroke-[1.5]" />
                    </div>
                    <h3 className="text-slate-800 font-medium mb-1">Menulis</h3>
                    <p className="text-slate-900 font-bold text-lg">{paket.writingCategories?.length} Writing</p>
                  </div>
                )}
                {(paket.speakingCategories?.length || 0) > 0 && (
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 mb-4 flex items-center justify-center">
                      <Mic size={48} className="text-blue-500 stroke-[1.5]" />
                    </div>
                    <h3 className="text-slate-800 font-medium mb-1">Berbicara</h3>
                    <p className="text-slate-900 font-bold text-lg">{paket.speakingCategories?.length} Speaking</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-10 flex-grow overflow-y-auto custom-scrollbar">
              {settings?.testInstructions ? (
                <div 
                  className="prose prose-slate max-w-none text-[15px] leading-relaxed text-slate-800 font-medium tracking-tight"
                  dangerouslySetInnerHTML={{ __html: settings.testInstructions }}
                />
              ) : (
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0"></div>
                    <p className="text-[15px] leading-relaxed text-slate-800 font-medium tracking-tight">
                      Pastikan Anda memiliki waktu yang cukup untuk menyelesaikan seluruh tes sebelum memulai. Setelah Anda memulai tes, Anda tidak dapat memberhentikan waktu atau memulai ulang tes. Anda dapat beristirahat sejenak di antara bagian tes jika diperlukan. Istirahat ini juga dibatasi waktunya.
                    </p>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0"></div>
                    <p className="text-[15px] leading-relaxed text-slate-800 font-medium tracking-tight">
                      Anda hanya dapat mengikuti tes satu kali. Anda tidak dapat mengulang tes untuk berlatih.
                    </p>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0"></div>
                    <p className="text-[15px] leading-relaxed text-slate-800 font-medium tracking-tight">
                      Anda tidak akan kehilangan poin untuk jawaban yang salah atau melewatkan pertanyaan yang tidak Anda pahami.
                    </p>
                  </li>
                </ul>
              )}
            </div>

            <div className="px-10 pb-12 flex justify-center">
              <button 
                onClick={() => setCurrentStep('registration')}
                className="bg-[#2463EB] hover:bg-[#1D4ED8] text-white text-lg font-bold px-12 py-4 rounded-full shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-3 group"
              >
                Mulai
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: Registration / Certificate Configuration Form */
          <div className="bg-white rounded-[40px] shadow-2xl shadow-blue-900/10 w-full max-w-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="pt-12 pb-8 px-8 text-center bg-white">
              {/* <h1 className="text-3xl font-bold text-slate-900 mb-6 leading-tight">Konfigurasikan sertifikat Anda</h1> */}
              
              <div className="space-y-8 max-w-md mx-auto text-left">
                {/* Name Section */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-md font-bold text-slate-900 mb-1">Nama lengkap Anda</h3>
                    {/* <p className="text-sm font-medium text-slate-500 mb-4">Nama ini akan muncul di sertifikat COBA TEST Anda.</p> */}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="relative">
                      <input 
                        type="text" 
                        name="fullName"
                        placeholder="* Nama lengkap" 
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-4 rounded-xl border ${formErrors.fullName ? 'border-red-500 bg-red-50' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 font-medium text-slate-700 transition-all`}
                      />
                      {formErrors.fullName && <p className="text-xs text-red-500 mt-1 ml-1">{formErrors.fullName}</p>}
                    </div>
                  </div>
                </div>

                {/* Destination Section */}
                <div className="space-y-4 pt-4">
                  <div>
                    <h3 className="text-md font-bold text-slate-900 mb-1">Ke mana kami harus mengirimkan hasil Anda?</h3>
                    <p className="text-sm font-medium text-slate-500 mb-4">Periksa dengan teliti - ini tidak dapat diubah di lain waktu</p>
                  </div>

                  <div className="space-y-3">
                    <div className="relative">
                      <input 
                        type="email" 
                        name="email"
                        placeholder="* Email" 
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-4 rounded-xl border ${formErrors.email ? 'border-red-500 bg-red-50' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 font-medium text-slate-700 transition-all`}
                      />
                      {formErrors.email && <p className="text-xs text-red-500 mt-1 ml-1">{formErrors.email}</p>}
                    </div>
                    <div className="relative">
                      <input 
                        type="email" 
                        name="confirmEmail"
                        placeholder="* Konfirmasi alamat email" 
                        value={formData.confirmEmail}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-4 rounded-xl border ${formErrors.confirmEmail ? 'border-red-500 bg-red-50' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 font-medium text-slate-700 transition-all`}
                      />
                      {formErrors.confirmEmail && <p className="text-xs text-red-500 mt-1 ml-1">{formErrors.confirmEmail}</p>}
                    </div>
                    
                    {/* Phone Number Input with simulated country dropdown */}
                    <div className="flex gap-2">
                       <div className="flex items-center gap-2 px-3 py-4 bg-slate-50 border border-slate-300 rounded-xl cursor-default">
                         <div className="w-5 h-3.5 bg-[#FF0000] relative border border-slate-200">
                           <div className="absolute bottom-0 w-full h-1/2 bg-white"></div>
                         </div>
                         <span className="text-sm font-bold text-slate-600">+62</span>
                         <ChevronDown size={14} className="text-slate-400" />
                       </div>
                       <input 
                        type="tel" 
                        name="phone"
                        placeholder="Nomor ponsel (opsional)" 
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="flex-grow px-4 py-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 font-medium text-slate-700 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-10 pb-16 pt-8 flex flex-col items-center gap-4">
              <button 
                onClick={handleStartTest}
                disabled={isSubmitting}
                className={`${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#2463EB] hover:bg-[#1D4ED8]'} text-white text-lg font-bold px-16 py-4 rounded-full shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-95 group flex items-center gap-3`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Menyimpan...
                  </>
                ) : (
                  'Lanjutkan'
                )}
              </button>
              <button 
                onClick={() => setCurrentStep('welcome')}
                className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Kembali
              </button>
            </div>
          </div>
        )}

        {/* Footer Credit */}
        {/* <div className="mt-8 opacity-30 pointer-events-none">
          <p className="text-slate-900 font-medium text-sm">Powered by EduTest Platform</p>
        </div> */}
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
      `}</style>
    </div>
  );
}
