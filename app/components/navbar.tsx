import React from 'react';
import { Bell, Search } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 shrink-0">
      {/* Search Bar */}
      <div className="flex bg-gray-50 items-center px-3 py-2 rounded-lg lg:w-96 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
        <Search size={18} className="text-gray-400 mr-2" />
        <input 
          type="text" 
          placeholder="Search anything..." 
          className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
        />
      </div>

      {/* Right Side Icons & Profile */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
          <Bell size={20} />
          {/* Notification Dot */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>
        
        {/* Divider */}
        <div className="h-6 w-px bg-gray-200 mx-2"></div>

        {/* User Profile */}
        <button className="flex items-center gap-3 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors text-left">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            AD
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-medium text-gray-700 text-sm leading-tight">Admin User</span>
            <span className="text-xs text-gray-500">Administrator</span>
          </div>
        </button>
      </div>
    </header>
  );
}
