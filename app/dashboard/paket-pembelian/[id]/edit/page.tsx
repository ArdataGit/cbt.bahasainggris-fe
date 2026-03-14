'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Search,
  Loader2, 
  Package,
  ShoppingCart,
  XCircle,
  Plus,
  Trash2,
  Check
} from 'lucide-react';
import axios from 'axios';
import Breadcrumbs from '@/app/components/breadcrumbs';

interface Paket {
  id: number;
  name: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditPaketPembelianPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [availablePakets, setAvailablePakets] = useState<Paket[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    label: 'FREE',
    description: '',
    duration: '0',
    paketIds: [] as number[],
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for admin role
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
    } else {
      router.push('/login');
      return;
    }
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setFetchingData(true);
      const [paketsRes, detailRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/pakets`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/paket-pembelians/${resolvedParams.id}`)
      ]);

      if (paketsRes.data.success) {
        setAvailablePakets(paketsRes.data.data);
      }

      if (detailRes.data.success) {
        const data = detailRes.data.data;
        setFormData({
          name: data.name,
          price: data.price.toString(),
          label: data.label,
          description: data.description || '',
          duration: data.duration?.toString() || '0',
          paketIds: data.pakets?.map((p: any) => p.id) || [],
        });
      }
    } catch (err: any) {
      setError('Failed to fetch data.');
      console.error(err);
    } finally {
      setFetchingData(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePaket = (id: number) => {
    const currentIds = [...formData.paketIds];
    if (currentIds.includes(id)) {
      setFormData({ ...formData, paketIds: currentIds.filter(item => item !== id) });
    } else {
      setFormData({ ...formData, paketIds: [...currentIds, id] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.price || formData.paketIds.length === 0) {
      setError('Please fill in all fields and select at least one package.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        price: parseInt(formData.price),
      };

      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/paket-pembelians/${resolvedParams.id}`, payload);
      if (response.data.success) {
        router.push('/dashboard/paket-pembelian');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update package.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
        <p className="text-gray-500 font-medium">Loading paket data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Paket Pembelian', href: '/dashboard/paket-pembelian' },
          { label: 'Edit Paket', active: true },
        ]} 
      />

      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Paket Pembelian</h1>
          <p className="text-sm text-gray-500">Update bundle configurations and test package associations.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">
                Nama Paket Pembelian
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-black"
                placeholder="e.g., TOEFL & IELTS Bundle..."
                required
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-bold text-gray-700 mb-2">
                Harga (IDR)
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rp</div>
                <input
                  type="text"
                  id="price"
                  name="price"
                  value={formData.price ? parseInt(formData.price).toLocaleString('id-ID') : ''}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
                    setFormData({ ...formData, price: rawValue });
                  }}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-black"
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="label" className="block text-sm font-bold text-gray-700 mb-2">
                Label / Tier
              </label>
              <select
                id="label"
                name="label"
                value={formData.label}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold appearance-none bg-white text-black"
                required
              >
                <option value="FREE">FREE</option>
                <option value="PREMIUM">PREMIUM</option>
                <option value="VIP">VIP</option>
              </select>
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-bold text-gray-700 mb-2">
                Masa Aktif (Hari)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-black"
                  placeholder="0"
                  required
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Hari</div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-2">
                Deskripsi Paket
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-black"
                placeholder="Jelaskan apa saja keunggulan paket ini..."
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 mt-8">
            <div className="flex items-center justify-between mb-4">
               <div>
                 <h3 className="text-sm font-bold text-gray-900">Edit Isi Paket Test</h3>
                 <p className="text-xs text-gray-500 mt-0.5">Select test packages to include in this bundle.</p>
               </div>
               <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                 {formData.paketIds.length} Selected
               </span>
            </div>

            {/* Selected Packages Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.paketIds.map(id => {
                const paket = availablePakets.find(p => p.id === id);
                if (!paket) return null;
                return (
                  <div key={id} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-full text-xs font-bold shadow-sm animate-in zoom-in-95">
                    <span>{paket.name}</span>
                    <button 
                      type="button" 
                      onClick={() => togglePaket(id)}
                      className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )
              })}
              {formData.paketIds.length === 0 && (
                <span className="text-sm text-gray-400 italic">Belum ada paket yang dipilih...</span>
              )}
            </div>

            {/* Dropdown Selection */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <Search size={18} />
              </div>
              <select
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold appearance-none bg-white text-black"
                onChange={(e) => {
                  const id = parseInt(e.target.value);
                  if (id) togglePaket(id);
                  e.target.value = ""; // Reset dropdown
                }}
                defaultValue=""
              >
                <option value="" disabled>-- Cari & Pilih Paket Test --</option>
                {availablePakets
                  .filter(p => !formData.paketIds.includes(p.id))
                  .map(paket => (
                    <option key={paket.id} value={paket.id}>
                      {paket.name.toUpperCase()}
                    </option>
                  ))
                }
              </select>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 italic">* Klik nama paket di dropdown untuk menambahkan ke bundle.</p>
          </div>

          {error && (
            <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-2">
              <XCircle size={20} />
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-4 mt-12 border-t border-gray-100 pt-8 px-6 -mx-6 md:-mx-8">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Save size={20} />
              )}
              <span>Update Paket Pembelian</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
