'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  BookOpen, 
  Headphones,
  Users, 
  Settings, 
  Menu,
  ChevronLeft,
  Edit3,
  Mic,
  Package,
  CreditCard,
  History,
  List,
  Layers,
  ShoppingBag,
  Globe,
  Library,
  Target,
  Receipt,
  Bell,
  X
} from 'lucide-react';
import { useSidebar } from '@/app/context/SidebarContext';

const sidebarItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: Bell, label: 'Notifikasi', href: '/dashboard/admin-notifications', adminOnly: true },
  { icon: BookOpen, label: 'Readings', href: '/dashboard/readings', adminOnly: true },
  { icon: Headphones, label: 'Listening', href: '/dashboard/listening', adminOnly: true },
  { icon: Edit3, label: 'Writing', href: '/dashboard/writing', adminOnly: true },
  { icon: Mic, label: 'Speaking', href: '/dashboard/speaking', adminOnly: true },
  { icon: Package, label: 'Pakets', href: '/dashboard/pakets', adminOnly: true },
  { icon: List, label: 'Paket Category Master', href: '/dashboard/paket-category', adminOnly: true },
  { icon: Layers, label: 'Sub Paket Category Master', href: '/dashboard/sub-paket-category', adminOnly: true },
  { icon: History, label: 'History', href: '/dashboard/history', adminOnly: true },
  { icon: ShoppingBag, label: 'Paket Pembelian', href: '/dashboard/paket-pembelian', adminOnly: true },
  { icon: Globe, label: 'Landing Page Pakets', href: '/dashboard/landing-pakets', adminOnly: true },
  { icon: CreditCard, label: 'Pembelian User', href: '/dashboard/pembelian-user', adminOnly: true },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings', adminOnly: true },
  { icon: History, label: 'History', href: '/dashboard/history-user', userOnly: true },
  { icon: Library, label: 'Paket Saya', href: '/dashboard/paket-saya', userOnly: true },
  { icon: Target, label: 'Paket Latihan', href: '/dashboard/paket-latihan-user', userOnly: true },
  { icon: ShoppingBag, label: 'Paket Pembelian', href: '/dashboard/paket-pembelian-user', userOnly: true },
  { icon: Receipt, label: 'Riwayat Pembelian', href: '/dashboard/history-pembelian', userOnly: true },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const pathname = usePathname();
  const { isMobileOpen, setIsMobileOpen } = useSidebar();

  React.useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserRole(userData.role);
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }
  }, []);

  // Close mobile sidebar when pathname changes
  React.useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname, setIsMobileOpen]);

  const filteredItems = sidebarItems.filter(item => {
    if ((item as any).adminOnly && userRole !== 'admin') {
      return false;
    }
    if ((item as any).userOnly && userRole === 'admin') {
      return false;
    }
    return true;
  });

  return (
    <>
      {/* Backdrop for mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside 
        className={`bg-white border-r border-gray-200 h-screen transition-all duration-300 flex flex-col fixed inset-y-0 left-0 z-50 lg:relative lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          collapsed ? 'lg:w-20' : 'lg:w-64'
        } w-64`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {(!collapsed || isMobileOpen) && (
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {userRole === 'admin' ? 'Admin CBT' : 'CBT Online'}
            </span>
          )}
          
          <div className="flex items-center gap-1">
            {/* Desktop Collapse Button */}
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className={`hidden lg:flex p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors ${collapsed ? 'mx-auto' : ''}`}
              aria-label="Toggle Sidebar"
            >
              {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
            </button>

            {/* Mobile Close Button */}
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              aria-label="Close Sidebar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-2 px-3">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } ${(collapsed && !isMobileOpen) ? 'lg:justify-center' : ''}`}
              >
                <item.icon 
                  size={20} 
                  className={`${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} transition-colors ${(collapsed && !isMobileOpen) ? 'lg:min-w-5' : ''}`} 
                />
                {(!collapsed || isMobileOpen) && (
                  <span>{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
