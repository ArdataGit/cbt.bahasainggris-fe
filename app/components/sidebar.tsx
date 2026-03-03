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
  { icon: BookOpen, label: 'Readings', href: '/dashboard/readings' },
  { icon: Headphones, label: 'Listening', href: '/dashboard/listening' },
  { icon: Edit3, label: 'Writing', href: '/dashboard/writing' },
  { icon: Mic, label: 'Speaking', href: '/dashboard/speaking' },
  { icon: Package, label: 'Pakets', href: '/dashboard/pakets' },
  { icon: Users, label: 'Users', href: '/dashboard/users' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

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
            Admin CBT
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
        {sidebarItems.map((item) => {
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
