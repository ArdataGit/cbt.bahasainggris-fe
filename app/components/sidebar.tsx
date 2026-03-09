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
  Package
} from 'lucide-react';

const sidebarItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: BookOpen, label: 'Readings', href: '/dashboard/readings', adminOnly: true },
  { icon: Headphones, label: 'Listening', href: '/dashboard/listening', adminOnly: true },
  { icon: Edit3, label: 'Writing', href: '/dashboard/writing', adminOnly: true },
  { icon: Mic, label: 'Speaking', href: '/dashboard/speaking', adminOnly: true },
  { icon: Package, label: 'Pakets', href: '/dashboard/pakets', adminOnly: true },
  { icon: Package, label: 'Paket Category Master', href: '/dashboard/paket-category', adminOnly: true },
  { icon: Package, label: 'Sub Paket Category Master', href: '/dashboard/sub-paket-category', adminOnly: true },
  { icon: Users, label: 'History', href: '/dashboard/history', adminOnly: true },
  { icon: Package, label: 'Paket Pembelian', href: '/dashboard/paket-pembelian', adminOnly: true },
  { icon: Package, label: 'Landing Page Pakets', href: '/dashboard/landing-pakets', adminOnly: true },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings', adminOnly: true },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const pathname = usePathname();

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

  const filteredItems = sidebarItems.filter(item => {
    if (item.adminOnly && userRole !== 'admin') {
      return false;
    }
    return true;
  });

  return (
    <aside 
      className={`bg-white border-r border-gray-200 h-screen transition-all duration-300 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {!collapsed && (
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {userRole === 'admin' ? 'Admin CBT' : 'CBT Online'}
          </span>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={`p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors ${collapsed ? 'mx-auto' : ''}`}
          aria-label="Toggle Sidebar"
        >
          {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
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
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <item.icon 
                size={20} 
                className={`${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} transition-colors ${collapsed ? 'min-w-5' : ''}`} 
              />
              {!collapsed && (
                <span>{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
