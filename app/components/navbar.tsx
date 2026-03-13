'use client';

import React, { useEffect, useState } from 'react';
import { Bell, LogOut, ChevronDown, Menu as MenuIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/app/lib/api';
import { useSidebar } from '@/app/context/SidebarContext';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
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
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 z-10 shrink-0">
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
        <button 
          onClick={() => router.push('/dashboard/notifications')}
          className="relative p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all group"
        >
          <Bell size={20} className="group-hover:scale-110 transition-transform" />
          {/* Notification Dot/Badge */}
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full ring-2 ring-white flex items-center justify-center animate-bounce shadow-sm">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        
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
                className="fixed inset-0 z-10" 
                onClick={() => setIsDropdownOpen(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
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
