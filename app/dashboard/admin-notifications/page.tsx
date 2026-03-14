'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  Megaphone,
  ShoppingBag,
  BookOpen,
  Loader2
} from 'lucide-react';
import api from '@/app/lib/api';
import Breadcrumbs from '@/app/components/breadcrumbs';

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('ADMIN');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      setStatus({ success: false, message: 'Judul dan pesan harus diisi.' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/notifications/broadcast', 
        { title, message, type },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setStatus({ success: true, message: response.data.message });
        setTitle('');
        setMessage('');
        setType('ADMIN');
      }
    } catch (error: any) {
      setStatus({ 
        success: false, 
        message: error.response?.data?.message || 'Gagal mengirim notifikasi.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const notificationTypes = [
    { value: 'ADMIN', label: 'Admin', icon: <Bell size={16} />, color: 'red' },
    { value: 'INFO', label: 'Informasi', icon: <Info size={16} />, color: 'blue' },
    { value: 'PURCHASE', label: 'Pembelian', icon: <ShoppingBag size={16} />, color: 'emerald' },
    { value: 'TEST_COMPLETION', label: 'Tes Selesai', icon: <BookOpen size={16} />, color: 'amber' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Broadcast Notifikasi', active: true },
        ]} 
      />

      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-4">
          <Megaphone className="text-blue-600" size={36} />
          Broadcast <span className="text-blue-600 text-stroke-thin">Notifikasi</span>
        </h1>
        <p className="text-slate-500 font-medium mt-2">Kirim pesan ke seluruh pengguna aplikasi secara instan.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 p-8 sm:p-10">
            <div className="space-y-6">
              {/* Type Selection */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Tipe Notifikasi</label>
                <div className="grid grid-cols-3 gap-3">
                  {notificationTypes.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value)}
                      className={`flex items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all font-bold text-xs ${
                        type === t.value 
                          ? `border-${t.color}-500 bg-${t.color}-50 text-${t.color}-700 shadow-sm shadow-${t.color}-500/10` 
                          : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      {t.icon}
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block tracking-tight">Judul Notifikasi</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Pemeliharaan Sistem Mendatang"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300"
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block tracking-tight">Isi Pesan</label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tuliskan pesan yang ingin disampaikan ke semua user..."
                  rows={5}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300 resize-none"
                />
              </div>

              {status && (
                <div className={`p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 border ${
                  status.success ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'
                }`}>
                  {status.success ? <CheckCircle2 size={18} className="mt-0.5" /> : <AlertCircle size={18} className="mt-0.5" />}
                  <div className="text-xs font-bold leading-relaxed">{status.message}</div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-tighter text-lg transition-all shadow-xl active:scale-95 ${
                  loading 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-slate-900 text-white hover:bg-blue-600 shadow-blue-600/20'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    Mengirim...
                  </>
                ) : (
                  <>
                    Kirim Ke Semua User
                    <Send size={20} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Column */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-900/20">
            <h3 className="font-black uppercase italic italic tracking-widest text-sm mb-6 flex items-center gap-3">
              <Info size={18} className="text-blue-400" />
              Petunjuk
            </h3>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black shrink-0 border border-white/5">1</div>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">Broadcast akan dikirimkan ke <span className="text-white font-bold italic">seluruh user</span> yang terdaftar di database.</p>
              </li>
              <li className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black shrink-0 border border-white/5">2</div>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">User akan melihat notifikasi ini di <span className="text-white font-bold italic">lonceng notifikasi</span> mereka.</p>
              </li>
              <li className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black shrink-0 border border-white/5">3</div>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">Gunakan judul yang ringkas dan pesan yang informatif agar menarik perhatian user.</p>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 rounded-[2rem] p-8 border border-blue-100">
             <div className="flex items-center gap-3 mb-3 text-blue-600">
               <Bell size={20} />
               <span className="font-black uppercase tracking-tight text-xs italic">Pratinjau Tampilan</span>
             </div>
             <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm opacity-60 scale-95 origin-top">
                <div className="flex items-center justify-between mb-1">
                  <div className="w-20 h-2 bg-slate-200 rounded-full"></div>
                  <div className="w-8 h-2 bg-slate-100 rounded-full"></div>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full mb-2"></div>
                <div className="w-3/4 h-3 bg-slate-100 rounded-full"></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
