'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Loader2, 
  CreditCard, 
  ChevronRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  Zap,
  Clock,
  ShoppingCart
} from 'lucide-react';
import axios from 'axios';
import Breadcrumbs from '@/app/components/breadcrumbs';

interface PaketPembelian {
  id: number;
  name: string;
  price: number;
  label: string;
  description: string | null;
  duration: number;
  pakets: { id: number; name: string }[];
}

interface PaymentChannel {
  code: string;
  name: string;
  type: string;
  fee_merchant: { flat: number; percent: number };
  fee_customer: { flat: number; percent: number };
  total_fee: number;
  minimum_fee: number;
  maximum_fee: number;
  icon_url: string;
  active: boolean;
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [paket, setPaket] = useState<PaketPembelian | null>(null);
  const [channels, setChannels] = useState<PaymentChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [existingPending, setExistingPending] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [paketRes, channelsRes, historyRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/paket-pembelians/${id}`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tripay/channels`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/history/pembelian`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (paketRes.data.success) {
        setPaket(paketRes.data.data);
      }
      
      if (channelsRes.data.success) {
        setChannels(channelsRes.data.data);
      }

      if (historyRes.data.success) {
        const pending = historyRes.data.data.find((item: any) => 
          item.paketPembelianId === parseInt(id as string) && item.status === 'PENDING'
        );
        if (pending) {
          setExistingPending(pending);
          setSelectedChannel(pending.bank);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch checkout details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedChannel) {
      alert('Silakan pilih metode pembayaran terlebih dahulu.');
      return;
    }

    try {
      setRequesting(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/tripay/request`,
        {
          paketPembelianId: id,
          method: selectedChannel
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        // Redirect to Tripay checkout page (hosted checkout)
        window.location.href = response.data.data.checkout_url;
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal membuat pembayaran.');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
        <p className="text-gray-500 font-medium uppercase tracking-widest text-[10px]">Menyiapkan halaman pembayaran...</p>
      </div>
    );
  }

  if (error || !paket) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 uppercase italic mb-4">Oops! Terjadi Kesalahan</h2>
        <p className="text-slate-500 mb-8">{error || 'Paket tidak ditemukan.'}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors font-bold uppercase tracking-widest text-[10px]"
        >
          <ArrowLeft size={16} />
          Kembali
        </button>
        <div className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-widest text-[10px]">
          <ShieldCheck size={16} className="text-emerald-500" />
          Pembayaran Aman & Terenkripsi
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Payment Methods */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8 sm:p-10">
            {existingPending && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 flex items-center gap-3 text-amber-700 animate-in slide-in-from-top duration-500">
                <Clock size={20} className="shrink-0" />
                <div className="text-xs font-medium">
                  <span className="font-bold uppercase tracking-tight">Melanjutkan Pembayaran:</span> <br/>
                  Anda memiliki transaksi pending untuk paket ini. Silakan selesaikan atau ganti metode pembayaran.
                </div>
              </div>
            )}
            
            <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter mb-8 flex items-center gap-3">
              <CreditCard className="text-blue-600" />
              Pilih Metode <span className="text-blue-600">Pembayaran</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {channels.map((channel) => (
                <button
                  key={channel.code}
                  disabled={!channel.active}
                  onClick={() => setSelectedChannel(channel.code)}
                  className={`relative p-6 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-3 ${
                    selectedChannel === channel.code 
                      ? 'border-blue-500 bg-blue-50/30' 
                      : 'border-slate-100 hover:border-blue-200 bg-white'
                  } ${!channel.active ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                >
                  {selectedChannel === channel.code && (
                    <div className="absolute top-3 right-3 text-blue-500">
                      <CheckCircle2 size={20} />
                    </div>
                  )}
                  <img src={channel.icon_url} alt={channel.name} className="h-8 object-contain mb-2" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-700">{channel.name}</span>
                  {!channel.active && <span className="text-[8px] font-bold text-red-500 uppercase tracking-widest">Tidak Tersedia</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-900/20 sticky top-8">
            <h2 className="text-xl font-black uppercase italic tracking-widest mb-8 flex items-center gap-3">
              <ShoppingCart size={20} className="text-blue-400" />
              Ringkasan Order
            </h2>

            <div className="space-y-6 mb-8">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Paket</span>
                  <h3 className="font-black uppercase italic tracking-tight text-lg">{paket.name}</h3>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  paket.label === 'VIP' ? 'bg-purple-600 border-purple-400' :
                  paket.label === 'PREMIUM' ? 'bg-amber-600 border-amber-400' :
                  'bg-blue-600 border-blue-400'
                }`}>
                  {paket.label}
                </div>
              </div>

              <div className="flex items-center gap-4 py-4 border-y border-white/10">
                 <div className="flex items-center gap-2">
                   <Clock size={16} className="text-slate-400" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Durasi</span>
                 </div>
                 <span className="text-sm font-black uppercase italic">{paket.duration} Hari</span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                  <span>Harga Paket</span>
                  <span>Rp {paket.price.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                  <span>Biaya Layanan</span>
                  <span className="text-emerald-400 italic">Gratis</span>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="text-sm font-black uppercase tracking-widest">Total Bayar</span>
                  <span className="text-2xl font-black tracking-tighter text-blue-400">
                    Rp {paket.price.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            <button
              disabled={!selectedChannel || requesting}
              onClick={handleCheckout}
              className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-tighter text-lg transition-all active:scale-95 ${
                !selectedChannel || requesting 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/20'
              }`}
            >
              {requesting ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Memproses...
                </>
              ) : (
                <>
                  Bayar Sekarang
                  <ChevronRight size={24} />
                </>
              )}
            </button>

            <p className="mt-6 text-[10px] text-center text-slate-500 font-medium leading-relaxed">
              Dengan mengeklik "Bayar Sekarang", Anda menyetujui <br />
              <span className="text-slate-400 underline cursor-pointer">Syarat & Ketentuan Layanan</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
