'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function WhatsAppButton() {
  const [admin, setAdmin] = useState<{ number: string; message: string } | null>(null);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/whatsapp-admins`);
        if (response.data.success && response.data.data.length > 0) {
          // Take the first admin found
          setAdmin(response.data.data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch WhatsApp admin for sticky button:', error);
      }
    };
    fetchAdmin();
  }, []);

  if (!admin) return null;

  const whatsappUrl = `https://wa.me/${admin.number}?text=${encodeURIComponent(admin.message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-[9999] group"
      aria-label="Chat via WhatsApp"
    >
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-green-500 rounded-full blur-md opacity-40 group-hover:opacity-60 transition-opacity"></div>
        
        {/* Button body */}
        <div className="relative flex items-center justify-center w-12 h-12 bg-green-500 rounded-full shadow-xl transition-transform duration-300 group-hover:scale-110 group-active:scale-95 border border-white/20">
          <svg
            viewBox="0 0 24 24"
            className="w-7 h-7 fill-white"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.414 0 .018 5.394 0 12.03a11.85 11.85 0 0 0 1.54 5.851L0 24l6.117-1.605a11.815 11.815 0 0 0 5.925 1.586h.005c6.632 0 12.028-5.396 12.033-12.03a11.85 11.85 0 0 0-3.353-8.541z"/>
          </svg>
        </div>
        
        {/* Tooltip */}
        <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
          Butuh Bantuan? Chat Admin
          {/* Arrow */}
          <div className="absolute left-full top-1/2 -translate-y-1/2 border-8 border-transparent border-l-slate-800"></div>
        </div>
      </div>
    </a>
  );
}
