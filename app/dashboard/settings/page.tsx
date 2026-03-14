'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Save, Upload, X, Loader2, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import Editor from '@/app/components/editor';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [testInstructions, setTestInstructions] = useState('');
  const [readingInstructions, setReadingInstructions] = useState('');
  const [listeningInstructions, setListeningInstructions] = useState('');
  const [writingInstructions, setWritingInstructions] = useState('');
  const [speakingInstructions, setSpeakingInstructions] = useState('');
  const [banners, setBanners] = useState<any[]>([]);
  const [whatsappAdmins, setWhatsappAdmins] = useState<any[]>([]);
  const [newWA, setNewWA] = useState({ number: '', message: '' });
  const [editingWA, setEditingWA] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchBanners();
    fetchWhatsappAdmins();
  }, []);

  const fetchWhatsappAdmins = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/whatsapp-admins`);
      if (response.data.success) {
        setWhatsappAdmins(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch whatsapp admins:', error);
    }
  };

  const handleCreateWA = async () => {
    if (!newWA.number || !newWA.message) return;
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/whatsapp-admins`, newWA);
      if (response.data.success) {
        setWhatsappAdmins(prev => [response.data.data, ...prev]);
        setNewWA({ number: '', message: '' });
        setMessage({ type: 'success', text: 'Whatsapp Admin berhasil ditambahkan!' });
      }
    } catch (error) {
      console.error('Failed to create whatsapp admin:', error);
      setMessage({ type: 'error', text: 'Gagal menambahkan Whatsapp Admin.' });
    }
  };

  const handleUpdateWA = async () => {
    if (!editingWA.number || !editingWA.message) return;
    try {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/whatsapp-admins/${editingWA.id}`, editingWA);
      if (response.data.success) {
        setWhatsappAdmins(prev => prev.map(wa => wa.id === editingWA.id ? response.data.data : wa));
        setEditingWA(null);
        setMessage({ type: 'success', text: 'Whatsapp Admin berhasil diperbarui!' });
      }
    } catch (error) {
      console.error('Failed to update whatsapp admin:', error);
      setMessage({ type: 'error', text: 'Gagal memperbarui Whatsapp Admin.' });
    }
  };

  const handleDeleteWA = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus Whatsapp Admin ini?')) return;
    try {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/whatsapp-admins/${id}`);
      if (response.data.success) {
        setWhatsappAdmins(prev => prev.filter(wa => wa.id !== id));
        setMessage({ type: 'success', text: 'Whatsapp Admin berhasil dihapus!' });
      }
    } catch (error) {
      console.error('Failed to delete whatsapp admin:', error);
      setMessage({ type: 'error', text: 'Gagal menghapus Whatsapp Admin.' });
    }
  };

  const fetchBanners = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/banners`);
      if (response.data.success) {
        setBanners(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch banners:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/settings`);
      if (response.data.success && response.data.data) {
        setLogoUrl(response.data.data.logoUrl);
        setTestInstructions(response.data.data.testInstructions || '');
        setReadingInstructions(response.data.data.readingInstructions || '');
        setListeningInstructions(response.data.data.listeningInstructions || '');
        setWritingInstructions(response.data.data.writingInstructions || '');
        setSpeakingInstructions(response.data.data.speakingInstructions || '');
      }
    } catch (error: any) {
      console.error('Failed to fetch settings:', error);
      setMessage({ type: 'error', text: 'Gagal memuat pengaturan.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
        logoUrl,
        testInstructions,
        readingInstructions,
        listeningInstructions,
        writingInstructions,
        speakingInstructions
      });
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Pengaturan berhasil disimpan!' });
      }
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      setMessage({ type: 'error', text: 'Gagal menyimpan pengaturan.' });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setLogoUrl(response.data.data.url);
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert('Gagal mengupload logo.');
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = () => {
    setLogoUrl(null);
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingBanner(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/banners`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setBanners(prev => [response.data.data, ...prev]);
        setMessage({ type: 'success', text: 'Banner berhasil diupload!' });
      }
    } catch (error: any) {
      console.error('Banner upload failed:', error);
      alert('Gagal mengupload banner.');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleDeleteBanner = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus banner ini?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/banners/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setBanners(prev => prev.filter(b => b.id !== id));
        setMessage({ type: 'success', text: 'Banner berhasil dihapus!' });
      }
    } catch (error: any) {
      console.error('Delete banner failed:', error);
      alert('Gagal menghapus banner.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pengaturan Umum</h1>
          <p className="text-slate-500">Kelola logo aplikasi dan instruksi tes global.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || uploading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-50 shadow-lg shadow-blue-200"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Simpan Perubahan
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Logo Settings */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ImageIcon size={20} className="text-blue-500" />
              Logo Aplikasi
            </h2>
            
            <div className="space-y-4">
              {logoUrl ? (
                <div className="relative group">
                  <div className="w-full aspect-square rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden p-4">
                    <img src={logoUrl} alt="App Logo" className="max-w-full max-h-full object-contain" />
                  </div>
                  <button
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full aspect-square rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-blue-400 cursor-pointer transition-all group">
                  {uploading ? (
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                  ) : (
                    <>
                      <Upload className="text-slate-400 group-hover:text-blue-500 mb-2" size={32} />
                      <span className="text-sm font-medium text-slate-500 group-hover:text-blue-600">Upload Logo</span>
                    </>
                  )}
                  <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" disabled={uploading} />
                </label>
              )}
              <p className="text-xs text-slate-400 text-center italic">Format: PNG, JPG, SVG. Rekomendasi: Latar belakang transparan.</p>
            </div>
          </div>
        </div>

        {/* Instructions Settings */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full space-y-8">
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-4">Instruksi Tes Umum (Persiapan)</h2>
              <div className="space-y-4">
                <Editor
                  value={testInstructions}
                  onChange={setTestInstructions}
                  placeholder="Masukkan instruksi tes umum..."
                />
              </div>
            </div>

            <hr className="border-slate-100" />

            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-4">Instruksi Bagian Reading</h2>
              <div className="space-y-4">
                <Editor
                  value={readingInstructions}
                  onChange={setReadingInstructions}
                  placeholder="Masukkan instruksi reading..."
                />
              </div>
            </div>

            <hr className="border-slate-100" />

            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-4">Instruksi Bagian Listening</h2>
              <div className="space-y-4">
                <Editor
                  value={listeningInstructions}
                  onChange={setListeningInstructions}
                  placeholder="Masukkan instruksi listening..."
                />
              </div>
            </div>

            <hr className="border-slate-100" />

            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-4">Instruksi Bagian Writing</h2>
              <div className="space-y-4">
                <Editor
                  value={writingInstructions}
                  onChange={setWritingInstructions}
                  placeholder="Masukkan instruksi writing..."
                />
              </div>
            </div>

            <hr className="border-slate-100" />

            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-4">Instruksi Bagian Speaking</h2>
              <div className="space-y-4">
                <Editor
                  value={speakingInstructions}
                  onChange={setSpeakingInstructions}
                  placeholder="Masukkan instruksi speaking..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Banner Management */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ImageIcon size={20} className="text-blue-500" />
              Banner Dashboard
            </h2>
            
            <div className="space-y-4">
              <label className="flex flex-col items-center justify-center w-full py-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-blue-400 cursor-pointer transition-all group">
                {uploadingBanner ? (
                  <Loader2 className="animate-spin text-blue-500" size={24} />
                ) : (
                  <>
                    <Upload className="text-slate-400 group-hover:text-blue-500 mb-1" size={24} />
                    <span className="text-xs font-medium text-slate-500 group-hover:text-blue-600">Tambah Banner</span>
                  </>
                )}
                <input type="file" className="hidden" onChange={handleBannerUpload} accept="image/*" disabled={uploadingBanner} />
              </label>

              <div className="grid grid-cols-1 gap-4">
                {banners.map((banner) => (
                  <div key={banner.id} className="relative group rounded-xl border border-slate-200 overflow-hidden bg-slate-50 aspect-[21/9]">
                    <img src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/banners/${banner.imageUrl}`} alt="Banner" className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {banners.length === 0 && !uploadingBanner && (
                  <p className="text-center text-xs text-slate-400 italic py-4">Belum ada banner.</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 fill-white"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.414 0 .018 5.394 0 12.03a11.85 11.85 0 0 0 1.54 5.851L0 24l6.117-1.605a11.815 11.815 0 0 0 5.925 1.586h.005c6.632 0 12.028-5.396 12.033-12.03a11.85 11.85 0 0 0-3.353-8.541z"/>
                </svg>
              </div>
              Whatsapp Admin
            </h2>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Nomor WA (e.g. 62812...)"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black placeholder:text-slate-400"
                  value={editingWA ? editingWA.number : newWA.number}
                  onChange={(e) => editingWA ? setEditingWA({...editingWA, number: e.target.value}) : setNewWA({...newWA, number: e.target.value})}
                />
                <textarea
                  placeholder="Pesan otomatis..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-20 text-black placeholder:text-slate-400"
                  value={editingWA ? editingWA.message : newWA.message}
                  onChange={(e) => editingWA ? setEditingWA({...editingWA, message: e.target.value}) : setNewWA({...newWA, message: e.target.value})}
                />
                <div className="flex gap-2">
                  {editingWA ? (
                    <>
                      <button
                        onClick={handleUpdateWA}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
                      >
                        Perbarui
                      </button>
                      <button
                        onClick={() => setEditingWA(null)}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold py-2 rounded-lg transition-colors"
                      >
                        Batal
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleCreateWA}
                      className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
                    >
                      Tambah Admin
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3 mt-4">
                {whatsappAdmins.map((wa) => (
                  <div key={wa.id} className="p-3 border border-slate-200 rounded-xl bg-white shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-black">{wa.number}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingWA(wa)}
                          className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                        >
                          <Save size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteWA(wa.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-black leading-relaxed">{wa.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
