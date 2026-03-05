'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap pb-2 md:pb-0 scrollbar-hide" aria-label="Breadcrumb">
      <Link 
        href="/dashboard"
        className="flex items-center hover:text-blue-600 transition-colors"
      >
        <Home size={16} />
      </Link>

      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={14} className="text-gray-400 shrink-0" />
          {item.active ? (
            <span className="font-semibold text-gray-900">
              {item.label}
            </span>
          ) : item.onClick ? (
            <button 
              onClick={item.onClick}
              className="hover:text-blue-600 transition-colors"
            >
              {item.label}
            </button>
          ) : item.href ? (
            <Link 
              href={item.href}
              className="hover:text-blue-600 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-500">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
