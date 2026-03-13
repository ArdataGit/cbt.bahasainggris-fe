'use client';

import React, { useEffect, useState } from 'react';
import { Bell, LogOut, ChevronDown, Menu as MenuIcon, ShoppingBag, BookOpen, Info, Clock, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/app/lib/api';
import { useSidebar } from '@/app/context/SidebarContext';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState<'system' | 'admin'>('system');
  const { toggleMobileSidebar } = useSidebar();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        fetchNotifications();
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    }
    
    // Refresh notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await api.get('/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setUnreadCount(response.data.data.unreadCount);
        setNotifications(response.data.data.notifications.slice(0, 5)); // Only show latest 5 in dropdown
      }
    } catch (error: any) {
      console.error('Failed to fetch notifications:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Token invalid or expired - force re-login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login?redirect=' + window.location.pathname);
        }
      }
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await api.patch(`/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update local state
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
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
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'PURCHASE':
        return <ShoppingBag className="text-emerald-500" size={16} />;
      case 'TEST_COMPLETION':
        return <BookOpen className="text-blue-500" size={16} />;
      case 'ADMIN':
        return <Bell className="text-red-500" size={16} />;
      default:
        return <Info className="text-slate-400" size={16} />;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 z-[100] shrink-0">
      {/* Left side: Mobile Menu Toggle */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
          aria-label="Open Sidebar"
        >
          <MenuIcon size={24} />
        </button>
      </div>

      {/* Right Side Icons & Profile */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className={`relative p-2 rounded-xl transition-all group ${
              isNotificationOpen ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Bell size={20} className="group-hover:scale-110 transition-transform" />
            {/* Notification Dot/Badge */}
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full ring-2 ring-white flex items-center justify-center animate-bounce shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isNotificationOpen && (
            <>
              <div 
                className="fixed inset-0 z-[101] bg-transparent" 
                onClick={() => setIsNotificationOpen(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-[102] animate-in fade-in zoom-in duration-200 origin-top-right">
                <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-slate-50/50">
                  <h3 className="font-black uppercase italic tracking-tight text-slate-900 flex items-center gap-2">
                    <Bell size={16} className="text-blue-600" />
                    Notifikasi
                  </h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline"
                    >
                      Tandai Semua Dibaca
                    </button>
                  )}
                </div>

                {/* Tabs Switcher */}
                <div className="flex border-b border-gray-50 bg-white p-1">
                  <button 
                    onClick={() => setActiveTab('system')}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${
                      activeTab === 'system' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <span>Untuk Kamu</span>
                    {notifications.filter(n => n.type !== 'ADMIN' && !n.isRead).length > 0 && (
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    )}
                  </button>
                  <button 
                    onClick={() => setActiveTab('admin')}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${
                      activeTab === 'admin' ? 'bg-red-50 text-red-600' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <span>Update</span>
                    {notifications.filter(n => n.type === 'ADMIN' && !n.isRead).length > 0 && (
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    )}
                  </button>
                </div>
                
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.filter(n => activeTab === 'admin' ? n.type === 'ADMIN' : n.type !== 'ADMIN').length > 0 ? (
                    <div className="divide-y divide-gray-50">
                      {notifications
                        .filter(n => activeTab === 'admin' ? n.type === 'ADMIN' : n.type !== 'ADMIN')
                        .map((item) => (
                        <div 
                          key={item.id}
                          className={`p-4 flex gap-3 hover:bg-slate-50 transition-colors cursor-pointer group relative ${!item.isRead ? 'bg-blue-50/30' : ''}`}
                          onClick={() => {
                            if (!item.isRead) markAsRead(item.id);
                            // router.push('/dashboard/notifications');
                          }}
                        >
                          <div className={`mt-0.5 p-2 rounded-xl bg-white border border-slate-100 shadow-sm shrink-0 h-fit`}>
                            {getNotificationIcon(item.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-0.5">
                              <h4 className={`text-xs font-bold uppercase truncate pr-4 ${item.isRead ? 'text-slate-500' : 'text-slate-900'}`}>
                                {item.title}
                              </h4>
                              {!item.isRead && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0"></div>}
                            </div>
                            <p className={`text-[11px] line-clamp-2 leading-relaxed mb-1.5 ${item.isRead ? 'text-slate-400' : 'text-slate-600'}`}>
                              {item.message}
                            </p>
                            <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                              <Clock size={10} />
                              {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 text-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-3">
                        <Bell size={20} />
                      </div>
                      <p className="text-xs text-slate-400 font-bold italic text-center">Belum ada notifikasi baru.</p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => {
                    setIsNotificationOpen(false);
                    router.push('/dashboard/notifications');
                  }}
                  className="w-full p-3 text-xs font-black uppercase tracking-[0.2em] text-center text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition-all border-t border-gray-50"
                >
                  Lihat Semua
                </button>
              </div>
            </>
          )}
        </div>
        
        {/* Divider */}
        <div className="h-6 w-px bg-gray-100 mx-2"></div>

        {/* User Profile & Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {user ? getInitials(user.name) : 'AD'}
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-medium text-gray-700 text-sm leading-tight">
                {user ? user.name : 'Admin User'}
              </span>
              <span className="text-xs text-gray-500 capitalize">
                {user ? user.role : 'Administrator'}
              </span>
            </div>
            <ChevronDown size={16} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-[101] bg-transparent" 
                onClick={() => setIsDropdownOpen(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-[102] animate-in fade-in zoom-in duration-200 origin-top-right">
                <div className="px-4 py-2 border-b border-gray-50 md:hidden">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin User'}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role || 'Administrator'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
