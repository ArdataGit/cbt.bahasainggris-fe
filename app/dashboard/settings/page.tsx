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
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchBanners();
  }, []);

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
        </div>
      </div>
    </div>
  );
}
