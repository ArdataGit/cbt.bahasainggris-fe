'use client';

import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, ShoppingBag, BookOpen, Clock, Check, Trash2, Info } from 'lucide-react';
import api from '@/app/lib/api';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await api.get('/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setNotifications(response.data.data.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await api.patch(`/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await api.patch('/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'PURCHASE':
        return <ShoppingBag className="text-emerald-500" size={20} />;
      case 'TEST_COMPLETION':
        return <BookOpen className="text-blue-500" size={20} />;
      default:
        return <Info className="text-slate-400" size={20} />;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Notifikasi</h1>
          <p className="text-slate-500 font-medium">Informasi terbaru mengenai aktivitas Anda</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button 
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-100 transition-all border border-blue-100"
          >
            <Check size={14} />
            Tandai Semua Dibaca
          </button>
        )}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-400 font-medium italic">Memuat notifikasi...</p>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((item) => (
            <div 
              key={item.id} 
              className={`flex items-start gap-4 p-5 rounded-3xl border transition-all cursor-pointer group ${
                item.isRead 
                  ? 'bg-white border-slate-100 opacity-70' 
                  : 'bg-slate-50 border-blue-100 shadow-sm hover:shadow-md hover:bg-white active:scale-[0.99]'
              }`}
              onClick={() => !item.isRead && markAsRead(item.id)}
            >
              <div className={`mt-1 p-3 rounded-2xl bg-white border border-slate-100 group-hover:scale-110 transition-transform shadow-sm`}>
                {getIcon(item.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-black uppercase italic tracking-tight ${item.isRead ? 'text-slate-500' : 'text-slate-900'}`}>
                    {item.title}
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Clock size={12} />
                    {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <p className={`text-sm leading-relaxed ${item.isRead ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                  {item.message}
                </p>
              </div>
              {!item.isRead && (
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-2 shadow-lg shadow-blue-500/50"></div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-4 shadow-sm">
              <Bell size={24} />
            </div>
            <p className="text-slate-400 font-bold italic">Belum ada notifikasi baru.</p>
          </div>
        )}
      </div>
    </div>
  );
}
